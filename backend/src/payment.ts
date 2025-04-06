import { Request, Response } from "express";
import fs from "fs";
import IntentManagerAgent from "../hyperagents/src/agent/IntentManagerAgent";
import { Agent, InMemoryMemory } from "../hyperagents/src";
import Graph from "../hyperagents/src/Graph";
import GraphTask from "../hyperagents/src/GraphTask";

let counter = 0;

export const payment = async (req: Request, res: Response) => {
  counter++;
  // SSE 응답 헤더 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  // 1. intent manager
  const intentManager = await IntentManagerAgent.fromConfigFile(
    "IntentManager.json",
    {
      embeddingApiKey: process.env.AZURE_OPENAI_EMBEDDING_API_KEY!,
      embeddingEndpoint: process.env.AZURE_OPENAI_EMBEDDING_BASE_URL!,
      embeddingApiVersion: process.env.AZURE_OPENAI_EMBEDDING_API_VERSION!,
      embeddingDeploymentName:
        process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME!
    }
  );

  const eunmaWangManduServer = await Agent.fromConfigFile(
    "EunmaWangManduServer.json",
    {
      llmApiKey: process.env.ANTHROPIC_API_KEY!
    }
  );

  const foodie = await Agent.fromConfigFile("Foodie.json", {
    llmEndpoint: process.env.OPENAI_BASE_URL!,
    llmApiKey: process.env.OPENAI_API_KEY!
  });

  const artie = await Agent.fromConfigFile("Artie.json", {
    llmApiKey: process.env.GOOGLE_API_KEY!
  });

  const actors = await Agent.fromConfigFile("Actors.json", {
    llmApiKey: process.env.GOOGLE_API_KEY!
  });

  const muzie = await Agent.fromConfigFile("Muzie.json", {
    llmEndpoint: process.env.OPENAI_BASE_URL!,
    llmApiKey: process.env.OPENAI_API_KEY!
  });

  const welly = await Agent.fromConfigFile("Welly.json", {
    llmEndpoint: process.env.OPENAI_BASE_URL!,
    llmApiKey: process.env.OPENAI_API_KEY!
  });

  const master = await Agent.fromConfigFile("Master.json", {
    llmEndpoint: process.env.OPENAI_BASE_URL!,
    llmApiKey: process.env.OPENAI_API_KEY!
  });

  const graph = new Graph();

  graph.addAgentNode({ agent: intentManager, nodeId: "intent_manager" });
  graph.addAgentNode({ agent: foodie, nodeId: "foodie" });
  graph.addAgentNode({ agent: foodie, nodeId: "foodie-find_server" });
  graph.addAgentNode({ agent: artie, nodeId: "artie" });
  graph.addAgentNode({ agent: actors, nodeId: "actors" });
  graph.addAgentNode({ agent: muzie, nodeId: "muzie" });
  graph.addAgentNode({ agent: welly, nodeId: "welly" });
  graph.addAgentNode({
    agent: eunmaWangManduServer,
    nodeId: "eunma_wangmandu_server"
  });
  graph.addAgentNode({ agent: master, nodeId: "master" });

  graph.addAgentNode({ agent: foodie, nodeId: "foodie-food_recommendation" });

  graph.setEntryPoint("intent_manager", `^USER_INPUT_${counter}^`, "foodie");

  graph.addEdge({
    from: "intent_manager",
    to: "foodie",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    intent: ["general_recommandation"],
    memoryId: `foodie-general_recommendation-${counter}`
  });

  graph.addEdge({
    from: "intent_manager",
    to: "eunma_wangmandu_server",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    intent: ["order_food"],
    memoryId: `eunma_wangmandu_server-order_food-${counter}`
  });

  graph.addEdge({
    from: "foodie",
    to: "artie",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    memoryId: `artie-general_recommendation-${counter}`
  });

  graph.addEdge({
    from: "artie",
    to: "actors",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    memoryId: `actors-general_recommendation-${counter}`
  });

  graph.addEdge({
    from: "actors",
    to: "muzie",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    memoryId: `muzie-general_recommendation-${counter}`
  });

  graph.addEdge({
    from: "muzie",
    to: "welly",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    memoryId: `welly-general_recommendation-${counter}`
  });

  graph.addEdge({
    from: "welly",
    to: "master",
    prompt: `Provide the summary of the agents's conversation:
    <Foodie>
      ^foodie-general_recommendation^
    </Foodie>
    <Artie>
      ^artie-general_recommendation^
    </Artie>
    <Actors>
      ^actors-general_recommendation^
    </Actors>
    <Muzie>
      ^muzie-general_recommendation^
    </Muzie>
    <Welly>
      ^welly-general_recommendation^
    </Welly>
    
      User Question: ^USER_INPUT_${counter}^`,
    memoryId: `master-summary-${counter}`
  });

  graph.addEdge({
    from: "intent_manager",
    to: "foodie-food_recommendation",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT_${counter}^`,
    intent: ["food_recommendation"],
    memoryId: `foodie-food_recommendation-${counter}`
  });

  graph.addEdge({
    from: "intent_manager",
    to: "foodie-find_server",
    prompt: `Answer the user's question based on the following information:
      - find proper server for the user's question
      User Question: ^USER_INPUT_${counter}^`,
    intent: ["find_server"],
    memoryId: `foodie-find_server-${counter}`
  });

  graph.addEdge({
    from: "foodie-find_server",
    to: "eunma_wangmandu_server",
    prompt: `Answer the user's question based on the following information:

The guest is currently looking for something to eat after a hackathon and is near Gaepo-dong. 
As a dumpling expert representing Eunma Wang Mandu, your job is to introduce your signature menu items and help them choose something warm, satisfying, and energizing.
Focus on the flavors, portion size, and the atmosphere of your shop, and make sure your answer is friendly, informative, and concise.

      User Question: ^USER_INPUT_${counter}^`,
    memoryId: `eunma_wangmandu_server-find_server-${counter}`
  });

  const task = new GraphTask(graph, InMemoryMemory.getInstance());
  for await (const result of task.runTask(userMessage, counter)) {
    res.write(
      `data: ${JSON.stringify({ type: "text", sender: `${result.agent}`, content: `${result.output}` })}\n\n`
    );
  }

  await task.exportMemory().then((result) => {
    fs.writeFileSync("conversation.html", result);
    console.log("Conversation has been saved to conversation.html file.");
  });

  res.end();
  req.on("close", () => {
    res.end();
  });
};
