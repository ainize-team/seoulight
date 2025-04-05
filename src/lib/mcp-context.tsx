"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  ToolResult,
  connectToServer,
  disconnectFromServer,
  processQuery
} from "./mcp-client-api";

interface MCPContextType {
  serverStatus: "disconnected" | "connecting" | "connected" | "error";
  connectionMessage: string;
  connectToServer: (serverPath: string) => Promise<void>;
  processQuery: (
    query: string
  ) => Promise<{ response: string; toolCalls: ToolResult[] }>;
  disconnect: () => Promise<void>;
  error: Error | null;
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

interface MCPProviderProps {
  apiKey: string;
  children: ReactNode;
}

export function MCPProvider({ apiKey, children }: MCPProviderProps) {
  const [serverStatus, setServerStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const handleConnectToServer = async (serverPath: string) => {
    try {
      setServerStatus("connecting");
      setError(null);
      const message = await connectToServer(apiKey, serverPath);
      setConnectionMessage(message);
      setServerStatus("connected");
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to connect to server")
      );
      setServerStatus("error");
    }
  };

  const handleProcessQuery = async (query: string) => {
    if (serverStatus !== "connected") {
      throw new Error("Not connected to MCP server");
    }

    try {
      return await processQuery(apiKey, query);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error processing query")
      );
      throw err;
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFromServer();
      setServerStatus("disconnected");
      setConnectionMessage("");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to disconnect"));
    }
  };

  return (
    <MCPContext.Provider
      value={{
        serverStatus,
        connectionMessage,
        connectToServer: handleConnectToServer,
        processQuery: handleProcessQuery,
        disconnect: handleDisconnect,
        error
      }}
    >
      {children}
    </MCPContext.Provider>
  );
}

export function useMCP() {
  const context = useContext(MCPContext);
  if (context === undefined) {
    throw new Error("useMCP must be used within an MCPProvider");
  }
  return context;
}
