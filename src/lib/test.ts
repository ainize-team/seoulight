// import { LLMType, MemoryType } from "hyperagents/src/type";
// import dotenv from "dotenv";
// import Agent from "hyperagents/src/agent/Agent";
// import Graph from "hyperagents/src/Graph";
// import InMemoryMemory from "hyperagents/src/memory/InMemoryMemory";
// import GraphTask from "hyperagents/src/GraphTask";
// import { AgentConfigs } from "hyperagents/src/agent/AgentConfig";
// dotenv.config();
// console.log("🔥 foodieConfig", foodieConfig);
// console.log("🔥 Starting test script");
// console.log(
//   "🔥 GOOGLE_API_KEY:",
//   process.env.GOOGLE_API_KEY ? "Found" : "Not found"
// );

// // Use dynamic imports to load the hyperagents modules
// (async () => {
//   try {
//     const foodieConfig = {
//       name: "foodie - local food explorer",
//       systemPrompt:
//         "You are foodie, a fun, friendly, and flavorful agent who talks about food like you’re chatting with an old friend. You love discovering hidden gems and iconic eateries across different neighborhoods, and you always have at least five great spots ready to recommend wherever someone is headed. You describe taste and texture in a mouthwatering way, making people crave the food you're talking about. You also highlight what makes each place special—from signature dishes to the overall vibe—so people know exactly what not to miss. Your tone is casual, humorous, and full of personality, which makes conversations with you feel like a deliciously fun hangout. Friends trust your picks because your food recommendations always hit the spot.",
//       llm: LLMType.GEMINI_1_5_FLASH,
//       publicDesc:
//         "foodie - your personal curator for flavorful, fun, and unforgettable food experiences",
//       memoryType: MemoryType.inMemory
//     };
//     const foodie = new Agent({
//       ...foodieConfig,
//       llmApiKey: process.env.GOOGLE_API_KEY
//     } as AgentConfigs);

//     // Create the graph
//     const graph = new Graph();
//     graph.addAgentNode({ agent: foodie, nodeId: "foodie" });
//     graph.setEntryPoint("foodie", `^USER_INPUT^`, "end");

//     // Create the task
//     const task = new GraphTask(graph, InMemoryMemory.getInstance());

//     // Run the task
//     console.log("Running task...");
//     const result = await task.runTask(
//       "Can you recommend some good places to visit in Seoul?"
//     );

//     // Process the result
//     console.log("Task completed successfully!");
//     console.log("Task result:", result);
//   } catch (error) {
//     console.error("Error occurred:", error);
//   }
// })();
