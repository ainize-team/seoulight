"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

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

  const onSubmit = async (data: FormValues) => {
    if (!data.message.trim()) return;

    // 사용자 메시지를 먼저 표시
    handleMessageAction(data.message, Sender.USER);

    // 로딩 상태 설정
    setIsLoading(true);

    try {
      // localhost:8080 백엔드 서버 API 호출
      console.log("🔥🔥🔥🔥🔥", data.message);
      const response = await fetch("http://localhost:8080/api/hyperagents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      // AI 응답을 표시
      handleMessageAction(result.response, Sender.BOT);
    } catch (error: any) {
      console.error("Error calling API:", error);
      // 에러 메시지 표시
      handleMessageAction(
        `오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`,
        Sender.BOT
      );
    } finally {
      // 로딩 상태 해제
      setIsLoading(false);
      // 입력란 초기화
      reset();
    }
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
              // abortController?.abort();
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
