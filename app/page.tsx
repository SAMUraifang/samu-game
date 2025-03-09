"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [samu, setSamu] = useState<number | null>(null);
  const [energy, setEnergy] = useState(8500);
  const [isRaidTime, setIsRaidTime] = useState(false);
  const [raidEnemy, setRaidEnemy] = useState("/meme1.png");
  const [showPlusOne, setShowPlusOne] = useState(false);

  useEffect(() => {
    const maxEnergy = 8500;

    const loadData = async () => {
      const userId = "6829222253";
      const response = await fetch(`/api/load?userId=${userId}`);
      const data = await response.json();
      console.log("📢 서버에서 불러온 값:", data.samu);

      setSamu(data.samu ?? 0);
      setEnergy(data.energy ?? maxEnergy);
    };

    loadData();

    // 🔥 5초마다 에너지 회복 (최대 maxEnergy 초과 금지)
    const energyInterval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 200, maxEnergy));
    }, 5000);

    return () => clearInterval(energyInterval);
  }, []);

  // 🔥 클릭 시 점수 증가 (+1 / +2 애니메이션 추가)
  const handleClick = async () => {
    if (samu === null || energy < 100) return;

    const userId = "6829222253";
    const bonus = isRaidTime ? 2 : 1;
    const newSamu = samu + bonus;
    setSamu(newSamu);
    setEnergy((prev) => prev - 100);

    setShowPlusOne(true);
    setTimeout(() => setShowPlusOne(false), 1000); // 🔥 1초 후 서서히 사라지게

    console.log("🔥 점수 증가:", newSamu);

    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, samu: newSamu, energy: energy - 100 }),
    });
  };

  // 🔥 Dojo Challenge 버튼 클릭 시 이벤트 트리거
  const startDojoChallenge = () => {
    setIsRaidTime(true);
    const newRaidEnemy = Math.random() > 0.5 ? "/meme1.png" : "/meme2.png";
    setRaidEnemy(newRaidEnemy);
    console.log("🔥 Dojo Challenge 시작! 침입자:", newRaidEnemy);

    setTimeout(() => {
      setIsRaidTime(false);
    }, 60000);
  };

  return (
    <main
      className="flex flex-col items-center justify-between p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `url('/background.png')`,
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        maxWidth: "100%",
      }}
    >
      {/* 상단: 점수 및 Dojo Challenge 버튼 */}
      <div className="w-full flex justify-center items-center mt-2 relative">
        <p className="text-3xl font-bold text-yellow-300">SAMU: {samu}</p>
        <Image src="/coin.png" alt="Coin Icon" width={40} height={40} className="ml-2" />

        {/* Dojo Challenge 버튼 */}
        <div className="absolute left-1 top-0 text-center">
          <button 
            onClick={startDojoChallenge} 
            className="text-white font-bold text-xs leading-tight transition-transform hover:opacity-80 active:scale-95"
          >
            <span className="text-lg">⚔️</span><br />Dojo<br />Challenge
          </button>
        </div>
      </div>

      {/* 중앙: 클릭 버튼 (🔥 클릭 효과 추가) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <button 
          onClick={handleClick} 
          className="transition-transform active:scale-95 relative"
        >
          <Image
            src={isRaidTime ? raidEnemy : "/click.png"} 
            alt="Click Button"
            width={250}
            height={250}
            className="hover:scale-102 transition-transform duration-200"
          />
          {/* 🔥 클릭했을 때 +1 / +2 애니메이션 (자연스럽게 보였다가 서서히 사라짐) */}
          {showPlusOne && (
            <span className="absolute text-lg text-yellow-300 font-bold top-[-30px] left-[50%] translate-x-[-50%] opacity-50 animate-fade-in-out">
              {isRaidTime ? "+2" : "+1"}
            </span>
          )}
        </button>
      </div>

      {/* 하단: 에너지 바 (🔥 위치 조정 - 살짝 위로 이동) */}
      <div className="w-full text-center py-2 text-yellow-300 mb-6">
        <div className="w-[80%] mx-auto h-6 bg-gray-300 rounded-full overflow-hidden mb-2 shadow-md">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500"
               style={{ width: `${(energy / 8500) * 100}%` }}></div>
        </div>
        <p className="text-sm font-light text-yellow-300">Energy: {energy}/8500</p>
      </div>

      {/* 하단 메뉴 */}
      <div className="absolute bottom-4 w-full flex justify-around text-white text-lg">
        <button className="flex flex-col items-center">
          <span className="text-xl">💪</span>
          Upgrade
        </button>
        <button className="flex flex-col items-center">
          <span className="text-xl">🏆</span>
          Rank
        </button>
      </div>
    </main>
  );
}
