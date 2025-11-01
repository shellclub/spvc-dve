import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json() as Prisma.MajorUpdateInput;
    
    if(!body.major_name || !body.department) {
        return NextResponse.json({message: 'กรุณาตรวจสอบข้อมูลอีกครั้ง', type: "error"}, { status: 400})
    }
    const update = await prisma.major.update({
        where: {
            id: Number(id)
        },
        data: {
            major_name: String(body.major_name),
            departmentId: Number(body.department)
        }
    })
    if(!update) {
        return NextResponse.json({ message: "เกิดข้อผิดพลาด ลองใหม่ภายหลัง!", type: "error"}, { status: 500})
    }
    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success"}, { status: 200})
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const del = await prisma.major.delete({
        where: {
            id: Number(id)
        }
    })
    if(!del) {
        return NextResponse.json({ message: "เกิดข้อผิดพลาด ลองใหม่ภายหลัง!", type: "error"}, { status: 500})
    }
    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success"}, { status: 200})
}