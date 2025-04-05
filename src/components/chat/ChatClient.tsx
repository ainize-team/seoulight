"use client";

import { useState, useEffect } from "react";

import ChatInput from "./ChatInput";
import ChatMessages from "./messages/ChatMessages";
import { MessageType, Sender } from "@/types/MessageType";
import useChatStatus from "@/stores/chatStatus";
import { ChatProvider } from "@/contexts/ChatContext";
import useMessages from "@/stores/messages";

export default function ChatClient() {
  const { isLoading, setIsLoading, isStreaming, setIsStreaming } =
    useChatStatus((state) => ({
      isLoading: state.isLoading,
      setIsLoading: state.setIsLoading,
      isStreaming: state.isStreaming,
      setIsStreaming: state.setIsStreaming
    }));

  const {
    messages,
    addMessage: addStoreMessage,
    updateBotMessage
  } = useMessages();

  // Load initial message from sessionStorage on component mount
  useEffect(() => {
    const initializeChat = async () => {
      if (typeof window !== "undefined") {
        const savedMessage = sessionStorage.getItem("chatInput");
        if (savedMessage) {
          // Create user message
          const userMessage: MessageType = {
            id: Date.now().toString(),
            sender: Sender.USER,
            message: savedMessage
          };

          // Add message
          addStoreMessage(userMessage);

          // Set loading state
          setIsLoading(true);
          setIsStreaming(true);

          // Generate automatic response
          try {
            const messageId = `bot-${Date.now() + 100}`;

            // Create initial empty message
            await handleMessageAction("", Sender.BOT, messageId, false);

            // Send message to server
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT || "http://localhost:8080"}/api/chat-sse`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: savedMessage })
              }
            );

            if (response.ok) {
              try {
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

                          // Mock responses
                          if (
                            userQuery.includes("hello") ||
                            userQuery.includes("who")
                          ) {
                            content =
                              "Hello! I'm an AI assistant that provides information about Seoul. Feel free to ask about restaurants, tourist attractions, or anything related to Seoul!";
                          } else if (
                            userQuery.includes("restaurant") ||
                            userQuery.includes("food")
                          ) {
                            content =
                              "Seoul has a diverse range of restaurants. Particularly, Gangnam area has trendy cafes and restaurants, while traditional Korean cuisine can be enjoyed around Jongno and Gwanghwamun.";
                          } else {
                            content =
                              "Seoul is the capital of South Korea, where history and modern culture coexist. It offers various attractions and culinary experiences. What would you like to know more about?";
                          }
                        }

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
                      } catch (e) {
                        console.error("SSE data parsing error:", e);
                        console.error("Error line:", line);
                      }
                    }
                  }
                }

                // Mark message as complete after streaming ends
                if (accumulatedText) {
                  await handleMessageAction(
                    accumulatedText,
                    Sender.BOT,
                    messageId,
                    true
                  );
                } else {
                  // Use default response if no actual response
                  let defaultAnswer =
                    "I'll provide information about Seoul. Feel free to ask specific questions!";
                  await handleMessageAction(
                    defaultAnswer,
                    Sender.BOT,
                    messageId,
                    true
                  );
                }
              } catch (error) {
                console.error("Error processing stream:", error);
                await handleMessageAction(
                  "An error occurred while processing the response.",
                  Sender.BOT,
                  messageId,
                  true
                );
              } finally {
                // Release loading state
                setIsLoading(false);
                setIsStreaming(false);
              }
            } else {
              // Error handling
              await handleMessageAction(
                "There was a problem connecting to the server.",
                Sender.BOT,
                messageId,
                true
              );
              setIsLoading(false);
              setIsStreaming(false);
            }
          } catch (error) {
            console.error("Error generating response:", error);
            setIsLoading(false);
            setIsStreaming(false);
          }

          // Clear sessionStorage (use only once)
          sessionStorage.removeItem("chatInput");
        }
      }
    };

    initializeChat();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Dependencies like addMessage, handleMessageAction should be added to the array
  // But kept empty to ensure it runs only once on initialization

  const addMessage = (newMessage: MessageType) => {
    addStoreMessage(newMessage);
  };

  const updateMessage = (id: string, content: string, isComplete: boolean) => {
    // Check if message with specified ID exists
    const messageExists = messages.some(
      (msg: any) => msg.id === id && msg.sender === Sender.BOT
    );

    if (messageExists) {
      // Update message if ID exists
      updateBotMessage(id, content, isComplete);
    } else {
      // Add new message if ID doesn't exist
      const botResponse: MessageType = {
        id,
        sender: Sender.BOT,
        contents: { content },
        isComplete
      };
      addMessage(botResponse);
    }
  };

  const handleMessageAction = async (
    message: string,
    sender: Sender,
    id?: string,
    isComplete: boolean = true
  ) => {
    if (sender === Sender.USER) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        sender: Sender.USER,
        message
      };
      addMessage(userMessage);
      return; // Return after adding user message
    }

    // Handle bot message
    if (id) {
      // Update existing message (streaming)
      updateMessage(id, message, isComplete);
    } else {
      // Add new bot message
      const botResponse: MessageType = {
        id: Date.now().toString(),
        sender: Sender.BOT,
        contents: { content: message },
        isComplete
      };
      addMessage(botResponse);
    }
  };

  return (
    <ChatProvider handleMessageAction={handleMessageAction}>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <ChatMessages messages={messages} />
          <ChatInput handleMessageAction={handleMessageAction} />
        </div>
      </div>
    </ChatProvider>
  );
}
