import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { students } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลนักศึกษา", type: "error" },
        { status: 400 }
      );
    }

    let successCount = 0;
    let skipCount = 0;
    const errors: string[] = [];

    for (const student of students) {
      try {
        const { studentId, prefix, firstname, lastname, phone } = student;

        // Validate required fields
        if (!studentId || !firstname || !lastname) {
          errors.push(`${studentId || "?"}: ข้อมูลไม่ครบถ้วน`);
          skipCount++;
          continue;
        }

        // Check for existing student ID
        const existingStudent = await prisma.student.findUnique({
          where: { studentId },
        });

        if (existingStudent) {
          errors.push(`${studentId}: รหัสนักศึกษาซ้ำ`);
          skipCount++;
          continue;
        }

        // Generate a unique citizenId placeholder
        const citizenId = `STD${studentId}${Date.now()}`.substring(0, 13);

        // Generate password from studentId
        const passwordString = studentId;

        await prisma.user.create({
          data: {
            firstname,
            lastname,
            citizenId,
            prefix: prefix || null,
            phone: phone || null,
            birthday: new Date(),
            user_img: "avatar.jpg",
            student: {
              create: {
                studentId,
              },
            },
            login: {
              create: {
                username: studentId,
                password: bcrypt.hashSync(passwordString, 10),
              },
            },
          },
        });

        successCount++;
      } catch (err) {
        errors.push(`${student.studentId || "?"}: เกิดข้อผิดพลาด`);
        skipCount++;
      }
    }

    const message =
      successCount > 0
        ? `นำเข้าสำเร็จ ${successCount} รายการ` +
        (skipCount > 0 ? ` (ข้าม ${skipCount} รายการ)` : "")
        : `ไม่สามารถนำเข้าได้ (ข้าม ${skipCount} รายการ)`;

    return NextResponse.json(
      {
        message,
        type: successCount > 0 ? "success" : "error",
        details: { successCount, skipCount, errors },
      },
      { status: successCount > 0 ? 201 : 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในระบบ",
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
