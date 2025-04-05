import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 은마왕만두 메뉴 가격 (SOL 기준)
const menuPrices = {
  gogiWangMandu: 0.0454,
  gogiMandu: 0.0341,
  saeuMandu: 0.0454
};

// 매장 고정 지갑 주소
const STORE_WALLET = "J93LrgHsuiRTxJCbNgnmxTPJRh8y2VGzETfndWUEmdUR";

const server = new McpServer({
  name: "eunma-wangmandu-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {}
  }
});

// 은마왕만두 결제 Tool 등록
server.tool(
  "eunma-wangmandu-payment",
  "Pay for dumplings at Eunma Wang Mandu using Solana",
  {
    order: z.object({
      gogiWangMandu: z
        .number()
        .int()
        .min(0)
        .describe("Number of Gogi Wang Mandu (₩8000 / 0.0454 SOL each)"),
      gogiMandu: z
        .number()
        .int()
        .min(0)
        .describe("Number of Gogi Mandu (₩6000 / 0.0341 SOL each)"),
      saeuMandu: z
        .number()
        .int()
        .min(0)
        .describe("Number of Saeu Mandu (₩8000 / 0.0454 SOL each)")
    })
  },
  async ({ order }) => {
    const { SolanaAgentKit } = await import("solana-agent-kit");
    const { PublicKey } = await import("@solana/web3.js");

    const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;
    const RPC_URL = process.env.RPC_URL;

    const agent = new SolanaAgentKit(PRIVATE_KEY!, RPC_URL!, {});
    const recipientPubKey = new PublicKey(STORE_WALLET);

    const total =
      menuPrices.gogiWangMandu * order.gogiWangMandu +
      menuPrices.gogiMandu * order.gogiMandu +
      menuPrices.saeuMandu * order.saeuMandu;

    if (total <= 0) {
      return {
        content: [
          {
            type: "text",
            text: `No items selected. Please choose at least one menu item.`
          }
        ]
      };
    }

    const result = await agent.transfer(recipientPubKey, total);

    return {
      content: [
        {
          type: "text",
          text: `✅ Payment successful!\n\nItems Ordered:\n- Gogi Wang Mandu: ${order.gogiWangMandu}\n- Gogi Mandu: ${order.gogiMandu}\n- Saeu Mandu: ${order.saeuMandu}\n\nTotal: ${total.toFixed(4)} SOL\n\nTransaction:\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }
);

// MCP 서버 실행
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Eunma Wang Mandu MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
