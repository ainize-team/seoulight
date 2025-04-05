"use client";

import { useState } from "react";

import ChatMessages from "./messages/ChatMessages";
import { BotMessageType, MessageType, Sender } from "@/types/MessageType";
import ChatInput from "./ChatInput";

export default function ChatClient() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const handleMessage = (message: string, sender: Sender) => {
    const newMessage: MessageType = {
      id: "2",
      sender: Sender.BOT,
      contents: { content: message },
      isComplete: true
    };
    addMessage(newMessage);
  };
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput handleMessageAction={handleMessage} />
      </div>
    </div>
  );
}
