"use client"

import React, { useState } from "react";
import { TopCards } from "../components/dashboards/modern/TopCards";
import DetailTable from "../components/dashboards/modern/DetailTable";

const Page = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleCardClick = (key: string) => {
    setActiveCard(activeCard === key ? null : key);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          👋 สวัสดี, ยินดีต้อนรับ
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mt-1">
          ภาพรวมระบบรายงานการฝึกงาน
        </p>
      </div>
      <TopCards activeCard={activeCard} onCardClick={handleCardClick} />

      {activeCard && (
        <DetailTable
          cardKey={activeCard}
          onClose={() => setActiveCard(null)}
        />
      )}
    </>
  );
};

export default Page;
