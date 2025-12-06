import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const majors = await prisma.major.findMany({
        orderBy: {
            id: "desc"
        },
        include: {
            department: true
        }
    })

    return NextResponse.json(majors);

}

export async function POST(request: NextRequest) {
    const body = await request.json() as Prisma.MajorCreateInput;

    if (!body.major_name || !body.department) {
        return NextResponse.json({ message: 'กรุณาตรวจสอบข้อมูลอีกครั้ง', type: "error" }, { status: 400 })
    }

    const exisingMajor = await prisma.major.findUnique({
        where: {
            major_name: String(body.major_name)
        }
    })

    if (exisingMajor) {
        return NextResponse.json({ message: "ชื่อสาขานี้มีอยู่ในระบบแล้ว", type: "error" }, { status: 400 })
    }

    const store = await prisma.major.create({
        data: {
            major_name: String(body.major_name),
            departmentId: Number(body.department)
        }
    })

    if (!store) {
        return NextResponse.json({ message: "เกิดข้อผิดพลาด ลองใหม่ภายหลัง!", type: "error" }, { status: 500 })
    }

    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success" }, { status: 201 })
}