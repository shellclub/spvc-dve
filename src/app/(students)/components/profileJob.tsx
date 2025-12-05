"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";
// import { Spinner } from "flowbite-react"; // อย่าลืม import Spinner หรือ loading component

const weekdays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// สร้าง Interface เพื่อ Type Safety (ตัวอย่าง)
interface InternshipData {
  id?: string;
  companyId?: string;
  selectedDays?: string[];
  [key: string]: any;
}

export default function InternshipReportForm() {
  const { register, handleSubmit } = useForm(); // ไม่ได้ใช้ watch เอาออกได้
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const route = useRouter();
  const { data: session, status } = useSession();
  
  const isSessionLoading = status === "loading";
  
  // ป้องกัน swrkey เป็น undefined string
  const swrkey = session?.user?.id ? `/api/internship/${session.user.id}` : null;
  
  const { data: fetchedData, error, isLoading, mutate } = useSWR<InternshipData>(swrkey, fetcher);

  // Set default data เมื่อ fetch สำเร็จ
  useEffect(() => {
    if (fetchedData) {
      const { selectedDays: savedDays } = fetchedData;
      // เช็คว่าเป็น Array จริงไหมก่อน set
      if (Array.isArray(savedDays)) {
        setSelectedDays(savedDays);
      }
    }
  }, [fetchedData]);

  // FIX: ห้าม return undefined
  if (isLoading || isSessionLoading) {
    return null; 
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">ไม่สามารถโหลดข้อมูลได้</div>;
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onSubmit = async (formData: any) => {
    if (!session?.user?.id) {
        showToast("กรุณาเข้าสู่ระบบก่อนบันทึก", "error");
        return;
    }

    // FIX: เพิ่ม userId และ companyId เข้าไปใน payload
    // หมายเหตุ: companyId ต้องดูว่ามาจาก session หรือ fetchedData
    const payload = {
      ...formData,
      id: session.user.id, // เพิ่ม id user
      companyId: fetchedData?.companyId, // ลองดึงจากข้อมูลเก่าที่ fetch มา (ถ้ามี)
      selectedDays,
      dayperweeks: selectedDays.length
    };

    console.log("Debug Payload:", payload); // ตรวจสอบค่าที่นี่

    try {
        const result = await fetch("/api/internship", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const responseData = await result.json();

        if (!result.ok) {
          if (result.status === 401) {
            route.push("/signin");
            return;
          }
          showToast(responseData.message || "เกิดข้อผิดพลาด", responseData.type || "error");
        } else {
          showToast(responseData.message || "บันทึกสำเร็จ", responseData.type || "success");
          mutate(); // Refresh ข้อมูล
        }
    } catch (err) {
        console.error(err);
        showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  return (
    <div className="min-w-full mx-auto mt-10 p-6 rounded-xl shadow-lg border bg-white dark:bg-gray-900">
      <h2 className="text-xl font-semibold mb-4">รายงานฝึกงาน</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">เลือกวันที่ฝึกงาน</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {weekdays.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-2 rounded-xl border transition-colors ${
                  selectedDays.includes(day)
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-gray-100 dark:bg-gray-800 dark:text-white text-black hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* ถ้าต้องการ debug ว่า companyId มาไหม ให้เปิดบรรทัดนี้ */}
        {/* <pre>{JSON.stringify({ userId: session?.user?.id, companyId: fetchedData?.companyId }, null, 2)}</pre> */}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
        >
          บันทึกข้อมูล
        </button>
      </form>
    </div>
  );
}