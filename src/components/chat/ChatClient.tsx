"use client";

import { useState } from "react";

import ChatInput from "./ChatInput";
import ChatMessages from "./messages/ChatMessages";
import { MessageType, Sender } from "@/types/MessageType";
import useChatStatus from "@/stores/chatStatus";
import { ChatProvider } from "@/contexts/ChatContext";

export default function ChatClient() {
  const { isLoading, setIsLoading, isStreaming, setIsStreaming } =
    useChatStatus((state) => ({
      isLoading: state.isLoading,
      setIsLoading: state.setIsLoading,
      isStreaming: state.isStreaming,
      setIsStreaming: state.setIsStreaming
    }));

  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      sender: Sender.BOT,
      contents: { content: "안녕하세요. 무엇을 도와드릴까요?" },
      isComplete: true
    }
  ]);

  const addMessage = (newMessage: MessageType) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleMessageAction = async (message: string, sender: Sender) => {
    const newMessage: MessageType = {
      id: "2",
      sender: Sender.BOT,
      contents: { content: message },
      isComplete: true
    };
    addMessage(newMessage);
  };

  return (
    <ChatProvider handleMessageAction={handleMessageAction}>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <ChatMessages messages={messages} />
          <ChatInput handleMessageAction={handleMessageAction} />
        </div>
      </div>
    </ChatProvider>
  );
}
