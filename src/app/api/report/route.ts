import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseReportDate } from "@/lib/dateConfig";
import { NextRequest, NextResponse } from "next/server";
import { parseForm } from "@/lib/uploadFile";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบ", type: "error" },
        { status: 401 }
      );
    }

    const formdata = await request.formData();
    const rawData = Object.fromEntries(formdata.entries());
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)])
    );
    const file = formdata.get("image") as File;

    const student = await prisma.student.findUnique({
      where: {
        userId: Number(session.user.id),
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลนักศึกษา", type: "error" },
        { status: 400 }
      );
    }

    let uniqueFilename: string | undefined;
    if (file && file.size > 0) {
      uniqueFilename = await parseForm(file, "report");
    }

    const report = await prisma.internshipReport.create({
      data: {
        studentId: student.id,
        title: data.title,
        description: data.description,
        reportDate: parseReportDate(data.reportDate),
        image: uniqueFilename ?? null,
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาด", type: "error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "ดำเนินการสำเร็จ", type: "success" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/report error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message === "Invalid report date"
            ? "รูปแบบวันที่ไม่ถูกต้อง"
            : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        type: "error",
      },
      { status: 500 }
    );
  }
}
