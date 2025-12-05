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
    if (!student) {
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

    const studentCompany = await prisma.studentCompanies.findFirst({
        where: {
            studentId: student.id
        },
        include: {
            company: true
        }
    })

    let weeks = 0;
    if (studentCompany?.startDate && studentCompany?.endDate) {
        const start = new Date(studentCompany.startDate);
        const end = new Date(studentCompany.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        weeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    }

    return NextResponse.json({
        report: countReport,
        countDay: countDays?.dayperweeks,
        weekterm: weeks,
        company: studentCompany?.company.name,
    })
}