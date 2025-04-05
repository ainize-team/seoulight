import {
  MessageType,
  Sender,
  BotMessageType,
  UserMessageType
} from "@/types/MessageType";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Status = {
  messages: MessageType[];
};

type Action = {
  setMessages: (
    value: MessageType[] | ((prev: MessageType[]) => MessageType[])
  ) => void;
  addMessage: (message: MessageType) => void;
  updateBotMessage: (id: string, content: string, isComplete: boolean) => void;
};

const useMessages = create(
  immer<Status & Action>((set) => ({
    messages: [],
    setMessages: (value) => {
      set((state) => {
        return {
          messages: typeof value === "function" ? value(state.messages) : value
        };
      });
    },
    addMessage: (message: MessageType) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    },
    updateBotMessage: (id, content, isComplete) => {
      set((state) => {
        const updatedMessages = state.messages.map((message) => {
          if (message.id === id && message.sender !== Sender.USER) {
            return {
              ...message,
              contents: { content },
              isComplete
            };
          }
          return message;
        });
        return { messages: updatedMessages };
      });
    }
  }))
);

export default useMessages;
