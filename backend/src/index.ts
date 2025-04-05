import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { chatSSE } from "./chat-sse";
import { payment } from "./payment";
import { paymentMock } from "./payment.mock";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS 및 기본 미들웨어 설정
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.post("/api/chat-sse", chatSSE);
app.post("/api/payment-mock", paymentMock);
app.post("/api/payment", payment);

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
