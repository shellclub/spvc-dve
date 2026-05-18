"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import type { InternshipDashboardData, StudentSummary, TeacherSummary } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/shadcn-ui/Default-Ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/shadcn-ui/Default-Ui/table";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TH_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatThaiDate(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]}`;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-md border border-gray-100 p-5 transition-all ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon icon={icon} className="text-white" width={24} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-500" : "bg-red-400"}`} />
      {label ?? (ok ? "บันทึกแล้ว" : "ยังไม่บันทึก")}
    </span>
  );
}

function SupervisionBadge({ status }: { status: TeacherSummary["supervisionStatus"] }) {
  const map = {
    done: { text: "นิเทศแล้ว (30 วัน)", cls: "bg-green-100 text-green-700" },
    partial: { text: "เคยนิเทศ (เกิน 30 วัน)", cls: "bg-amber-100 text-amber-700" },
    none: { text: "ยังไม่นิเทศ", cls: "bg-red-100 text-red-600" },
  };
  const s = map[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.text}</span>;
}

type TabId = "staff" | "students" | "teachers";
type PeriodId = "daily" | "weekly" | "monthly";

function staffListPath(basePath: "/board" | "/supervision" | "/admin") {
  if (basePath === "/admin") return "/admin/teachers";
  return `${basePath}/teacher`;
}

function supervisionListPath(basePath: "/board" | "/supervision" | "/admin") {
  if (basePath === "/board") return "/board/supervision";
  if (basePath === "/supervision") return "/supervision/students/supervise/views";
  return "/admin/teachers";
}

