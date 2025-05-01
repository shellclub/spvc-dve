import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    // ตรวจสอบการเข้าสู่ระบบและบทบาท
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== 3) {
      return NextResponse.json(
        { error: "Forbidden - Student access only" },
        { status: 403 }
      );
    }

    // ค้นหาข้อมูลนักศึกษา
    const student = await prisma.student.findUnique({
      where: { userId: Number(session.user.id) },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // ค้นหาข้อมูลการฝึกงาน
    const internship = await prisma.inturnship.findUnique({
      where: { studentId: student.id },
    });

    // ส่งผลลัพธ์กลับ
    return NextResponse.json({
      hasInternship: !!internship,
      hasSelectedDays: !!internship?.selectedDays,
      isValid: !!internship?.selectedDays
    });

  } catch (error) {
    console.error("Check internship error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}