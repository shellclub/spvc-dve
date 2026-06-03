import { prisma } from "@/lib/db";
import { parseReportDate } from "@/lib/dateConfig";
import { NextRequest, NextResponse } from "next/server";
import { parseForm } from "@/lib/uploadFile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: {
      userId: Number(id),
    },
  });

  if (!student) {
    return NextResponse.json({ error: "ไม่มีพบข้อมูลนักศึกษา" }, { status: 400 });
  }
  const intern = await prisma.internshipReport.findMany({
    where: {
      studentId: student.id,
    },
  });

  if (!intern) {
    return NextResponse.json({ error: "ไม่พบข้อมูลการฝึกงาน" }, { status: 400 });
  }

  return NextResponse.json(intern);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formdata = await request.formData();
    const file = formdata.get("image") as File;
    const oldData = await prisma.internshipReport.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!oldData) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงาน" },
        { status: 400 }
      );
    }

    let filename = oldData.image ?? "";
    if (file && file.size > 0) {
      filename = await parseForm(file, "report");
    }

    const reportDateRaw = formdata.get("reportDate");
    const title = formdata.get("title");
    const description = formdata.get("description");

    const update = await prisma.internshipReport.update({
      where: {
        id: Number(id),
      },
      data: {
        title: String(title),
        description: String(description ?? ""),
        reportDate: parseReportDate(String(reportDateRaw)),
        image: filename || null,
      },
    });

    if (!update) {
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาด", type: "error" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success" });
  } catch (error) {
    console.error("PUT /api/report error:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const del = await prisma.internshipReport.delete({
    where: {
      id: Number(id),
    },
  });

  if (!del) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", type: "error" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success" });
}
