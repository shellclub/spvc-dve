// app/intern-report/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Spinner } from "flowbite-react";

const weekdays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function InternshipReportForm() {
  const { register, handleSubmit, watch } = useForm();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const route = useRouter();
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR(`/api/internship/${session?.user.id}`,fetcher);
  useEffect(() => {
    if (data) {
      const { selectedDays } = data;
      setSelectedDays(selectedDays);
    }
  }
  , [data]);
  if(isLoading) {
      return ;
  } 
  if(error) {
      return <div className="text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;
  }
  
  
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      selectedDays,
      dayPerWeeks: selectedDays.length
    };
    const result = await fetch("/api/internship", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if(!result.ok) {
      if(result.status === 401) {
        route.push("/signin")
      }

      const data = await result.json();
      showToast(data.message, data.type)
    }else{
      const data = await result.json();
      showToast(data.message, data.type);
      mutate();
    }

  };

  return (
    <div className="min-w-full mx-auto mt-10 p-6 rounded-xl shadow-lg border">
      <h2 className="text-xl font-semibold mb-4">รายงานฝึกงาน</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    : "bg-gray-100 dark:bg-gray-800 dark:text-white text-black"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
        >
          บันทึกข้อมูล
        </button>
      </form>
    </div>
  );
}
