import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string }>}) {
    const { id } = await params;
    const student = await prisma.student.findUnique({
        where: {
            userId: Number(id)
        }
    })

    if(!student) {
        return NextResponse.json({ error: "ไม่มีพบข้อมูลนักศึกษา"}, { status: 400})
    }
    const intern = await prisma.internshipReport.findMany({
        where: {
            studentId: student.id
        }
    })

    if(!intern) {
        return NextResponse.json({ error: "ไม่พบข้อมูลการฝึกงาน"}, { status: 400})
    }

    return NextResponse.json(intern)
}