"use client";

import { useForm } from "react-hook-form";
import { useState, useRef } from "react";

import StopIcon from "@/icons/StopIcon";
import UpArrowIcon from "@/icons/UpArrowIcon";
import { Sender } from "@/types/MessageType";
import useChatStatus from "@/stores/chatStatus";
import { useChatContext } from "@/contexts/ChatContext";

interface FormValues {
  message: string;
}

interface ChatInputProps {}

export default function ChatInput() {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>();
  const message = watch("message") || "";
  const { isLoading, setIsLoading, isStreaming, setIsStreaming } =
    useChatStatus((state) => ({
      isLoading: state.isLoading,
      setIsLoading: state.setIsLoading,
      isStreaming: state.isStreaming,
      setIsStreaming: state.setIsStreaming
    }));

  const { handleMessageAction } = useChatContext();

  const abortControllerRef = useRef<AbortController | null>(null);

  const onSubmit = async (data: FormValues) => {
    // 이미 메시지를 처리 중이면 중복 제출 방지
    if (isLoading || isStreaming || !data.message.trim()) return;

    console.log("Form submitted with message:", data.message);

    // Set loading state (before adding user message)
    setIsLoading(true);
    setIsStreaming(true);

    // 입력 필드 초기화 (가능한 빨리 사용자에게 피드백 제공)
    reset();

    // Create message ID outside try block so it's accessible in catch and finally
    const messageId = `bot-${Date.now()}`;

    try {
      // Display user message first (called only once)
      await handleMessageAction(data.message, Sender.USER);

      // Create initial empty message
      await handleMessageAction("", Sender.BOT, messageId, false);

      // Cancel previous request (simplified implementation)
      abortControllerRef.current = null;

      // Create new AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Track if request has actually started
      let requestStarted = false;

      // Fallback message for network errors
      const fallbackMessage =
        "Unable to receive server response due to network error. Please try again later.";

      // Mock response demo (for when server is not working)
      const mockResponse = [
        "Hello! Let me tell you about Seoul restaurants. 😊",
        "Looking for BBQ places? Here are some recommendations:",
        "1. Mapo District's Imkkokjeong - A 30-year tradition of charcoal-grilled BBQ known for thick pork belly slices.",
        "2. Jongno Donhwamun Golden Pig - Allows ordering single portions with special marinated grilling technique.",
        "3. Gangnam Yeoksam Original Restaurant - Known for specialty cuts and various pork belly options.",
        "4. Hongdae Fresh Meat Butcher Shop - Select fresh meat yourself with great value for money.",
        "5. Itaewon Pig Party - Popular with foreigners, offering various sauces to enjoy with your BBQ.",
        "Which one sounds interesting? Let me know if you need more details!"
      ];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/chat-sse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: data.message }),
          signal: abortController.signal
        }
      );

      requestStarted = true;

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      // Process response as stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Cannot read response body as stream");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let chunkCount = 0;

      // Stream reading loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        chunkCount++;

        // Convert binary data to text
        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE data from chunk (data: {...}\n\n format)
        const dataLines = chunk.split("\n\n");

        // Store new content from this chunk
        let newContent = "";

        for (const line of dataLines) {
          if (line.startsWith("data: ")) {
            try {
              const dataContent = line.substring(6);
              const eventData = JSON.parse(dataContent);

              // Extract content based on server response structure
              const content = eventData.content || "";

              // Handle "Echo:" response
              if (content.startsWith("Echo:")) {
                // Extract user query (after "Echo:")
                const userQuery = content.substring(6).trim();
              }

              // Process content if not empty
              if (content) {
                // Store content from this line
                newContent = content;

                // Update accumulated text
                accumulatedText = newContent;

                // Update message (not complete yet)
                await handleMessageAction(
                  accumulatedText,
                  Sender.BOT,
                  messageId,
                  false
                );
              }
            } catch (e) {
              console.error("SSE data parsing error:", e);
            }
          }
        }
      }

      // If no actual server response, use mock data (for testing)
      if (accumulatedText === "") {
        let mockAccumulatedText = "";
        for (let i = 0; i < mockResponse.length; i++) {
          // Simulate sequential responses
          await new Promise((resolve) => setTimeout(resolve, 500));

          mockAccumulatedText += mockResponse[i] + " ";

          // Create message in MessageType format
          const botMessage = {
            id: messageId,
            sender: Sender.BOT,
            contents: { content: mockAccumulatedText },
            isComplete: i === mockResponse.length - 1
          };

          // Update message
          await handleMessageAction(
            mockAccumulatedText,
            Sender.BOT,
            messageId,
            i === mockResponse.length - 1 // Complete only on last message
          );
        }

        accumulatedText = mockAccumulatedText;
      }

      // Mark message as complete after streaming ends
      // Create final message in MessageType format
      const finalBotMessage = {
        id: messageId,
        sender: Sender.BOT,
        contents: { content: accumulatedText || fallbackMessage },
        isComplete: true
      };

      await handleMessageAction(
        accumulatedText || fallbackMessage,
        Sender.BOT,
        messageId,
        true
      );
      abortControllerRef.current = null;
    } catch (error: any) {
      // Error logging (for debugging)
      console.error("Error:", error);

      // Skip if request was canceled before starting
      if (error.name === "AbortError") {
        // Handle canceled message
        await handleMessageAction(
          "Message transmission canceled.",
          Sender.BOT,
          messageId,
          true
        );
      } else {
        // Other network errors
        console.error("Response streaming error:", error);
        await handleMessageAction(
          `An error occurred: ${error.message || "Unknown error"}`,
          Sender.BOT,
          messageId,
          true
        );
      }
    } finally {
      // Release loading state
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    // Cancel ongoing request (simplified implementation)
    abortControllerRef.current = null;
  };

  return (
    <div className="sticky bottom-0 z-10 w-full bg-[linear-gradient(to_top,_#f9f7f4_50%,_transparent_50%)] px-3 pb-3 pt-0">
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <input
          className="w-full rounded-full border border-[#e0e0e0] bg-white py-3 pl-3 pr-12 text-base focus:outline-none"
          type="text"
          placeholder="Type a message..."
          {...register("message", { required: true })}
          onKeyDown={(e) => {
            // 한글 입력 중복 방지
            if (e.nativeEvent.isComposing) return;

            // Enter 키를 누르고 로딩 중이 아니며 메시지가 비어있지 않을 때만 제출
            if (
              e.key === "Enter" &&
              !isLoading &&
              !isStreaming &&
              message.trim()
            ) {
              e.preventDefault(); // 기본 폼 제출 방지하고 명시적으로 제출
              handleSubmit(onSubmit)();
            }
          }}
        />
        <button
          type="submit"
          className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full ${
            isStreaming
              ? "bg-[#363534]"
              : !isStreaming && !message.trim()
                ? "bg-[#e8e7e6] text-gray-500"
                : "bg-[#363534] hover:bg-gray-800"
          }`}
          onClick={(e) => {
            if (isStreaming) {
              e.preventDefault();
              stopStreaming();
              setIsLoading(false);
              setIsStreaming(false);
            }
          }}
        >
          {isStreaming ? (
            <StopIcon color="white" />
          ) : (
            <UpArrowIcon color={message.trim() ? "white" : "#2F333B"} />
          )}
        </button>
      </form>
    </div>
  );
}
