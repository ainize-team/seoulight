"use client";

import Image from "next/image";
import Link from "next/link";
import useChatStatus from "@/stores/chatStatus";

import { agentImage } from "@/constants/agentImage";

interface EntranceCardProps {
  title: string;
  category: string;
  agent: string;
  imageUrl: string;
  userMessage: string;
}

export default function EntranceCard({
  title,
  category,
  agent,
  imageUrl,
  userMessage
}: EntranceCardProps) {
  const { setIsLoading, setIsStreaming } = useChatStatus();

  const handleCardClick = () => {
    sessionStorage.setItem("chatInput", title);

    // Reset the loading status when navigating to chat
    setIsLoading(false);
    setIsStreaming(false);
  };

  return (
    <Link
      href={"/chat"}
      onClick={handleCardClick}
      className="flex cursor-pointer items-center overflow-hidden rounded-lg bg-[#fbf9f7] p-2 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)]"
    >
      <div className="flex-1 pl-4">
        <div className="text-xs font-medium leading-snug text-[#9c9c9c]">
          {category}
        </div>
        <div className="mt-1 text-sm font-medium leading-snug text-black">
          {title}
        </div>
      </div>
      <div className="relative ml-8 flex-shrink-0">
        <Image
          src={imageUrl}
          alt="Main Image"
          width={68}
          height={68}
          className="rounded-md"
        />
        <div className="absolute -bottom-1 -right-1">
          <Image
            src={agentImage[agent]}
            alt="Agent Profile"
            width={30}
            height={30}
            className="rounded-full border-2 border-[#fbf9f7]"
          />
        </div>
      </div>
    </Link>
  );
}
