import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();
    const student = await prisma.student.findUnique({
        where: {
            userId: Number(session?.user.id),
        }
        
    })
    if(!student) {
        return NextResponse.json("Unauthorized", { status: 401 });

    }
    const countReport = await prisma.internshipReport.count({
        where: {
            studentId: student.id,
        }
    });

    const countDays = await prisma.inturnship.findUnique({
        where: {
            studentId: student.id,
        },
        select: {
            dayperweeks: true
        }
    })
    const week = await prisma.companies.findUnique({
        where: {
            studentId: student.id,
        },
        select: {
            week: true,
            name: true,
        }
    })
    return NextResponse.json({
        report: countReport,
        countDay: countDays?.dayperweeks,
        weekterm: week?.week,
        company: week?.name,
    })
}