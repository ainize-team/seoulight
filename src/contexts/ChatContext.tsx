"use client";

import { Sender } from "@/types/MessageType";
import React, { createContext, useContext } from "react";

interface ChatContextValue {
  handleMessageAction: (text: string, sender: Sender) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  handleMessageAction: (text: string, sender: Sender) => Promise<void>;
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  handleMessageAction,
  children
}) => {
  return (
    <ChatContext.Provider value={{ handleMessageAction }}>
      {children}
    </ChatContext.Provider>
  );
};
