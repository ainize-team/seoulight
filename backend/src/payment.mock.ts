import { Request, Response } from "express";
import { sleep } from "./utils/sleep";

export const paymentMock = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  //   res.write(`data: ${JSON.stringify({ type: "foodie", content: "" })}\n\n`);
  //   await sleep(1000);
  //   res.write(
  //     `data: ${JSON.stringify({ type: "welly", content: "인천 공항에서는 마사지를 받을 수 있어" })}\n\n`
  //   );
  //   await sleep(1000);
  //   res.write(
  //     `data: ${JSON.stringify({ type: "artie", content: "공항 근처에 있는 미술관에 가면 좋아요" })}\n\n`
  //   );
  //   await sleep(1000);
  //   res.write(
  //     `data: ${JSON.stringify({ type: "muzie", content: "영화 촬영장소를 추천해줄게" })}\n\n`
  //   );
  //   await sleep(1000);
  res.write(
    `data: ${JSON.stringify({ type: "text", sender: "foodie", content: "그럼 김밥천국에서 김밥한줄 주문할게" })}\n\n`
  );
  await sleep(1000);
  res.write(
    `data: ${JSON.stringify({ type: "text", sender: "payment", content: "김밥천국 김밥한줄 3000원 결제를 진행합니다." })}\n\n`
  );
  await sleep(1000);
  res.write(
    `data: ${JSON.stringify({ type: "text", sender: "master", content: "김밥 3000원 결제가 완료되었습니다." })}\n\n`
  );
  await sleep(1000);

  res.end();
  req.on("close", () => {
    res.end();
  });
};
