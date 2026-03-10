"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { showToast } from "@/app/components/sweetalert/sweetalert";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const WEEKDAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
const WEEKDAY_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const TH_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

// Map JS day (0=Sun) to Thai weekday index (0=Mon)
function jsToThaiDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ═══════════════════════════════════════════
//  DASHBOARD COMPONENT
// ═══════════════════════════════════════════
export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [savingDays, setSavingDays] = useState(false);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  // SWR keys
  const internshipKey = session?.user?.id ? `/api/internship/${session.user.id}` : null;
  const reportsKey = session?.user?.id ? `/api/report/getBystudent/${session.user.id}` : null;

  const { data: internship, mutate: mutateInternship } = useSWR(internshipKey, fetcher);
  const { data: reports } = useSWR(reportsKey, fetcher);

  // Sync weekday selection from fetched data
  useEffect(() => {
    if (internship?.selectedDays && Array.isArray(internship.selectedDays)) {
      setSelectedDays(internship.selectedDays);
    }
  }, [internship]);

  // ─ Report date set for calendar ─
  const reportDateSet = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(reports)) {
      reports.forEach((r: any) => {
        if (r.reportDate) {
          const d = new Date(r.reportDate);
          set.add(toDateKey(d));
        }
      });
    }
    return set;
  }, [reports]);

  // ─ Stats computation ─
  const stats = useMemo(() => {
    const totalReports = Array.isArray(reports) ? reports.length : 0;

    // Count missed days: days in selectedDays from internship start to today that have no report
    let missedDays = 0;
    if (selectedDays.length > 0 && internship) {
      const startDate = internship.startDate ? new Date(internship.startDate) : null;
      const endDate = internship.endDate ? new Date(internship.endDate) : null;
      if (startDate) {
        const end = endDate && endDate < today ? endDate : today;
        const d = new Date(startDate);
        while (d <= end) {
          const thaiDay = jsToThaiDay(d.getDay());
          const dayName = WEEKDAYS[thaiDay];
          if (selectedDays.includes(dayName) && !reportDateSet.has(toDateKey(d))) {
            missedDays++;
          }
          d.setDate(d.getDate() + 1);
        }
      }
    }

    // Current week number
    const start = internship?.startDate ? new Date(internship.startDate) : null;
    let currentWeek = 0;
    if (start) {
      const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      currentWeek = Math.max(1, Math.ceil((diff + 1) / 7));
    }

    return { totalReports, missedDays, currentWeek, daysPerWeek: selectedDays.length };
  }, [reports, selectedDays, internship, reportDateSet]);

  // ─ Toggle weekday ─
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // ─ Save weekday selection ─
  const saveWeekdays = async () => {
    if (!session?.user?.id) return;
    setSavingDays(true);
    try {
      const res = await fetch("/api/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.user.id,
          selectedDays,
          dayperweeks: selectedDays.length,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "บันทึกสำเร็จ", "success");
        mutateInternship();
      } else {
        showToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    } finally {
      setSavingDays(false);
    }
  };

  // ─ Calendar navigation ─
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  // ─ Calendar days ─
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days: { date: Date | null; day: number; status: "logged" | "missed" | "future" | "off" | "empty" }[] = [];

    // Leading empties
    for (let i = 0; i < firstDay; i++) days.push({ date: null, day: 0, status: "empty" });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      const thaiDay = jsToThaiDay(date.getDay());
      const dayName = WEEKDAYS[thaiDay];
      const isTrainingDay = selectedDays.includes(dayName);
      const dateKey = toDateKey(date);
      const isFuture = date > today;
      const hasReport = reportDateSet.has(dateKey);

      let status: "logged" | "missed" | "future" | "off" | "empty";
      if (!isTrainingDay) status = "off";
      else if (isFuture) status = "future";
      else if (hasReport) status = "logged";
      else status = "missed";

      days.push({ date, day: d, status });
    }
    return days;
  }, [calYear, calMonth, selectedDays, reportDateSet]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ──── Header ──── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
          <Icon icon="tabler:dashboard" className="text-white" width={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">ภาพรวมข้อมูลการฝึกงาน</p>
        </div>
      </div>

      {/* ──── Stats Cards ──── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="tabler:calendar-check" label="วันที่บันทึกแล้ว" value={stats.totalReports} color="from-emerald-500 to-green-600" />
        <StatCard icon="tabler:calendar-x" label="วันที่ขาด" value={stats.missedDays} color="from-red-400 to-rose-500" />
        <StatCard icon="tabler:calendar-week" label="สัปดาห์ที่" value={stats.currentWeek || "-"} color="from-blue-400 to-indigo-500" />
        <StatCard icon="tabler:clock" label="วัน/สัปดาห์" value={`${stats.daysPerWeek} วัน`} color="from-amber-400 to-orange-500" />
      </div>

      {/* ──── Weekday Selector ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon icon="tabler:calendar-event" width={22} className="text-[#2E7D32]" />
          <h2 className="text-lg font-bold text-gray-800">เลือกวันที่ฝึกงาน</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {WEEKDAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2
                ${selectedDays.includes(day)
                  ? "bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white border-transparent shadow-md scale-[1.02]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={saveWeekdays}
            disabled={savingDays}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-sm"
          >
            {savingDays ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Icon icon="tabler:device-floppy" width={18} /> บันทึกวันฝึกงาน</>
            )}
          </button>
        </div>
      </div>

      {/* ──── Calendar ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon icon="tabler:calendar" width={22} className="text-[#2E7D32]" />
            <h2 className="text-lg font-bold text-gray-800">ปฏิทินการฝึกงาน</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Icon icon="tabler:chevron-left" width={20} className="text-gray-600" />
            </button>
            <span className="text-base font-semibold text-gray-700 min-w-[160px] text-center">
              {TH_MONTHS_FULL[calMonth]} {calYear + 543}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Icon icon="tabler:chevron-right" width={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => (
            <div key={idx} className="aspect-square">
              {cell.date ? (
                <button
                  onClick={() => {
                    if (cell.status === "missed" || cell.status === "logged") {
                      router.push(`/reportintern?date=${toDateKey(cell.date!)}`);
                    }
                  }}
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 relative group
                    ${cell.status === "logged"
                      ? "bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200"
                      : cell.status === "missed"
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200 cursor-pointer"
                        : cell.status === "future"
                          ? "bg-blue-50/50 text-blue-400 border border-blue-100"
                          : cell.status === "off"
                            ? "bg-gray-50 text-gray-300"
                            : ""
                    }
                    ${isSameDay(cell.date, today) ? "ring-2 ring-[#2E7D32] ring-offset-1" : ""}
                  `}
                >
                  <span>{cell.day}</span>
                  {cell.status === "logged" && (
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-0.5" />
                  )}
                  {cell.status === "missed" && (
                    <span className="w-2 h-2 rounded-full bg-red-400 mt-0.5" />
                  )}
                  {/* Tooltip on hover */}
                  {(cell.status === "missed" || cell.status === "logged") && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {cell.status === "logged" ? "บันทึกแล้ว ✓" : "ยังไม่ได้บันทึก"}
                    </span>
                  )}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-green-500" /> บันทึกแล้ว
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-red-400" /> ยังไม่ได้บันทึก
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-blue-300" /> วันที่จะถึง
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-gray-200" /> ไม่ใช่วันฝึก
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full ring-2 ring-[#2E7D32]" /> วันนี้
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Component ───
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex items-center gap-4 hover:shadow-xl transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon icon={icon} className="text-white" width={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
