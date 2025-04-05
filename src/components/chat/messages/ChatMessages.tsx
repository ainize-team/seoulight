"use client";

import { useEffect, useRef } from "react";

import ChatMessage from "./ChatMessage";
import LoadingText from "../LoadingText";
import useChatStatus from "@/stores/chatStatus";

interface ChatMessagesProps {
  messages: any[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { isLoading } = useChatStatus((state) => ({
    isLoading: state.isLoading
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto p-5">
      <div className="flex w-full flex-col gap-5">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>
      {isLoading && (
        <div className="mt-1 self-start pl-4">
          <LoadingText />
        </div>
      )}
      <div ref={messagesEndRef}></div>
    </div>
  );
}
