import { Request, Response } from "express";

export const chatSSE = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  res.write(
    `data: ${JSON.stringify({ type: "text", sender: "master", content: `Echo: ${userMessage}` })}\n\n`
  );
  res.end();
  req.on("close", () => {
    res.end();
  });
};
