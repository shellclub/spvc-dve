import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/teachers/me/students
 * คืนรายชื่อนักศึกษาที่อยู่ในความดูแลของครูที่ปรึกษา (TeacherClassroom)
 * เฉพาะ role 4 (ครู) เท่านั้น
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (Number(session.user.role) !== 4) {
      return NextResponse.json(
        { message: "เฉพาะครูที่ปรึกษาเท่านั้น" },
        { status: 403 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true },
    });
    if (!teacher) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลครู" },
        { status: 404 }
      );
    }

    const classrooms = await prisma.teacherClassroom.findMany({
      where: { teacherId: teacher.id },
      select: { studentId: true },
    });
    const studentIds = classrooms.map((c) => c.studentId);
    if (studentIds.length === 0) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        student: {
          id: { in: studentIds },
        },
      },
      orderBy: { id: "desc" },
      include: {
        student: {
          include: {
            education: true,
            inturnship: true,
            department: true,
            major: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/teachers/me/students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
