"use client";

import { useMCP } from "@/lib/mcp-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const serverPath = process.env.NEXT_PUBLIC_SERVER_PATH!;
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    connectToServer,
    disconnect,
    serverStatus,
    connectionMessage,
    error
  } = useMCP();

  const handleConnect = async () => {
    if (!serverPath.trim() || isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      await connectToServer(serverPath);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  useEffect(() => {
    if (serverStatus === "disconnected") {
      handleConnect();
    }
  }, [serverStatus]);

  return (
    <div
      className={cn(
        "size-2 rounded-full",
        serverStatus === "connected" ? "bg-green-300" : "bg-red-400"
      )}
    />
  );
}
