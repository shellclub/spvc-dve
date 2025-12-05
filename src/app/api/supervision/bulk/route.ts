// pages/api/supervision/bulk.ts

import { PrismaClient, SupervisionType } from "@prisma/client"; // ◀◀◀ Import Enum ของคุณด้วย
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";


export async function POST( req: NextRequest) {
    const body = await req.json();
  const {
    studentIds, // นี่คือ Array ของ student.id (string[] หรือ number[])
    supervisionDate, // วันที่ (string)
    notes, // บันทึก (string)
    supervisionType, // "ON_SITE", "ONLINE", หรือ "PHONE" (SupervisionType)
  } = body;
  const session = await auth();

  if(!session) {
    return NextResponse.json({ message: "Unauthorized"}, { status: 401})
  }

  // --- 1. ตรวจสอบข้อมูลเบื้องต้น ---
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return NextResponse.json({ message: "กรุณาระบุรหัสนักศึกษา (studentIds)" }, { status: 400});
  }
  if (!supervisionDate || !supervisionType) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลการนิเทศให้ครบถ้วน" },{ status: 400});
  }
  
  const teachers = await prisma.teacher.findUnique({
    where: {
        userId: Number(session.user.id)
    }
  })
  if(!teachers) {
    return NextResponse.json({ message: "ไม่พบข้อมูล ครูนิเทศ!"}, { status: 400})
  }
  const teacherId = teachers.id;
  try {
    const createdRecords = await prisma.$transaction(async (tx) => {
      const allSupervisions = [];

      for (const stdId of studentIds) {
        const studentId = Number(stdId); // แปลงเป็นตัวเลข

        // 3. ค้นหาการฝึกงาน (studentCompany) ล่าสุดของนักศึกษาคนนี้
        // เพื่อดึง 'companyId' มาใช้ในการเชื่อมโยง
        const studentInternship = await tx.studentCompanies.findFirst({
          where: { studentId: studentId },
          orderBy: { assignedAt: "desc" }, // เอาอันล่าสุด (เผื่อนักศึกษามีประวัติฝึกงานหลายที่)
        });

        // 4. ถ้าไม่พบข้อมูลการฝึกงานของนักศึกษาคนนี้ ให้ Transaction ล้มเหลว
        if (!studentInternship) {
          throw new Error(
            `ไม่พบข้อมูลการฝึกงานสำหรับรหัสนักศึกษา: ${studentId}`
          );
        }

        // 5. สร้าง Log การนิเทศ
        const supervision = await tx.supervision.create({
          data: {
            studentId: studentId,
            companyId: studentInternship.companyId, // ◀◀◀ ได้ 'companyId' มาจากขั้นตอนที่ 3
            teacherId: Number(teacherId),
            supervisionDate: new Date(supervisionDate),
            notes: notes,
            type: supervisionType as SupervisionType, // ◀◀◀ ต้องมั่นใจว่า Type ตรงกับ Enum ใน Schema
          },
        });
        allSupervisions.push(supervision);
      }

      return allSupervisions;
    });

    // --- 6. ส่งผลลัพธ์กลับไป ---
    return NextResponse.json({
      message: `บันทึกการนิเทศ ${createdRecords.length} รายการสำเร็จ`,
    }, {status: 201});
    
  } catch (error) {
    console.error("Error creating bulk supervision:", error);
    const errorMessage =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
      
    return NextResponse.json({
      message: "การบันทึกข้อมูลล้มเหลว",
      error: errorMessage,
    }, { status: 500});
  }
}