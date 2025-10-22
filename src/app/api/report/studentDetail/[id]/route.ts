import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest,{params}: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const student = await prisma.student.findUnique({
        where: {
            id: Number(id)
        },
        include:{
            user: true,
            department: true,
            major: true,
            education: true,
            inturnship: true,
            report: true
        }
    })
    if(!student) {
        return NextResponse.json([],{status: 404});
    }
    return NextResponse.json(student);
}