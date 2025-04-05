import dotenv from "dotenv";
import Agent from "hyperagents/src/agent/Agent";
import Graph from "hyperagents/src/Graph";
import InMemoryMemory from "hyperagents/src/memory/InMemoryMemory";
import GraphTask from "hyperagents/src/GraphTask";
import foodieConfig from "../../hyperagents/agentConfigs/Foodie.json";
import { AgentConfigs } from "hyperagents/src/agent/AgentConfig";
dotenv.config();
console.log("🔥 foodieConfig", foodieConfig);
console.log("🔥 Starting test script");
console.log(
  "🔥 GOOGLE_API_KEY:",
  process.env.GOOGLE_API_KEY ? "Found" : "Not found"
);

// Use dynamic imports to load the hyperagents modules
(async () => {
  try {
    console.log("Creating foodie agent with config:", foodieConfig);

    const foodie = new Agent({...foodieConfig,       llmApiKey: process.env.GOOGLE_API_KEY} as AgentConfigs);

    // Create the graph
    const graph = new Graph();
    graph.addAgentNode({ agent: foodie, nodeId: "foodie" });
    graph.setEntryPoint("foodie", `^USER_INPUT^`, "end");

    // Create the task
    const task = new GraphTask(graph, InMemoryMemory.getInstance());

    // Run the task
    console.log("Running task...");
    const result = await task.runTask(
      "Can you recommend some good places to visit in Seoul?"
    );

    // Process the result
    console.log("Task completed successfully!");
    console.log("Task result:", result);
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();
