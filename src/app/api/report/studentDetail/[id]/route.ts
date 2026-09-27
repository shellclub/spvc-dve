import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 }
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: Number(id) },
    include: {
      user: true,
      department: true,
      major: true,
      education: true,
      inturnship: true,
      report: true,
      studentCompanies: {
        orderBy: { startDate: "asc" },
        take: 1,
        select: { startDate: true },
      },
    },
  });

  if (!student) {
    return NextResponse.json(
      { message: "ไม่พบข้อมูลนักศึกษา" },
      { status: 404 }
    );
  }

  // role 1/2/3/5 เข้าถึงได้ทุกคน ถ้าเป็นครูที่ปรึกษา (role 4) อนุญาตเฉพาะนักศึกษาที่อยู่ในความดูแลเท่านั้น
  if (session?.user?.id && Number(session.user.role) === 4) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true },
    });
    if (teacher) {
      const allowed = await prisma.teacherClassroom.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: teacher.id,
            studentId: student.id,
          },
        },
      });
      if (!allowed) {
        return NextResponse.json(
          { message: "ไม่มีสิทธิ์ดูรายงานของนักศึกษาคนนี้" },
          { status: 403 }
        );
      }
    }
  }

  // รูปแบบที่ frontend คาดไว้: มี firstname, lastname, department ที่ระดับบน และ student (พร้อม report)
  const { user, department, major, education, inturnship, report, studentCompanies } = student;
  const payload = {
    ...user,
    department: department ?? undefined,
    student: {
      id: student.id,
      studentId: student.studentId,
      term: student.term,
      room: student.room,
      gradeLevel: student.gradeLevel ?? undefined,
      academicYear: student.academicYear,
      major: major?.major_name ?? "",
      education: education ? { id: education.id, name: education.name } : undefined,
      inturnship: inturnship ?? undefined,
      startDate: studentCompanies[0]?.startDate ?? undefined,
      report: report ?? [],
    },
  };
  return NextResponse.json(payload);
}