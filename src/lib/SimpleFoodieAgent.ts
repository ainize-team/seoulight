import { GoogleGenerativeAI } from "@google/generative-ai";

interface SimpleFoodieAgentConfig {
  apiKey: string;
  systemPrompt: string;
}

export class SimpleFoodieAgent {
  private apiKey: string;
  private systemPrompt: string;
  private model: any;

  constructor(config: SimpleFoodieAgentConfig) {
    this.apiKey = config.apiKey;
    this.systemPrompt = config.systemPrompt;

    // Google AI 모델 초기화
    const genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(message: string): Promise<string> {
    try {
      // 시스템 프롬프트와 사용자 메시지 결합
      const prompt = `${this.systemPrompt}\n\nUser: ${message}`;

      // 응답 생성
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      return response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }
}
