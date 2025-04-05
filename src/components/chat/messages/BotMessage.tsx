"use client";

import { BotMessageType } from "@/types/MessageType";

interface BotMessageProps {
  message: BotMessageType;
}

export default function BotMessage({ message }: BotMessageProps) {
  return <div>BotMessage</div>;
}
