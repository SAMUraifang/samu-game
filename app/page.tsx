"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Telegram WebApp 타입 정의
interface TelegramWebApp {
  WebApp: {
    expand: () => void;
    close: () => void;
    viewportHeight: number;
    viewportStableHeight: number;
  };
}

// window.Telegram을 안전하게 사용하기 위해 타입 캐스팅
declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

export default function Home() {
  const [samu, setSamu] = useState<number | null>(null);
  const [energy, setEnergy] = useState(8500); // 에너지 최대값 Notcoin처럼 8500으로 설정
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0); // Telegram 뷰포트 높이 상태
  const [showPlusOne, setShowPlusOne] = useState(false); // "+1" 텍스트 표시 상태
  const maxEnergy = 8500; // 에너지 최대값 (놉코인처럼 조정)

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      setIsTelegram(true);
      // Telegram WebApp 뷰포트 높이 설정 (상단/하단 패딩 고려)
      const height = window.Telegram.WebApp.viewportStableHeight || window.innerHeight;
      setViewportHeight(height - 104); // 상단 56px, 하단 48px 패딩 제거
    } else {
      // 웹 환경에서는 전체 화면 높이 사용
      setViewportHeight(window.innerHeight);
    }

    const loadData = async () => {
      const userId = "6829222253";
      const response = await fetch(`/api/load?userId=${userId}`);
      const data = await response.json();
      console.log("📢 서버에서 불러온 값:", data.samu);

      if (data.samu !== undefined) {
        setSamu(data.samu);
      } else {
        setSamu(0);
      }
      if (data.energy !== undefined) {
        setEnergy(data.energy);
      } else {
        setEnergy(maxEnergy);
      }
      setIsLoading(false);
    };

    loadData();

    const energyInterval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 200, maxEnergy)); // 5초마다 에너지 200 회복
    }, 5000);
    return () => clearInterval(energyInterval);
  }, []);

  const handleClick = async () => {
    if (isLoading || samu === null || energy < 100) return;

    const userId = "6829222253";
    const newSamu = Math.max(samu + 1, 1);
    setSamu(newSamu);
    setEnergy(energy - 100); // "Smash Dojo!" 클릭 시 에너지 100 소모
    setShowPlusOne(true); // "+1" 텍스트 표시

    // 1초 후 "+1" 텍스트 숨김
    setTimeout(() => setShowPlusOne(false), 1000);

    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, samu: newSamu, energy: energy - 100 }),
    });
    console.log("Samu increased to:", newSamu);
  };

  const handleBoost = async () => {
    if (isLoading || samu === null || energy < 200) return;

    const userId = "6829222253";
    const newSamu = Math.max(samu + 10, 1);
    setSamu(newSamu);
    setEnergy(energy - 200); // "Boosts" 클릭 시 에너지 200 소모

    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, samu: newSamu, }),
    });
    console.log("Samu boosted to:", newSamu);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <main
      className="flex flex-col items-center justify-between p-4 bg-cover bg-center"
      style={{
        backgroundImage: `url('/background.png')`,
        backgroundRepeat: 'no-repeat',
        minHeight: `${viewportHeight}px`, // Telegram 뷰포트 높이에 맞춤
        maxWidth: '100%', // 모바일 너비 제한
      }}
    >
      {/* 상단: 점수 및 코인 (놉코인 상단 위치, 패딩 고려) */}
      <div className="w-full text-center py-2 text-yellow-300">
        <div className="flex items-center justify-center gap-2">
          <p className="text-3xl font-bold">SAMU: {samu}</p>
          <Image
            src="/coin.png"
            alt="Coin Icon"
            width={60} // "SAMU" 크기와 비슷한 크기 (조정 가능)
            height={60}
            className="inline-block"
          />
        </div>
      </div>

      {/* 중앙: 큰 클릭 버튼 및 "+1" 텍스트 (놉코인 버튼 위치) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <button
          onClick={handleClick}
          disabled={isLoading || energy < 100}
          style={{ zIndex: 10, border: 'none', background: 'none', padding: 0 }}
        >
          <Image
            src="/click.png"
            alt="Click Button"
            width={300} // 모바일에 맞게 크기 조정 (필요하면 250~350으로 조정)
            height={300}
            className="hover:scale-102 transition-transform duration-200 active:scale-99"
          />
        </button>
        {showPlusOne && (
          <span
            className="absolute text-xs text-yellow-300 opacity-50 animate-fade-out"
            style={{ top: '-40px', left: '50%', transform: 'translateX(-50%)' }}
          >
            +1
          </span>
        )}
      </div>

      {/* 하단: 에너지 및 메뉴 (놉코인 하단 위치, 패딩 고려) */}
      <div className="w-full text-center py-2 text-yellow-300">
        <div className="w-[80%] mx-auto h-6 bg-gray-300 rounded-full overflow-hidden mb-2 shadow-md">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm font-light text-yellow-300">Energy: {energy}/{maxEnergy}</p>
        <div className="flex justify-around mt-2 text-gray-300 text-xs">
          <button className="hover:text-yellow-300">Frns</button>
          <button className="hover:text-yellow-300">Earn</button>
          <button
            className="hover:text-yellow-300"
            onClick={handleBoost}
            disabled={isLoading || energy < 200}
          >
            Boosts
          </button>
        </div>
      </div>

      {isTelegram && (
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded absolute bottom-2 right-2 text-xs"
          onClick={() => window.Telegram?.WebApp?.close()}
          style={{ zIndex: 10 }}
        >
          닫기
        </button>
      )}
    </main>
  );
}