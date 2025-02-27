"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [samu, setSamu] = useState(0);

  useEffect(() => {
    // 텔레그램 WebApp 확장 (텔레그램에서 실행될 경우만)
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }

    // MongoDB에서 데이터 불러오기
    const loadData = async () => {
      const userId = "6829222253";
      const response = await fetch(`/api/load?userId=${userId}`);
      const data = await response.json();
      setSamu(data.samu || 0);
    };
    loadData();
  }, []);

  // 버튼 클릭 시 SAMU 값 증가 & MongoDB 저장
  const handleClick = async () => {
    const userId = "6829222253";
    const newSamu = samu + 1;
    setSamu(newSamu);
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, samu: newSamu }),
    });
    console.log("Samu increased to:", newSamu);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">SAMU Dojo Smasher</h1>
      <p className="text-6xl my-10">SAMU: {samu}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Smash Dojo!
      </button>

      {/* 텔레그램에서 실행될 때만 "닫기" 버튼 표시 */}
      {typeof window !== "undefined" && window.Telegram?.WebApp && (
        <button
          className="mt-5 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.Telegram.WebApp.close()}
        >
          닫기
        </button>
      )}
    </main>
  );
}
