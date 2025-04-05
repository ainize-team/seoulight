import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface ToolResult {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

export class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];
  private isConnected = false;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
    this.mcp = new Client({ name: "mcp-client-nextjs", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string): Promise<string> {
    try {
      if (this.isConnected) {
        return "Already connected to MCP server";
      }

      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }

      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath]
      });

      this.mcp.connect(this.transport);
      const toolsResult = await this.mcp.listTools();

      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema
        };
      });

      this.isConnected = true;
      return `Connected to server with tools: ${this.tools.map(({ name }) => name).join(", ")}`;
    } catch (e) {
      const errorMessage = `Failed to connect to MCP server: ${
        e instanceof Error ? e.message : String(e)
      }`;
      throw new Error(errorMessage);
    }
  }

  async processQuery(query: string): Promise<{
    response: string;
    toolCalls: ToolResult[];
  }> {
    if (!this.isConnected) {
      throw new Error("Not connected to MCP server. Connect first.");
    }

    const messages: MessageParam[] = [
      {
        role: "user",
        content: query
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: this.tools
    });

    const finalText: string[] = [];
    const toolResults: ToolResult[] = [];

    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as Record<string, unknown> | undefined;

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs
        });

        toolResults.push({
          name: toolName,
          args: toolArgs || {},
          result: result.content
        });

        const toolId = `${toolName}-${Date.now()}`;

        messages.push({
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: toolId,
              name: toolName,
              input: toolArgs
            }
          ]
        });

        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolId,
              content: result.content as string
            }
          ]
        });

        const followUpResponse = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages
        });

        if (followUpResponse.content[0].type === "text") {
          finalText.push(followUpResponse.content[0].text);
        }
      }
    }

    return {
      response: finalText.join("\n"),
      toolCalls: toolResults
    };
  }

  async cleanup(): Promise<void> {
    if (this.isConnected) {
      await this.mcp.close();
      this.isConnected = false;
    }
  }

  isServerConnected(): boolean {
    return this.isConnected;
  }

  getAvailableTools(): Tool[] {
    return [...this.tools];
  }
}
