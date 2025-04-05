"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";

import WormholeConnect, {
  WormholeConnectConfig,
  WormholeConnectTheme
} from "@wormhole-foundation/wormhole-connect";
import { wormhole } from "@wormhole-foundation/sdk";
import solana from "@wormhole-foundation/sdk/solana";
import UpArrowIcon from "@/icons/UpArrowIcon";

interface FormValues {
  message: string;
}

export default function HomeInput() {
  const { register, handleSubmit, watch } = useForm<FormValues>();
  const message = watch("message") || "";

  const onSubmit = (data: FormValues) => {
    // console.log(data.message);
  };
  const config: WormholeConnectConfig = {
    network: "Testnet",
    chains: [
      "Solana",
      "Sepolia",
      "BaseSepolia",
      "ArbitrumSepolia",
      "Ethereum",
      "OptimismSepolia"
    ],
    rpcs: {
      Sepolia: process.env.NEXT_PUBLIC_ETH_RPC,
      Ethereum: process.env.NEXT_PUBLIC_ETH_RPC,
      Solana: process.env.NEXT_PUBLIC_SOL_RPC
    },
    ui: {
      title: "ArbitUumSepoliaI CoBasenepnei TS Demo"
    }
  };

  const theme: WormholeConnectTheme = {
    mode: "light",
    primary: "#78c4b6"
  };

  return (
    <div className="w-full">
      {/* <WormholeConnect config={config} theme={theme} /> */}
      <p className="justify-center py-4 text-center font-['Noto_Sans_KR'] text-sm font-medium leading-relaxed text-[#21242e]">
        SeouLight
      </p>
      <Image
        src="/images/mainImage.png"
        alt="logo"
        width={82}
        height={96}
        className="mx-auto"
      />
      <p className="mb-8 mt-3 justify-start text-center font-['Pretendard'] text-lg font-medium leading-relaxed text-[#302f2a]">
        See more than sights. Feel the culture
      </p>
      <div className="relative h-[104px] overflow-hidden rounded-[10px] border border-[#dfdfdf] bg-white">
        <input
          type="text"
          className="absolute inset-0 h-full w-full pb-3 pl-4 pr-12 pt-2 text-[15px] text-[#302f2a] outline-none placeholder:font-normal placeholder:text-[#8c8c8c]"
          placeholder="Ask anything. I'll light the way."
          {...register("message")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(onSubmit)();
            }
          }}
        />
        <button
          className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full border border-transparent ${
            message.trim()
              ? "bg-[#363534] hover:bg-gray-800"
              : "bg-[#e8e7e6] text-gray-500"
          }`}
          onClick={handleSubmit(onSubmit)}
        >
          {message.trim() ? (
            <UpArrowIcon color="#FFF" />
          ) : (
            <UpArrowIcon color="#2F333B" />
          )}
        </button>
      </div>
    </div>
  );
}
