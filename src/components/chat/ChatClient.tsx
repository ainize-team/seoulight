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
    setIsLoading(true);
    if (sender === Sender.USER) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        sender: Sender.USER,
        message: message
      };
      addMessage(userMessage);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();

      // 봇 응답 추가
      const botResponse: MessageType = {
        id: Date.now().toString(),
        sender: Sender.BOT,
        contents: { content: data.response },
        isComplete: true
      };
      addMessage(botResponse);
    } catch (error: any) {
      console.error("Error occurred:", error);
      // 오류 발생 시 오류 메시지 표시
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        sender: Sender.BOT,
        contents: {
          content: `죄송합니다. ${error.message || "요청을 처리하는 중 오류가 발생했습니다."}`
        },
        isComplete: true
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
