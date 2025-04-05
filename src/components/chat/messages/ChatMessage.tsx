"use client";

import React from "react";

import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { Sender } from "@/types/MessageType";

interface ChatMessageProps {
  message: any;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.sender !== Sender.USER) {
    return <BotMessage message={message} />;
  } else {
    return <UserMessage message={message} />;
  }
}