export default function InternshipDashboard({
  basePath,
}: {
  basePath: "/board" | "/supervision" | "/admin";
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("students");
  const [period, setPeriod] = useState<PeriodId>("monthly");
  const [studentFilter, setStudentFilter] = useState<"all" | "today" | "week" | "month" | "none">("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSummary | null>(null);

  const { data, error, isLoading } = useSWR<InternshipDashboardData>(
    "/api/dashboard/internship",
    fetcher,
    { refreshInterval: 60000 }
  );

  const filteredStudents = useMemo(() => {
    if (!data || !("students" in data) || !Array.isArray(data.students)) return [];
    return data.students.filter((s) => {
      if (studentFilter === "today") return s.hasReportToday;
      if (studentFilter === "week") return s.hasReportThisWeek;
      if (studentFilter === "month") return s.hasReportThisMonth;
      if (studentFilter === "none") return !s.hasReportThisMonth;
      return true;
    });
  }, [data, studentFilter]);

  const chartOptions = useMemo(() => {
    if (!data || !("monthlyReports" in data) || !Array.isArray(data.monthlyReports)) return null;
    if (period === "monthly") {
      return {
        options: {
          chart: { toolbar: { show: false }, fontFamily: "inherit" },
          stroke: { curve: "smooth" as const, width: 2 },
          xaxis: { categories: data.monthlyReports.map((m) => m.label) },
          colors: ["#3b82f6", "#22c55e"],
          legend: { position: "top" as const },
          dataLabels: { enabled: false },
        },
        series: [
          { name: "จำนวนรายงาน", data: data.monthlyReports.map((m) => m.reportCount) },
          { name: "นักศึกษาที่บันทึก", data: data.monthlyReports.map((m) => m.studentCount) },
        ],
      };
    }
    if (period === "weekly") {
      return {
        options: {
          chart: { toolbar: { show: false }, fontFamily: "inherit" },
          xaxis: {
            categories: data.weeklyReports.map((w) => shortDate(w.weekStart)),
          },
          colors: ["#8b5cf6"],
          dataLabels: { enabled: false },
        },
        series: [{ name: "รายงาน/สัปดาห์", data: data.weeklyReports.map((w) => w.reportCount) }],
      };
    }
    return {
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        xaxis: { categories: data.dailyReports.map((d) => shortDate(d.date)) },
        colors: ["#0ea5e9"],
        dataLabels: { enabled: false },
      },
      series: [{ name: "รายงาน/วัน", data: data.dailyReports.map((d) => d.count) }],
    };
  }, [data, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data || !("overview" in data)) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Icon icon="tabler:alert-triangle" width={40} className="mx-auto mb-2 text-amber-500" />
        {(data as any)?.message || "ไม่สามารถโหลดข้อมูลได้"}
      </div>
    );
  }

  const { overview } = data;
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "staff", label: "ครูและบุคลากร", icon: "tabler:users" },
    { id: "students", label: "การบันทึกนักศึกษา", icon: "tabler:notebook" },
    { id: "teachers", label: "การนิเทศครู", icon: "tabler:eye-check" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
            <Icon icon="tabler:chart-dots-3" className="text-white" width={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard งานทวิภาคี</h1>
            <p className="text-sm text-gray-500">สรุปข้อมูลครู นักศึกษา และการนิเทศ — อัปเดตทุก 1 นาที</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard icon="tabler:school" label="นักศึกษาทั้งหมด" value={overview.totalStudents} color="from-blue-500 to-blue-600" onClick={() => setTab("students")} />
        <StatCard icon="tabler:calendar-check" label="บันทึกวันนี้" value={overview.reportedToday} sub={`/${overview.totalStudents}`} color="from-emerald-500 to-green-600" onClick={() => { setTab("students"); setStudentFilter("today"); }} />
        <StatCard icon="tabler:calendar-week" label="บันทึกสัปดาห์นี้" value={overview.reportedThisWeek} color="from-cyan-500 to-teal-600" onClick={() => { setTab("students"); setStudentFilter("week"); }} />
        <StatCard icon="tabler:calendar-month" label="บันทึกเดือนนี้" value={overview.reportedThisMonth} color="from-violet-500 to-purple-600" onClick={() => { setTab("students"); setStudentFilter("month"); }} />
        <StatCard icon="tabler:eye-check" label="การนิเทศ (1 ปี)" value={overview.totalSupervisions} color="from-pink-500 to-rose-500" onClick={() => setTab("teachers")} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-blue-600 border border-b-0 border-gray-200 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon icon={t.icon} width={18} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "staff" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.staffByRole.map((r) => (
              <div key={r.role} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{r.count}</p>
                <p className="text-xs text-gray-500 mt-1">{r.roleName}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Icon icon="tabler:list" width={20} className="text-indigo-500" />
                รายชื่อบุคลากร ({data.staffList.length})
              </h2>
              <button
                type="button"
                onClick={() => router.push(staffListPath(basePath))}
                className="text-sm text-blue-600 hover:underline"
              >
                จัดการบุคลากร →
              </button>
            </div>
            <div className="overflow-x-auto max-h-[480px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>เบอร์โทร</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.staffList.map((s, i) => (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{s.roleName}</span>
                      </TableCell>
                      <TableCell className="text-gray-600">{s.department}</TableCell>
                      <TableCell className="text-gray-500">{s.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {tab === "students" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Icon icon="tabler:chart-line" width={20} className="text-blue-500" />
                สรุปการบันทึกรายงาน (1 ปี)
              </h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {(["daily", "weekly", "monthly"] as PeriodId[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      period === p ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {p === "daily" ? "รายวัน (30 วัน)" : p === "weekly" ? "รายสัปดาห์" : "รายเดือน"}
                  </button>
                ))}
              </div>
            </div>
            {chartOptions && (
              <Chart
                type={period === "monthly" ? "line" : "bar"}
                height={280}
                options={chartOptions.options}
                series={chartOptions.series}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all" as const, label: "ทั้งหมด" },
              { id: "today" as const, label: "บันทึกวันนี้" },
              { id: "week" as const, label: "สัปดาห์นี้" },
              { id: "month" as const, label: "เดือนนี้" },
              { id: "none" as const, label: "ยังไม่บันทึกเดือนนี้" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStudentFilter(f.id)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  studentFilter === f.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">
                รายชื่อนักศึกษา ({filteredStudents.length} คน) — คลิกแถวเพื่อดูรายละเอียด
              </h2>
            </div>
            <div className="overflow-x-auto max-h-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>วันนี้</TableHead>
                    <TableHead>สัปดาห์นี้</TableHead>
                    <TableHead>เดือนนี้</TableHead>
                    <TableHead>รายงาน/ปี</TableHead>
                    <TableHead>ล่าสุด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer hover:bg-blue-50/60"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <TableCell className="font-mono text-sm">{s.studentId}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{s.department}</TableCell>
                      <TableCell><StatusBadge ok={s.hasReportToday} /></TableCell>
                      <TableCell><StatusBadge ok={s.hasReportThisWeek} /></TableCell>
                      <TableCell><StatusBadge ok={s.hasReportThisMonth} /></TableCell>
                      <TableCell className="text-center font-semibold">{s.reportCountYear}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatThaiDate(s.lastReportDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {tab === "teachers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700">{overview.teachersSupervised}</p>
              <p className="text-sm text-green-600">ครูนิเทศภายใน 30 วัน</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-700">
                {data.teachers.filter((t) => t.supervisionStatus === "partial").length}
              </p>
              <p className="text-sm text-amber-600">เคยนิเทศแต่เกิน 30 วัน</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-600">
                {data.teachers.filter((t) => t.supervisionStatus === "none").length}
              </p>
              <p className="text-sm text-red-500">ยังไม่เคยนิเทศ</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Icon icon="tabler:chalkboard" width={20} className="text-purple-500" />
                สถานะครูนิเทศและการตรวจสอบนักศึกษา
              </h2>
              <button
                type="button"
                onClick={() => router.push(supervisionListPath(basePath))}
                className="text-sm text-blue-600 hover:underline"
              >
                {basePath === "/admin"
                  ? "จัดการบุคลากร (ครูนิเทศ) →"
                  : "ดูบันทึกนิเทศทั้งหมด →"}
              </button>
            </div>
            <div className="overflow-x-auto max-h-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ครู</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>นักศึกษาในดูแล</TableHead>
                    <TableHead>บันทึกเดือนนี้</TableHead>
                    <TableHead>นิเทศ/ปี</TableHead>
                    <TableHead>นิเทศล่าสุด</TableHead>
                    <TableHead>สถานะนิเทศ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.teachers.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer hover:bg-purple-50/50"
                      onClick={() => setSelectedTeacher(t)}
                    >
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{t.roleName}</span>
                      </TableCell>
                      <TableCell className="text-center">{t.assignedStudentCount}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{t.studentsReportedThisMonth}</span>
                        <span className="text-gray-400"> / </span>
                        <span className="text-red-500">{t.studentsNotReportedThisMonth}</span>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{t.supervisionCountYear}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatThaiDate(t.lastSupervisionDate)}</TableCell>
                      <TableCell><SupervisionBadge status={t.supervisionStatus} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดการบันทึก — {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <p><span className="text-gray-500">รหัส:</span> {selectedStudent.studentId}</p>
                <p><span className="text-gray-500">แผนก:</span> {selectedStudent.department}</p>
                <p><span className="text-gray-500">รายงานทั้งปี:</span> {selectedStudent.reportCountYear} ครั้ง</p>
                <p><span className="text-gray-500">ล่าสุด:</span> {formatThaiDate(selectedStudent.lastReportDate)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={selectedStudent.hasReportToday} label={selectedStudent.hasReportToday ? "บันทึกวันนี้" : "ยังไม่บันทึกวันนี้"} />
                <StatusBadge ok={selectedStudent.hasReportThisWeek} label="สัปดาห์นี้" />
                <StatusBadge ok={selectedStudent.hasReportThisMonth} label="เดือนนี้" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">วันที่บันทึกรายงาน ({selectedStudent.reportDates.length} วัน)</p>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {selectedStudent.reportDates.length ? (
                    selectedStudent.reportDates.map((d) => (
                      <span key={d} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {formatThaiDate(d)}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">ยังไม่มีการบันทึกในช่วง 1 ปีที่ผ่านมา</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดครู — {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <SupervisionBadge status={selectedTeacher.supervisionStatus} />
                <span className="text-gray-500">นิเทศล่าสุด: {formatThaiDate(selectedTeacher.lastSupervisionDate)}</span>
              </div>
              <p className="text-gray-600">
                นักศึกษาในความดูแล {selectedTeacher.assignedStudentCount} คน —
                บันทึกรายงานเดือนนี้ {selectedTeacher.studentsReportedThisMonth} คน,
                ยังไม่บันทึก {selectedTeacher.studentsNotReportedThisMonth} คน
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>เดือนนี้</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTeacher.assignedStudents.length ? (
                    selectedTeacher.assignedStudents.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell><StatusBadge ok={s.hasReportThisMonth} /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-400">
                        ยังไม่มีนักศึกษาในความดูแล
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
