"use client";

import { Sender } from "@/types/MessageType";
import React, { createContext, useContext } from "react";

interface ChatContextValue {
  handleMessageAction: (
    text: string,
    sender: Sender,
    id?: string,
    isComplete?: boolean
  ) => Promise<void>;
}

// Provide empty function as default value
const defaultHandleMessageAction = async () => {};

const ChatContext = createContext<ChatContextValue>({
  handleMessageAction: defaultHandleMessageAction
});

export const useChatContext = () => useContext(ChatContext);

interface ChatProviderProps {
  handleMessageAction: (
    text: string,
    sender: Sender,
    id?: string,
    isComplete?: boolean
  ) => Promise<void>;
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
