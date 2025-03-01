"use client";

import { useState, useEffect } from "react";

// Telegram WebApp 타입 정의
interface TelegramWebApp {
  WebApp: {
    expand: () => void;
    close: () => void;
  };
}

// window.Telegram을 안전하게 사용하기 위해 타입 캐스팅
declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

export default function Home() {
  const [samu, setSamu] = useState<number | null>(null); // ✅ 초기값 null로 변경
  const [isLoading, setIsLoading] = useState(true); // ✅ 로딩 상태 추가
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 실행되도록 체크
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      setIsTelegram(true); // 텔레그램 환경임을 체크
    }

    // MongoDB에서 데이터 불러오기
    const loadData = async () => {
      const userId = "6829222253";
      const response = await fetch(`/api/load?userId=${userId}`);
      const data = await response.json();
      console.log("📢 서버에서 불러온 값:", data.samu);

      if (data.samu !== undefined) {
        setSamu(data.samu); // ✅ 서버에서 받은 값 적용
      } else {
        setSamu(0); // 데이터가 없을 때만 0으로 설정
      }
      setIsLoading(false); // ✅ 로딩 완료 후 버튼 활성화
    };

    loadData();
  }, []);

  // 버튼 클릭 시 SAMU 값 증가 & MongoDB 저장
  const handleClick = async () => {
    if (isLoading || samu === null) return; // 🚨 로딩 중에는 클릭 방지

    const userId = "6829222253";
    const newSamu = Math.max(samu + 1, 1); // ✅ 최소값 1 보장 (0으로 저장 방지)
    setSamu(newSamu);

    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, samu: newSamu }),
    });
    console.log("Samu increased to:", newSamu);
  };

  // ✅ 로딩 중이면 "Loading..." 표시
  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">SAMU Dojo Smasher</h1>
      <p className="text-6xl my-10">SAMU: {samu}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
        disabled={isLoading} // ✅ 로딩 중에는 버튼 비활성화
      >
        Smash Dojo!
      </button>

      {/* 텔레그램에서 실행될 때만 "닫기" 버튼 표시 */}
      {isTelegram && (
        <button
          className="mt-5 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.Telegram?.WebApp?.close()}
        >
          닫기
        </button>
      )}
    </main>
  );
}
