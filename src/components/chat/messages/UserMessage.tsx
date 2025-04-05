"use client";

import { UserMessageType } from "@/types/MessageType";

export default function UserMessage({ message }: { message: UserMessageType }) {
  return (
    <div className="my-5 flex w-full">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#c7bba7] text-sm font-bold text-white">
          Me
        </div>
        <div className="rounded-lg text-black">{message.message}</div>
      </div>
    </div>
  );
}
