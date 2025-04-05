"use client";

import React from "react";

import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { MessageType } from "@/types/MessageType";

interface ChatMessageProps {
  message: any;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.sender === MessageType.BOT) {
    return <BotMessage message={message} />;
  } else {
    return <UserMessage message={message} />;
  }
}
