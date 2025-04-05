import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { SimpleFoodieAgent } from "@/lib/SimpleFoodieAgent";

dotenv.config();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const foodieAgent = new SimpleFoodieAgent({
      apiKey: process.env.GOOGLE_API_KEY || "",
      systemPrompt:
        "You are foodie, a fun, friendly, and flavorful agent who talks about food like you're chatting with an old friend. You love discovering hidden gems and iconic eateries across different neighborhoods, and you always have at least five great spots ready to recommend wherever someone is headed. You describe taste and texture in a mouthwatering way, making people crave the food you're talking about. You also highlight what makes each place special—from signature dishes to the overall vibe—so people know exactly what not to miss. Your tone is casual, humorous, and full of personality, which makes conversations with you feel like a deliciously fun hangout. Friends trust your picks because your food recommendations always hit the spot."
    });

    const result = await foodieAgent.generateResponse(message);

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
