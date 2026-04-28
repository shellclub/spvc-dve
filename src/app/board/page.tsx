"use client";
import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Thai month names
const TH_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// Board position mapping (by order of ID)
const BOARD_POSITIONS = [
  { title: "ผู้อำนวยการวิทยาลัย", icon: "tabler:crown", color: "from-amber-500 to-yellow-500" },
  { title: "รองผู้อำนวยการวิทยาลัย", icon: "tabler:shield-check", color: "from-blue-500 to-cyan-500" },
  { title: "รองผู้อำนวยการวิทยาลัย", icon: "tabler:shield-check", color: "from-emerald-500 to-green-500" },
  { title: "รองผู้อำนวยการวิทยาลัย", icon: "tabler:shield-check", color: "from-purple-500 to-violet-500" },
  { title: "รองผู้อำนวยการวิทยาลัย", icon: "tabler:shield-check", color: "from-rose-500 to-pink-500" },
];

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]}`;
}

// ───────────── Mini Bar Chart ─────────────
function MiniBarChart({ data, maxValue }: { data: { date: string; count: number }[]; maxValue: number }) {
  const barMax = maxValue || 1;
  return (
    <div className="flex items-end gap-1.5 h-32 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs font-bold text-gray-700">{d.count}</span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 min-h-[4px]"
            style={{ height: `${Math.max((d.count / barMax) * 100, 4)}%` }}
          />
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{shortDate(d.date)}</span>
        </div>
      ))}
    </div>
  );
}

// ───────────── Donut Chart (CSS) ─────────────
function DonutChart({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const remaining = 100 - pct;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${pct}, ${remaining}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{value}</span>
          <span className="text-[10px] text-gray-400">/{total}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium text-center">{label}</span>
    </div>
  );
}

// ───────────── Stat Card ─────────────
function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon icon={icon} className="text-white" width={28} />
        </div>
        <div>
          <p className="text-3xl font-extrabold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ───────────── Progress Bar ─────────────
function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 font-medium">{label}</span>
        <span className="text-sm font-bold text-gray-700">{value}/{max} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════
export default function BoardDashboard() {
  const { data, error, isLoading } = useSWR("/api/dashboard/stats", fetcher, {
    refreshInterval: 30000,
  });

  const barMax = useMemo(() => {
    if (!data?.dailyReports) return 1;
    return Math.max(...data.dailyReports.map((d: any) => d.count), 1);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">กำลังโหลดข้อมูลภาพรวม...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon icon="tabler:alert-triangle" className="text-red-400 mx-auto mb-3" width={48} />
          <p className="text-gray-500">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  const { overview, internship, reports, companies, teachers, departmentStats, dailyReports, recentSupervisions, companyRanking, boardMembers } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ──── Header ──── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Icon icon="tabler:chart-pie" className="text-white" width={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">ภาพรวมระบบ</h1>
            <p className="text-sm text-gray-500">Dashboard สำหรับผู้บริหาร — อัพเดททุก 30 วินาที</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* ──── Board Team ──── */}
      {boardMembers?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Icon icon="tabler:shield-star" width={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">คณะผู้บริหาร</h2>
            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{boardMembers.length} ท่าน</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {boardMembers.map((member: any, i: number) => {
              const pos = BOARD_POSITIONS[i] || { title: "ผู้บริหาร", icon: "tabler:user", color: "from-gray-500 to-gray-600" };
              return (
                <div key={member.id} className={`relative rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all group overflow-hidden ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${pos.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />
                  <div className="relative flex flex-col items-center text-center gap-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pos.color} flex items-center justify-center shadow-md`}>
                      <Icon icon={pos.icon} className="text-white" width={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{member.firstname} {member.lastname}</p>
                      <p className="text-[11px] text-gray-500 leading-tight mt-1">{pos.title}</p>
                    </div>
                    {member.phone && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Icon icon="tabler:phone" width={10} />
                        {member.phone}
                      </p>
                    )}
                  </div>
                  {i === 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">หัวหน้า</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── Overview Stats ──── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon="tabler:school" label="นักศึกษาทั้งหมด" value={overview.totalStudents} color="from-blue-500 to-blue-600" />
        <StatCard icon="tabler:chalkboard" label="บุคลากร" value={overview.totalTeachers} color="from-purple-500 to-purple-600" sub={`${overview.totalDepartments} แผนก · ${overview.totalMajors} สาขา`} />
        <StatCard icon="tabler:building" label="สถานประกอบการ" value={overview.totalCompanies} color="from-amber-500 to-orange-500" />
        <StatCard icon="tabler:file-text" label="รายงานทั้งหมด" value={overview.totalReports} color="from-emerald-500 to-green-600" />
        <StatCard icon="tabler:eye-check" label="การนิเทศ" value={overview.totalSupervisions} color="from-pink-500 to-rose-500" />
      </div>

      {/* ──── Row 2: Status Donuts + Chart ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut charts */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Icon icon="tabler:chart-donut-3" width={20} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-800">สถานะนักศึกษา</h2>
          </div>
          <div className="flex flex-wrap justify-around gap-4">
            <DonutChart value={reports.studentsReported} total={overview.totalStudents} color="#22c55e" label="บันทึกรายงานแล้ว" />
            <DonutChart value={companies.studentsAssigned} total={overview.totalStudents} color="#3b82f6" label="จับคู่สถานประกอบการ" />
            <DonutChart value={internship.configured} total={overview.totalStudents} color="#a855f7" label="ตั้งค่าวันฝึกงาน" />
          </div>
        </div>

        {/* Daily reports chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon icon="tabler:chart-bar" width={20} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">รายงานฝึกงาน 7 วันล่าสุด</h2>
            </div>
            <span className="text-sm text-gray-400">จำนวนรายงานต่อวัน</span>
          </div>
          <MiniBarChart data={dailyReports} maxValue={barMax} />
        </div>
      </div>

      {/* ──── Row 3: Progress Bars ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Icon icon="tabler:users" width={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">สถานะนักศึกษา</h2>
          </div>
          <ProgressBar value={reports.studentsReported} max={overview.totalStudents} color="bg-gradient-to-r from-green-400 to-green-500" label="📝 บันทึกรายงานแล้ว" />
          <ProgressBar value={companies.studentsAssigned} max={overview.totalStudents} color="bg-gradient-to-r from-blue-400 to-blue-500" label="🏢 จับคู่สถานประกอบการแล้ว" />
          <ProgressBar value={internship.configured} max={overview.totalStudents} color="bg-gradient-to-r from-purple-400 to-purple-500" label="📅 ตั้งค่าวันฝึกงานแล้ว" />
          
          {/* Alert for students not reported */}
          {reports.studentsNotReported > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
              <Icon icon="tabler:alert-circle" width={20} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600">
                มีนักศึกษา <strong>{reports.studentsNotReported} คน</strong> ที่ยังไม่เคยบันทึกรายงานเลย
              </span>
            </div>
          )}
        </div>

        {/* Teacher/supervision progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Icon icon="tabler:chalkboard" width={20} className="text-purple-500" />
            <h2 className="text-lg font-bold text-gray-800">สถานะครูและการนิเทศ</h2>
          </div>
          <ProgressBar value={teachers.assigned} max={overview.totalTeachers} color="bg-gradient-to-r from-indigo-400 to-indigo-500" label="👨‍🏫 ครูที่มีนักศึกษาในดูแล" />
          <ProgressBar value={teachers.supervisedCount} max={teachers.supervisionTeachers} color="bg-gradient-to-r from-pink-400 to-pink-500" label="✅ ครูนิเทศที่ไปนิเทศแล้ว" />

          {teachers.notSupervised > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <Icon icon="tabler:alert-triangle" width={20} className="text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-700">
                มีครูนิเทศ <strong>{teachers.notSupervised} คน</strong> ที่ยังไม่ได้ไปนิเทศ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ──── Row 4: Department stats + Company ranking ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Department breakdown */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Icon icon="tabler:building-community" width={20} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-800">สถิติรายแผนก</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">แผนก</th>
                  <th className="text-center py-3 px-2 text-gray-500 font-semibold">นักศึกษา</th>
                  <th className="text-center py-3 px-2 text-gray-500 font-semibold">สาขา</th>
                  <th className="text-center py-3 px-2 text-gray-500 font-semibold">รายงาน</th>
                  <th className="text-center py-3 px-2 text-gray-500 font-semibold">บันทึกแล้ว</th>
                  <th className="text-center py-3 px-2 text-gray-500 font-semibold">ยังไม่บันทึก</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats?.map((dept: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-700">{dept.name}</td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm">
                        {dept.students}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 text-gray-500">{dept.majors}</td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-50 text-green-700 rounded-lg font-bold text-sm">
                        {dept.reports}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="text-green-600 font-semibold">{dept.studentsWithReport}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      {dept.studentsNoReport > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          {dept.studentsNoReport}
                        </span>
                      ) : (
                        <span className="text-green-500">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Company ranking */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Icon icon="tabler:trophy" width={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">สถานประกอบการ</h2>
          </div>
          <div className="space-y-3">
            {companyRanking?.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : "bg-orange-50 text-orange-600"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{c.name}</p>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                  <Icon icon="tabler:users" width={14} />
                  <span className="text-sm font-bold">{c.students}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── Row 5: Recent Supervisions ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Icon icon="tabler:eye" width={20} className="text-pink-500" />
          <h2 className="text-lg font-bold text-gray-800">บันทึกการนิเทศล่าสุด</h2>
        </div>
        {recentSupervisions?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSupervisions.map((sv: any) => (
              <div key={sv.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    sv.type === "ON_SITE" ? "bg-blue-100 text-blue-700" : sv.type === "ONLINE" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {sv.type === "ON_SITE" ? "🏢 ไปดูที่สถานที่" : sv.type === "ONLINE" ? "💻 ออนไลน์" : "📞 โทร"}
                  </span>
                  <span className="text-xs text-gray-400">{formatThaiDate(sv.supervisionDate)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {sv.studentName}
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  🏢 {sv.companyName}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">{sv.notes}</p>
                <div className="mt-3 pt-2 border-t border-gray-50 flex items-center gap-1.5">
                  <Icon icon="tabler:user" width={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    อ.{sv.teacherName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Icon icon="tabler:mood-empty" width={40} className="mx-auto mb-2" />
            <p>ยังไม่มีบันทึกการนิเทศ</p>
          </div>
        )}
      </div>
    </div>
  );
}