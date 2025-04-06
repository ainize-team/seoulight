"use client";

import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Message {
  content: string;
}

interface Props {
  message: Message;
}

export default function MessageRenderer({ message }: Props) {
  const contentStr = message.content;
  // <url ...> 태그를 찾는 정규식 (태그 내부 속성 포함)
  const urlTagRegex = /(<url.*?>.*?<\/url>)/g;
  // 메시지 내용을 <url> 태그 기준으로 분리합니다.
  const parts = contentStr.split(urlTagRegex).filter(Boolean);

  return (
    <div className={"flex w-full flex-col"}>
      {parts.map((part, index) => {
        return <MarkdownRenderer key={index} markdownText={part} />;
      })}
    </div>
  );
}
