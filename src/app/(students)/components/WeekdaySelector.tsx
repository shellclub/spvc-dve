// app/internship-report/components/WeekdaySelector.tsx
"use client";

import React from "react";

const weekdays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

type Props = {
  selectedDays: string[];
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function weekdaySelector({ selectedDays, setSelectedDays }: Props) {
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div>
      <label className="block mb-2 font-medium">เลือกวันที่ฝึกงาน</label>
      <div className="grid grid-cols-3 gap-2">
        {weekdays.map((day) => (
          <button
            type="button"
            key={day}
            onClick={() => toggleDay(day)}
            className={`p-2 rounded-xl border ${
              selectedDays.includes(day)
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
