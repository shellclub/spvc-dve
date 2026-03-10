// API สำหรับจัดการ teacher classroom assignments
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET: ดึง classrooms ที่ครูคนนั้นรับผิดชอบ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // ดึง teacher record จาก userId
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(id) }
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลบุคลากร", type: "error" },
        { status: 404 }
      );
    }

    const classrooms = await prisma.teacherClassroom.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: {
          include: {
            department: true,
            major: true,
            education: true,
            user: {
              select: {
                id: true,
                prefix: true,
                firstname: true,
                lastname: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(classrooms);
  } catch (error) {
    console.error("Error fetching teacher classrooms:", error instanceof Error ? error.message : error, error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", type: "error" },
      { status: 500 }
    );
  }
}

// PUT: อัปเดต classrooms ทั้งหมด (replace)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(id) }
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลบุคลากร", type: "error" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { studentIds } = body as { studentIds: number[] };

    // ลบ assignments เดิมทั้งหมดก่อน
    await prisma.teacherClassroom.deleteMany({
      where: { teacherId: teacher.id }
    });

    // เพิ่ม assignments ใหม่ (ถ้ามี studentIds)
    if (studentIds && studentIds.length > 0) {
      await prisma.teacherClassroom.createMany({
        data: studentIds.map(studentId => ({
          teacherId: teacher.id,
          studentId
        })),
        skipDuplicates: true
      });
    }

    return NextResponse.json({
      message: "บันทึกห้องเรียนที่รับผิดชอบสำเร็จ",
      type: "success"
    });
  } catch (error) {
    console.error("Error updating teacher classrooms:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการบันทึก", type: "error" },
      { status: 500 }
    );
  }
}
