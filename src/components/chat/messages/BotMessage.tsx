import { BotMessageType } from "@/types/MessageType";
import Image from "next/image";
import MessageRenderer from "./MessageRenderer";

interface BotMessageProps {
  message: BotMessageType;
}

export default function BotMessage({ message }: BotMessageProps) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center">
        <Image
          src="/images/agent-profile/Muzie.png"
          alt="Agent profile"
          width={32}
          height={32}
          className="flex-shrink-0 rounded-full"
        />
        <span className="ml-2 font-semibold">Muzie</span>
      </div>
      <div>
        <MessageRenderer message={message.contents} />
      </div>
    </div>
  );
}
