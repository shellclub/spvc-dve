import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userRole } from "@/lib/utils";

const TH_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function weekKey(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session?.user || (role !== 1 && role !== 2 && role !== 5)) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfDay(now);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now);
    yearStart.setFullYear(yearStart.getFullYear() - 1);

    const [
      staffUsers,
      students,
      allReports,
      teachers,
      supervisions,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: [1, 2, 3, 4, 5] } },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          role: true,
          phone: true,
          user_img: true,
          teacher: {
            select: {
              id: true,
              department: { select: { depname: true } },
            },
          },
        },
        orderBy: [{ role: "asc" }, { firstname: "asc" }],
      }),
      prisma.student.findMany({
        include: {
          user: { select: { firstname: true, lastname: true } },
          department: { select: { depname: true } },
          major: { select: { major_name: true } },
        },
        orderBy: { studentId: "asc" },
      }),
      prisma.internshipReport.findMany({
        where: { reportDate: { gte: yearStart } },
        select: { studentId: true, reportDate: true, title: true },
        orderBy: { reportDate: "desc" },
      }),
      prisma.teacher.findMany({
        include: {
          user: { select: { firstname: true, lastname: true, role: true } },
          department: { select: { depname: true } },
          classrooms: { select: { studentId: true } },
          supervisions: {
            where: { supervisionDate: { gte: yearStart } },
            select: {
              id: true,
              supervisionDate: true,
              type: true,
              studentId: true,
            },
            orderBy: { supervisionDate: "desc" },
          },
        },
      }),
      prisma.supervision.findMany({
        where: { supervisionDate: { gte: yearStart } },
        select: {
          teacherId: true,
          studentId: true,
          supervisionDate: true,
          type: true,
        },
        orderBy: { supervisionDate: "desc" },
      }),
    ]);

    const reportsByStudent = new Map<number, Date[]>();
    for (const r of allReports) {
      const list = reportsByStudent.get(r.studentId) ?? [];
      list.push(new Date(r.reportDate));
      reportsByStudent.set(r.studentId, list);
    }

    const monthlyBuckets: {
      key: string;
      label: string;
      reportCount: number;
      studentCount: number;
    }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyBuckets.push({
        key: monthKey(d),
        label: `${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`,
        reportCount: 0,
        studentCount: 0,
      });
    }
    const monthStudentSets = monthlyBuckets.map(() => new Set<number>());

    const weeklyMap = new Map<string, { reportCount: number; students: Set<number> }>();
    const dailyMap = new Map<string, number>();

    for (const r of allReports) {
      const d = new Date(r.reportDate);
      const mk = monthKey(d);
      const mi = monthlyBuckets.findIndex((b) => b.key === mk);
      if (mi >= 0) {
        monthlyBuckets[mi].reportCount++;
        monthStudentSets[mi].add(r.studentId);
      }

      const wk = weekKey(d);
      if (!weeklyMap.has(wk)) {
        weeklyMap.set(wk, { reportCount: 0, students: new Set() });
      }
      const w = weeklyMap.get(wk)!;
      w.reportCount++;
      w.students.add(r.studentId);

      const dk = d.toISOString().split("T")[0];
      dailyMap.set(dk, (dailyMap.get(dk) ?? 0) + 1);
    }

    monthlyBuckets.forEach((b, i) => {
      b.studentCount = monthStudentSets[i].size;
    });

    const weeklyReports = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-26)
      .map(([date, v]) => ({
        weekStart: date,
        reportCount: v.reportCount,
        studentCount: v.students.size,
      }));

    const dailyReports: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyReports.push({ date: key, count: dailyMap.get(key) ?? 0 });
    }

    const studentSummaries = students.map((s) => {
      const dates = reportsByStudent.get(s.id) ?? [];
      const hasToday = dates.some((d) => d >= todayStart);
      const hasWeek = dates.some((d) => d >= weekStart);
      const hasMonth = dates.some((d) => d >= monthStart);
      const lastReport = dates[0] ?? null;
      return {
        id: s.id,
        studentId: s.studentId,
        name: `${s.user.firstname} ${s.user.lastname}`,
        department: s.department?.depname ?? "-",
        major: s.major?.major_name ?? "-",
        reportCountYear: dates.length,
        lastReportDate: lastReport?.toISOString() ?? null,
        hasReportToday: hasToday,
        hasReportThisWeek: hasWeek,
        hasReportThisMonth: hasMonth,
        reportDates: dates.map((d) => d.toISOString().split("T")[0]),
      };
    });

    const staffByRole = [1, 2, 3, 4, 5].map((r) => ({
      role: r,
      roleName: userRole(r),
      count: staffUsers.filter((u) => u.role === r).length,
    }));

    const teacherSummaries = teachers
      .filter((t) => t.user.role === 4 || t.user.role === 5)
      .map((t) => {
        const assignedIds = t.classrooms.map((c) => c.studentId);
        const assignedStudents = studentSummaries.filter((s) =>
          assignedIds.includes(s.id)
        );
        const reportedThisMonth = assignedStudents.filter(
          (s) => s.hasReportThisMonth
        ).length;
        const lastSv = t.supervisions[0]?.supervisionDate ?? null;
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const supervisedRecently =
          lastSv && new Date(lastSv) >= thirtyDaysAgo;

        let supervisionStatus: "done" | "partial" | "none" = "none";
        if (t.supervisions.length > 0) {
          supervisionStatus = supervisedRecently ? "done" : "partial";
        }

        return {
          id: t.id,
          name: `${t.user.firstname} ${t.user.lastname}`,
          role: t.user.role,
          roleName: userRole(t.user.role),
          department: t.department?.depname ?? "-",
          assignedStudentCount: assignedIds.length,
          studentsReportedThisMonth: reportedThisMonth,
          studentsNotReportedThisMonth: assignedIds.length - reportedThisMonth,
          supervisionCountYear: t.supervisions.length,
          lastSupervisionDate: lastSv ? new Date(lastSv).toISOString() : null,
          supervisionStatus,
          assignedStudents: assignedStudents.map((s) => ({
            id: s.id,
            studentId: s.studentId,
            name: s.name,
            hasReportThisMonth: s.hasReportThisMonth,
            lastReportDate: s.lastReportDate,
          })),
        };
      });

    const overview = {
      totalStudents: students.length,
      reportedToday: studentSummaries.filter((s) => s.hasReportToday).length,
      reportedThisWeek: studentSummaries.filter((s) => s.hasReportThisWeek).length,
      reportedThisMonth: studentSummaries.filter((s) => s.hasReportThisMonth).length,
      totalStaff: staffUsers.length,
      supervisionTeachers: teacherSummaries.filter((t) => t.role === 5).length,
      teachersSupervised: teacherSummaries.filter(
        (t) => t.supervisionStatus === "done"
      ).length,
      totalSupervisions: supervisions.length,
    };

    return NextResponse.json({
      overview,
      staffByRole,
      staffList: staffUsers.map((u) => ({
        id: u.id,
        name: `${u.firstname} ${u.lastname}`,
        role: u.role,
        roleName: userRole(u.role),
        phone: u.phone,
        department: u.teacher?.department?.depname ?? "-",
        teacherId: u.teacher?.id ?? null,
      })),
      monthlyReports: monthlyBuckets,
      weeklyReports,
      dailyReports,
      students: studentSummaries,
      teachers: teacherSummaries,
    });
  } catch (error: unknown) {
    console.error("Internship dashboard error:", error);
    return NextResponse.json(
      {
        message: "ไม่สามารถโหลดข้อมูล dashboard ได้",
        error: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
