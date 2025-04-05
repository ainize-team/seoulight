export interface ToolResult {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

// Generate a unique session ID
function generateSessionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Store the session ID in memory
const SESSION_ID = generateSessionId();
export async function connectToServer(
  apiKey: string,
  serverPath: string
): Promise<string> {
  try {
    const response = await fetch("/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "connect",
        sessionId: SESSION_ID,
        apiKey,
        serverPath
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to connect to server");
    }

    return data.message;
  } catch (error) {
    throw new Error(
      `Connection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function disconnectFromServer(): Promise<string> {
  try {
    const response = await fetch("/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "disconnect",
        sessionId: SESSION_ID
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to disconnect from server");
    }

    return data.message;
  } catch (error) {
    throw new Error(
      `Disconnection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function processQuery(
  apiKey: string,
  query: string
): Promise<{ response: string; toolCalls: ToolResult[] }> {
  try {
    const response = await fetch("/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "query",
        sessionId: SESSION_ID,
        apiKey,
        query
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to process query");
    }

    return {
      response: data.response,
      toolCalls: data.toolCalls
    };
  } catch (error) {
    throw new Error(
      `Query processing failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
