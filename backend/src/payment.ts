import { Request, Response } from "express";
import { sleep } from "./utils/sleep";
import fs from "fs";
import IntentManagerAgent from "../hyperagents/src/agent/IntentManagerAgent";
import { Agent, InMemoryMemory } from "../hyperagents/src";
import Graph from "../hyperagents/src/Graph";
import GraphTask from "../hyperagents/src/GraphTask";

export const payment = async (req: Request, res: Response) => {
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

  const foodie = await Agent.fromConfigFile("Foodie.json", {
    llmApiKey: process.env.GOOGLE_API_KEY!
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
  graph.addAgentNode({ agent: artie, nodeId: "artie" });
  graph.addAgentNode({ agent: actors, nodeId: "actors" });
  graph.addAgentNode({ agent: muzie, nodeId: "muzie" });
  graph.addAgentNode({ agent: welly, nodeId: "welly" });
  graph.addAgentNode({ agent: master, nodeId: "master" });

  graph.addAgentNode({ agent: foodie, nodeId: "foodie-food_recommendation" });

  graph.setEntryPoint("intent_manager", `^USER_INPUT^`, "foodie");

  graph.addEdge({
    from: "intent_manager",
    to: "foodie",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT^`,
    intent: ["general_recommandation"],
    memoryId: "foodie-general_recommendation"
  });

  graph.addEdge({
    from: "foodie",
    to: "artie",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT^`,
    memoryId: "artie-general_recommendation"
  });

  graph.addEdge({
    from: "artie",
    to: "actors",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT^`,
    memoryId: "actors-general_recommendation"
  });

  graph.addEdge({
    from: "actors",
    to: "muzie",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT^`,
    memoryId: "muzie-general_recommendation"
  });

  graph.addEdge({
    from: "muzie",
    to: "welly",
    prompt: `Answer the user's question based on the following information:
      User Question: ^USER_INPUT^`,
    memoryId: "welly-general_recommendation"
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
    
      User Question: ^USER_INPUT^`,
    memoryId: "master-summary"
  });

  graph.addEdge({
    from: "intent_manager",
    to: "foodie-food_recommendation",
    prompt: `Answer the user's question based on the following information:
      - Please recommend only 3 places
      - Use polite speech endings in Korean

      User Question: ^USER_INPUT^`,
    intent: ["food_recommendation"],
    memoryId: "foodie-food_recommendation"
  });

  const task = new GraphTask(graph, InMemoryMemory.getInstance());
  for await (const result of task.runTask(
    "I don't know what to do in Gangnam Station"
  )) {
    res.write(
      `data: ${JSON.stringify({ type: "text", sender: `${result.agent}`, content: `${result.output}` })}\n\n`
    );
  }

  await task.exportMemory().then((result) => {
    fs.writeFileSync("conversation.html", result);
    console.log("Conversation has been saved to conversation.html file.");
  });

  res.write(
    `data: ${JSON.stringify({ type: "text", sender: "master", content: `Echo: ${userMessage}` })}\n\n`
  );
  await sleep(1000);

  res.end();
  req.on("close", () => {
    res.end();
  });
};
