// API สำหรับดึง "ห้องเรียน" ทั้งหมด (unique groupings จาก students)
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // ดึง students ทั้งหมดพร้อม department, major, education
        const students = await prisma.student.findMany({
            include: {
                department: true,
                major: true,
                education: true,
                user: {
                    select: {
                        id: true,
                        prefix: true,
                        firstname: true,
                        lastname: true,
                    }
                }
            },
            orderBy: [
                { departmentId: 'asc' },
                { major_id: 'asc' },
                { educationLevel: 'asc' },
                { gradeLevel: 'asc' },
                { room: 'asc' },
            ]
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการดึงข้อมูล", type: "error" },
            { status: 500 }
        );
    }
}
