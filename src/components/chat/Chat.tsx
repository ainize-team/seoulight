"use client";

import { useState } from "react";

import ChatMessages from "./messages/ChatMessages";
import { Message, MessageType } from "@/types/MessageType";

export default function Chat() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: MessageType.BOT,
      contents: { content: "안녕하세요. 무엇을 도와드릴까요?" },
      isComplete: true
    }
  ]);

  return <ChatMessages messages={messages} isLoading={isLoading} />;
}
