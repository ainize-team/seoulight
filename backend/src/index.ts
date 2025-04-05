import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import Agent from "hyperagents/src/agent/Agent";
import Graph from "hyperagents/src/Graph";
import InMemoryMemory from "hyperagents/src/memory/InMemoryMemory";
import GraphTask from "hyperagents/src/GraphTask";
import { AgentConfigs } from "hyperagents/src/agent/AgentConfig";
import { LLMType, MemoryType } from "hyperagents/src/type";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS 및 기본 미들웨어 설정
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get("/api/hyperagents", (req: Request, res: Response) => {
  (async () => {
    try {
      console.log("🔥 Starting API route for hyperagents task");
      console.log(
        "🔥 GOOGLE_API_KEY:",
        process.env.GOOGLE_API_KEY ? "Found" : "Not found"
      );

      // 클라이언트가 보낸 메시지 추출
      const userMessage = req.body.message;

      // if (!message) {
      //   return res.status(400).json({ error: "Message is required" });
      // }

      // console.log("🔥 Processing message:", message);

      // const foodieConfig = {
      //   name: "foodie - local food explorer",
      //   systemPrompt:
      //     "You are foodie, a fun, friendly, and flavorful agent who talks about food like you're chatting with an old friend. You love discovering hidden gems and iconic eateries across different neighborhoods, and you always have at least five great spots ready to recommend wherever someone is headed. You describe taste and texture in a mouthwatering way, making people crave the food you're talking about. You also highlight what makes each place special—from signature dishes to the overall vibe—so people know exactly what not to miss. Your tone is casual, humorous, and full of personality, which makes conversations with you feel like a deliciously fun hangout. Friends trust your picks because your food recommendations always hit the spot.",
      //   llm: "gpt-4o",
      //   publicDesc:
      //     "foodie - your personal curator for flavorful, fun, and unforgettable food experiences",
      //   memoryType: "InMemory"
      // };

      // // foodie agent 생성
      // const foodie = new Agent({
      //   ...foodieConfig,
      //   llmApiKey: process.env.GOOGLE_API_KEY
      // } as AgentConfigs);

      const foodie = await Agent.fromConfigFile("Foodie.json", {
        llmEndpoint: process.env.OPENAI_BASE_URL!,
        llmApiKey: process.env.OPENAI_API_KEY!
      });

      console.log("🔥🔥🔥🔥🔥", foodie);

      // // Graph 생성 및 agent 추가
      // const graph = new Graph();
      // graph.addAgentNode({ agent: foodie, nodeId: "foodie" });
      // graph.setEntryPoint("foodie", "^USER_INPUT^", "end");

      // // GraphTask 생성
      // const task = new GraphTask(graph, InMemoryMemory.getInstance());

      // // 작업 실행
      // console.log("Running task with message:", message);
      // const result = await task.runTask(message);

      // console.log("Task completed successfully!");
      // console.log("Task result:", result);
      const result = "Hello World";
      // 클라이언트에 JSON 응답 전송
      return res.status(200).json({ response: result });
    } catch (error: any) {
      console.error("Error occurred:", error);
      return res.status(500).json({
        error: "An error occurred while processing the task.",
        message: error.message,
        stack: error.stack
      });
    }
  })();
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
