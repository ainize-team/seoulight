// import type { NextApiRequest, NextApiResponse } from 'next';
// import Agent from 'hyperagents/src/agent/Agent';
// import Graph from 'hyperagents/src/Graph';
// import InMemoryMemory from 'hyperagents/src/memory/InMemoryMemory';
// import GraphTask from 'hyperagents/src/GraphTask';
// import { LLMType, MemoryType } from 'hyperagents/src/type';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(request: NextRequest) {
//   try {
//     console.log("🔥 Starting API route for hyperagents task");
//     console.log("🔥 GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Found" : "Not found");

//     // 요청 본문에서 메시지 추출
//     const body = await request.json();
//     const { message } = body;

//     if (!message) {
//       return NextResponse.json(
//         { error: "Message is required" },
//         { status: 400 }
//       );
//     }

//     console.log("🔥 Processing message:", message);

//     const foodieConfig = {
//       "name": "foodie - local food explorer",
//       "systemPrompt": "You are foodie, a fun, friendly, and flavorful agent who talks about food like you're chatting with an old friend. You love discovering hidden gems and iconic eateries across different neighborhoods, and you always have at least five great spots ready to recommend wherever someone is headed. You describe taste and texture in a mouthwatering way, making people crave the food you're talking about. You also highlight what makes each place special—from signature dishes to the overall vibe—so people know exactly what not to miss. Your tone is casual, humorous, and full of personality, which makes conversations with you feel like a deliciously fun hangout. Friends trust your picks because your food recommendations always hit the spot.",
//       "llm": LLMType.GEMINI_1_5_FLASH,
//       "publicDesc": "foodie - your personal curator for flavorful, fun, and unforgettable food experiences",
//       "memoryType": MemoryType.inMemory
//     }
//     // foodie agent 생성
//     const foodie = new Agent({
//       ...foodieConfig,
//       llmApiKey: process.env.GOOGLE_API_KEY,
//     });

//     // Graph 생성 및 agent 추가
//     const graph = new Graph();
//     graph.addAgentNode({ agent: foodie, nodeId: "foodie" });
//     graph.setEntryPoint("foodie", '^USER_INPUT^', "end");

//     // GraphTask 생성
//     const task = new GraphTask(graph, InMemoryMemory.getInstance());

//     // 작업 실행
//     console.log("Running task with message:", message);
//     const result = await task.runTask(message);

//     console.log("Task completed successfully!");
//     console.log("Task result:", result);

//     // 클라이언트에 JSON 응답 전송
//     return NextResponse.json({ response: result });
//   } catch (error: any) {
//     console.error("Error occurred:", error);
//     return NextResponse.json(
//       {
//         error: "An error occurred while processing the task.",
//         message: error.message,
//         stack: error.stack
//       },
//       { status: 500 }
//     );
//   }
// }
