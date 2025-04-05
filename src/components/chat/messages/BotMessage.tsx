"use client";

import { BotSender } from "@/types/MessageType";

interface BotMessageProps {
  message: BotSender;
}

export default function BotMessage({ message }: BotMessageProps) {
  return <div>BotMessage</div>;
}
