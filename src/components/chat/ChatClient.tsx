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
    updateBotMessage,
    resetMessages
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
              `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/chat-sse`,
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
                let lastSender = Sender.BOT; // Track the last sender for the final message

                // Stream reading loop
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    console.log(
                      `[SSE CONNECTION CLOSED] Total chunks received: ${chunkCount}`
                    );
                    break;
                  }

                  chunkCount++;

                  // Convert binary data to text
                  const chunk = decoder.decode(value, { stream: true });
                  console.log(`[SSE CHUNK ${chunkCount}]`, chunk);

                  // Parse SSE data from chunk (data: {...}\n\n format)
                  const dataLines = chunk.split("\n\n");
                  console.log(
                    `[SSE CHUNK ${chunkCount} DATA LINES]`,
                    dataLines.length
                  );

                  // Store new content from this chunk
                  let newContent = "";

                  for (const line of dataLines) {
                    if (line.startsWith("data: ")) {
                      try {
                        const dataContent = line.substring(6);
                        console.log("[SSE DATA]", dataContent);

                        const eventData = JSON.parse(dataContent);
                        console.log("[SSE PARSED DATA]", eventData);

                        // Extract content based on server response structure
                        const content = eventData.content || "";
                        console.log("[SSE RESPONSE CONTENT]", content);

                        // Extract sender information if available
                        lastSender = eventData.sender || Sender.BOT;
                        console.log("[SSE RESPONSE SENDER]", lastSender);

                        // Store content from this line
                        newContent = content;

                        // Update accumulated text
                        accumulatedText = newContent;

                        // Update message (not complete yet)
                        await handleMessageAction(
                          accumulatedText,
                          lastSender,
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

                console.log(
                  `[SSE COMPLETED] Total chunks received: ${chunkCount}`
                );

                // Only mark the message as complete if we actually received chunks
                // and if the message isn't already complete
                if (accumulatedText && chunkCount > 0) {
                  const existingMessage = messages.find(
                    (msg: any) => msg.id === messageId
                  );
                  const isAlreadyComplete =
                    existingMessage &&
                    existingMessage.sender === Sender.BOT &&
                    "isComplete" in existingMessage &&
                    existingMessage.isComplete === true;

                  if (!isAlreadyComplete) {
                    console.log(
                      "[COMPLETING MESSAGE] Updating to mark as complete:",
                      messageId
                    );
                    await handleMessageAction(
                      accumulatedText,
                      lastSender,
                      messageId,
                      true // Mark as complete
                    );
                  } else {
                    console.log(
                      "[SKIPPING COMPLETION] Message already complete:",
                      messageId
                    );
                  }
                } else {
                  // Use default response if no actual response
                  const defaultAnswer =
                    "I'll provide information about Seoul. Feel free to ask specific questions!";
                  await handleMessageAction(
                    defaultAnswer,
                    Sender.BOT, // Default sender for fallback message
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
    return () => {
      resetMessages();
    };
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
    } else if (!isComplete) {
      // Only add new message if ID doesn't exist AND the message is not complete
      console.log(`[ADD NEW MESSAGE] id=${id}, isComplete=${isComplete}`);
      const botResponse: MessageType = {
        id,
        sender: Sender.BOT,
        contents: { content },
        isComplete
      };
      addMessage(botResponse);
    } else {
      console.log(
        `[SKIPPED ADDING] Complete message with no existing ID: ${id}`
      );
    }
  };

  const handleMessageAction = async (
    message: string,
    sender: Sender,
    id?: string,
    isComplete: boolean = true
  ) => {
    console.log(
      `[HANDLE MESSAGE] sender=${sender}, id=${id}, isComplete=${isComplete}, message=${message.substring(0, 20)}...`
    );

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
      // Check if we're trying to add a complete message that already exists
      const existingMessage = messages.find((msg: any) => msg.id === id);

      // Check if the existing message is complete (only for bot messages)
      const isExistingComplete =
        existingMessage &&
        existingMessage.sender === Sender.BOT &&
        "isComplete" in existingMessage &&
        existingMessage.isComplete === true;

      if (isComplete && isExistingComplete) {
        console.log(`[DUPLICATE AVOIDED] Message ${id} is already complete`);
        return; // Skip updating if already complete
      }

      // Update existing message (streaming)
      console.log(`[UPDATE MESSAGE] id=${id}, isComplete=${isComplete}`);
      updateMessage(id, message, isComplete);
    } else if (!isComplete) {
      // Only add new bot message if NOT complete
      const botResponse: MessageType = {
        id: Date.now().toString(),
        sender: Sender.BOT,
        contents: { content: message },
        isComplete
      };
      console.log(`[ADD NEW MESSAGE] No ID, isComplete=${isComplete}`);
      addMessage(botResponse);
    } else {
      console.log(`[SKIPPED ADDING] Complete message with no ID`);
    }
  };

  return (
    <ChatProvider handleMessageAction={handleMessageAction}>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <ChatMessages messages={messages} />
          <ChatInput />
        </div>
      </div>
    </ChatProvider>
  );
}
