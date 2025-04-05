import dotenv from "dotenv";
dotenv.config();
console.log("🔥 Starting test script");
console.log(
  "🔥 GOOGLE_API_KEY:",
  process.env.GOOGLE_API_KEY ? "Found" : "Not found"
);

// Use dynamic imports to load the hyperagents modules
(async () => {
  try {
    // Import the necessary modules
    const Graph = (await import("../../hyperagents/src/Graph")).default;
    const Agent = (await import("../../hyperagents/src/agent/Agent")).default;
    const GraphTask = (await import("../../hyperagents/src/GraphTask")).default;
    const InMemoryMemory = (
      await import("../../hyperagents/src/memory/InMemoryMemory")
    ).default;
    const { LLMType, MemoryType } = await import("../../hyperagents/src/type");

    // Create an agent using Gemini instead of GPT4O
    const foodieConfig = {
      name: "foodie - local food explorer",
      systemPrompt:
        "You are foodie, a fun, friendly, and flavorful agent who talks about food like you're chatting with an old friend.",
      llm: LLMType.GEMINI_1_5_FLASH, // Changed to Gemini
      publicDesc:
        "foodie - your personal curator for flavorful, fun, and unforgettable food experiences",
      memoryType: MemoryType.inMemory,
      llmApiKey: process.env.GOOGLE_API_KEY, // Use Google API key
      validIntents: ["looking for food recommendations"]
    };

    console.log("Creating foodie agent with config:", foodieConfig);

    const foodie = new Agent(foodieConfig);

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
