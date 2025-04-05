import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Status = {
  isLoading: boolean;
  isStreaming: boolean;
};

type Action = {
  setIsLoading: (value: boolean) => void;
  setIsStreaming: (value: boolean) => void;
};

const useChatStatus = create(
  immer<Status & Action>((set) => ({
    isLoading: false,
    isStreaming: false,
    setIsLoading: (value: boolean) => {
      set({
        isLoading: value
      });
    },
    setIsStreaming: (value: boolean) => {
      set({
        isStreaming: value
      });
    }
  }))
);

export default useChatStatus;
