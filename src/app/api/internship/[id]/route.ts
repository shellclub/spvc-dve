import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}: { params: { id: string }}) {
    const { id } = await params;
  
    const students = await prisma.student.findUnique({
        where: {
            userId: Number(id)
        }
    });
    if(!students) {
        return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษา", type: "error"}, { status: 401});
    }
    const internship = await prisma.inturnship.findUnique({
        where: {
            studentId: students.id
        }
    });
    if(!internship) {
        return NextResponse.json({}, { status: 401});
    }
    
    return NextResponse.json(internship, { status: 200});
    
}