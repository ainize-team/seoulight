"use client";

import { useForm } from "react-hook-form";
import { useState, useRef } from "react";

import StopIcon from "@/icons/StopIcon";
import UpArrowIcon from "@/icons/UpArrowIcon";
import { Sender } from "@/types/MessageType";
import useChatStatus from "@/stores/chatStatus";

interface FormValues {
  message: string;
}

interface ChatInputProps {
  handleMessageAction: (
    message: string,
    sender: Sender,
    id?: string,
    isComplete?: boolean
  ) => Promise<void>;
}

export default function ChatInput({ handleMessageAction }: ChatInputProps) {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>();
  const message = watch("message") || "";
  const { isLoading, setIsLoading, isStreaming, setIsStreaming } =
    useChatStatus((state) => ({
      isLoading: state.isLoading,
      setIsLoading: state.setIsLoading,
      isStreaming: state.isStreaming,
      setIsStreaming: state.setIsStreaming
    }));

  const abortControllerRef = useRef<AbortController | null>(null);

  const onSubmit = async (data: FormValues) => {
    if (!data.message.trim()) return;

    // Set loading state (before adding user message)
    setIsLoading(true);
    setIsStreaming(true);

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

      const response = await fetch("http://localhost:8080/api/chat-sse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: data.message }),
        signal: abortController.signal
      });

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
              let content = eventData.content || "";

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
      // Clear input field
      reset();
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
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" && message.trim()) {
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
              stopStreaming();
              setIsLoading(false);
              setIsStreaming(false);
            } else if (message.trim()) {
              handleSubmit(onSubmit)();
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
