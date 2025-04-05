import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    return NextResponse.json({ status: "success" });
  } catch (e) {
    console.error("GET request error:", e);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message, sender } = data;

    return NextResponse.json({
      status: "success",
      message: "Message received"
    });
  } catch (e) {
    console.error("POST request error:", e);
    return NextResponse.json(
      { status: "error", message: "Failed to process message" },
      { status: 400 }
    );
  }
}
