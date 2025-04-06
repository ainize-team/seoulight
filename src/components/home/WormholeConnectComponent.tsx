"use client";

import WormholeConnect, {
  WormholeConnectConfig,
  WormholeConnectTheme
} from "@wormhole-foundation/wormhole-connect";
import { wormhole } from "@wormhole-foundation/sdk";
import solana from "@wormhole-foundation/sdk/solana";

export default function WormholeConnectComponent() {
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

  return <WormholeConnect config={config} theme={theme} />;
}
