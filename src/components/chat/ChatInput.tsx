"use client";

import { useForm } from "react-hook-form";

import StopIcon from "@/icons/StopIcon";
import UpArrowIcon from "@/icons/UpArrowIcon";
import { Sender } from "@/types/MessageType";
import useChatStatus from "@/stores/chatStatus";

interface FormValues {
  message: string;
}

interface ChatInputProps {
  handleMessageAction: (message: string, sender: Sender) => void;
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

  const onSubmit = (data: FormValues) => {
    handleMessageAction(data.message, Sender.USER);
    reset();
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
              handleMessageAction(message, Sender.USER);
              reset();
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
              // abortController?.abort();
              setIsLoading(false);
              setIsStreaming(false);
            } else if (message.trim()) {
              handleMessageAction(message, Sender.USER);
              reset();
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
