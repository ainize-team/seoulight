"use client";

import { useState } from "react";

export default function TestButtonClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const testMessage = "서울에서 유명한 삼겹살 맛집을 추천해주세요";
      
      // 기존 작동하는 API 엔드포인트 사용
      const response = await fetch("/api/foodie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: testMessage })
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.response);
    } catch (err: any) {
      console.error("Test failed:", err);
      setError(err.message || "테스트 실행 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4 border rounded-lg">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "실행 중..." : "테스트 스크립트 실행"}
      </button>
      
      {result && (
        <div className="p-4 mt-4 border rounded-lg bg-gray-50">
          <h3 className="mb-2 font-semibold">결과:</h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 mt-4 text-white bg-red-500 rounded-lg">
          <h3 className="mb-2 font-semibold">오류:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 