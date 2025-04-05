import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Predefined server paths
const SERVER_PATHS = {
  TEST: process.env.NEXT_PUBLIC_SERVER_PATH!
};

// Store active MCP connections
type MCPConnection = {
  client: Client;
  transport: StdioClientTransport;
  tools: any[];
  serverPath: string;
};

// Use a Map to store connections by session ID
const connections = new Map<string, MCPConnection>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, sessionId, apiKey, serverPath, query } = body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    switch (action) {
      case "connect":
        return await handleConnect(sessionId, serverPath);
      case "disconnect":
        return await handleDisconnect(sessionId);
      case "query":
        return await handleQuery(sessionId, apiKey, query);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("MCP API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function handleConnect(sessionId: string, serverPath: string) {
  if (!serverPath) {
    return NextResponse.json(
      { error: "Server path is required" },
      { status: 400 }
    );
  }

  // Check if this is a known server key
  const actualPath = serverPath.startsWith("$")
    ? SERVER_PATHS[serverPath.substring(1) as keyof typeof SERVER_PATHS] ||
      serverPath
    : serverPath;

  if (!actualPath) {
    return NextResponse.json(
      { error: `Server path not found for key: ${serverPath}` },
      { status: 400 }
    );
  }

  // Disconnect existing connection if it exists
  if (connections.has(sessionId)) {
    await handleDisconnect(sessionId);
  }

  try {
    const isJs = actualPath.endsWith(".js");
    const isPy = actualPath.endsWith(".py");

    if (!isJs && !isPy) {
      return NextResponse.json(
        { error: "Server script must be a .js or .py file" },
        { status: 400 }
      );
    }

    const command = isPy
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;

    const transport = new StdioClientTransport({
      command,
      args: [actualPath]
    });

    const client = new Client({ name: "mcp-client-nextjs", version: "1.0.0" });
    client.connect(transport);

    const toolsResult = await client.listTools();
    const tools = toolsResult.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema
    }));

    connections.set(sessionId, {
      client,
      transport,
      tools,
      serverPath: actualPath
    });

    return NextResponse.json({
      success: true,
      message: `Connected to server with tools: ${tools.map(({ name }) => name).join(", ")}`,
      tools
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    );
  }
}

async function handleDisconnect(sessionId: string) {
  const connection = connections.get(sessionId);
  if (!connection) {
    return NextResponse.json({
      success: true,
      message: "No active connection"
    });
  }

  try {
    await connection.client.close();
    connections.delete(sessionId);
    return NextResponse.json({
      success: true,
      message: "Disconnected successfully"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    );
  }
}

async function handleQuery(sessionId: string, apiKey: string, query: string) {
  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const connection = connections.get(sessionId);
  if (!connection) {
    return NextResponse.json(
      { error: "No active connection. Connect to a server first." },
      { status: 400 }
    );
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const messages: MessageParam[] = [
      {
        role: "user",
        content: query
      }
    ];

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: connection.tools
    });

    const finalText: string[] = [];
    const toolCalls: Array<{
      name: string;
      args: Record<string, unknown>;
      result: unknown;
    }> = [];

    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as Record<string, unknown> | undefined;

        const result = await connection.client.callTool({
          name: toolName,
          arguments: toolArgs
        });

        toolCalls.push({
          name: toolName,
          args: toolArgs || {},
          result: result.content
        });

        // Create a unique ID for this tool call
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

        // Add tool_result immediately after tool_use
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

        const followUpResponse = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages
        });

        if (followUpResponse.content[0].type === "text") {
          finalText.push(followUpResponse.content[0].text);
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: finalText.join("\n"),
      toolCalls
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to process query: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    );
  }
}
