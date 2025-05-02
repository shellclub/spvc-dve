import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    const session = await auth();
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());
    const data = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, String(value)])
    );
    const student = await prisma.user.update({
        where: {
            id: Number(session?.user.id),
        },
        data: {
            departmentId: Number(data.departmentId),
            student: {
                update: {
                    major: data.major,
                    room: data.room,
                },
            }
        }
    })
    if (!student) {
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาด", type: "error" },   
            { status: 400 }
        );
    }
    return NextResponse.json(
        { message: "ดำเนินการสำเร็จ", type: "success" },
        { status: 200 }
    );

}