import { MessageType } from "@/types/MessageType";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Status = {
  messages: MessageType[];
};

type Action = {
  addMessages: (value: boolean) => void;
};

const useMessages = create(
  immer<Status & Action>((set) => ({
    messages: [],
    addMessages: (value: boolean) => {
      set((state) => ({
        messages: [...state.messages, value]
      }));
    }
  }))
);

export default useMessages;
