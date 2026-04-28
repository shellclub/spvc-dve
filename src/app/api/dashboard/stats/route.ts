import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // === 1. จำนวนรวม ===
    const [
      totalStudents,
      totalTeachers,
      totalCompanies,
      totalDepartments,
      totalMajors,
      totalReports,
      totalSupervisions,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.companies.count(),
      prisma.department.count(),
      prisma.major.count(),
      prisma.internshipReport.count(),
      prisma.supervision.count(),
    ]);

    // === 2. นักศึกษาที่ตั้งค่าวันฝึกงานแล้ว ===
    const studentsWithInternship = await prisma.inturnship.count();

    // === 3. นักศึกษาที่มีรายงานอย่างน้อย 1 วัน ===
    const studentsWithReports = await prisma.internshipReport.groupBy({
      by: ["studentId"],
    });
    const studentsReported = studentsWithReports.length;

    // === 4. นักศึกษาที่ถูกจับคู่กับสถานประกอบการ ===
    const studentsWithCompany = await prisma.studentCompanies.groupBy({
      by: ["studentId"],
    });
    const studentsAssigned = studentsWithCompany.length;

    // === 5. ครูที่มีนักศึกษาในความดูแล ===
    const teachersWithStudents = await prisma.teacherClassroom.groupBy({
      by: ["teacherId"],
    });
    const teachersAssigned = teachersWithStudents.length;

    // === 6. ครูนิเทศ ===
    const supervisionTeachers = await prisma.teacher.count({
      where: { user: { role: 5 } },
    });
    const teachersSupervised = await prisma.supervision.groupBy({
      by: ["teacherId"],
    });

    // === 7. สถิติรายแผนก ===
    const departments = await prisma.department.findMany({
      include: {
        student: { include: { report: true } },
        marjors: true,
      },
    });

    const departmentStats = departments.map((dept) => {
      const students = dept.student || [];
      const majors = dept.marjors || [];
      return {
        name: dept.depname,
        students: students.length,
        majors: majors.length,
        reports: students.reduce((sum, s) => sum + (s.report?.length || 0), 0),
        studentsWithReport: students.filter((s) => (s.report?.length || 0) > 0).length,
        studentsNoReport: students.filter((s) => (s.report?.length || 0) === 0).length,
      };
    });

    // === 8. รายงาน 7 วันล่าสุด ===
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReports = await prisma.internshipReport.findMany({
      where: { reportDate: { gte: sevenDaysAgo } },
      select: { reportDate: true },
    });

    const reportsByDate: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      reportsByDate[d.toISOString().split("T")[0]] = 0;
    }
    recentReports.forEach((r) => {
      const key = new Date(r.reportDate).toISOString().split("T")[0];
      if (key in reportsByDate) reportsByDate[key]++;
    });
    const dailyReports = Object.entries(reportsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    // === 9. นิเทศล่าสุด ===
    let recentSupervisions: any[] = [];
    try {
      const rawSvs = await prisma.supervision.findMany({
        take: 5,
        orderBy: { supervisionDate: "desc" },
        include: {
          supervisor: { include: { user: true } },
          internship: {
            include: {
              student: { include: { user: true } },
              company: true,
            },
          },
        },
      });
      recentSupervisions = rawSvs.map((sv) => ({
        id: sv.id,
        supervisionDate: sv.supervisionDate,
        type: sv.type,
        notes: sv.notes,
        teacherName: `${sv.supervisor?.user?.firstname || ""} ${sv.supervisor?.user?.lastname || ""}`.trim(),
        studentName: `${sv.internship?.student?.user?.firstname || ""} ${sv.internship?.student?.user?.lastname || ""}`.trim(),
        studentCode: sv.internship?.student?.studentId || "",
        companyName: sv.internship?.company?.name || "",
      }));
    } catch (e) {
      console.error("Supervision query error:", e);
    }

    // === 10. สถานประกอบการ top 5 ===
    const allCompanies = await prisma.companies.findMany({
      include: { studentCompanies: true },
    });
    const companyRanking = allCompanies
      .map((c) => ({ name: c.name, students: c.studentCompanies?.length || 0 }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    // === 11. รายชื่อผู้บริหาร (role=2) ===
    const boardMembers = await prisma.user.findMany({
      where: { role: 2 },
      select: { id: true, firstname: true, lastname: true, user_img: true, phone: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      overview: {
        totalStudents,
        totalTeachers,
        totalCompanies,
        totalDepartments,
        totalMajors,
        totalReports,
        totalSupervisions,
      },
      internship: {
        configured: studentsWithInternship,
        notConfigured: totalStudents - studentsWithInternship,
      },
      reports: {
        studentsReported,
        studentsNotReported: totalStudents - studentsReported,
      },
      companies: {
        studentsAssigned,
        studentsUnassigned: totalStudents - studentsAssigned,
      },
      teachers: {
        assigned: teachersAssigned,
        unassigned: totalTeachers - teachersAssigned,
        supervisionTeachers,
        supervisedCount: teachersSupervised.length,
        notSupervised: supervisionTeachers - teachersSupervised.length,
      },
      departmentStats,
      dailyReports,
      recentSupervisions,
      companyRanking,
      boardMembers,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats", message: error?.message },
      { status: 500 }
    );
  }
}
