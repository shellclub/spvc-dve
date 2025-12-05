import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const term = searchParams.get('term');
    const students = await prisma.user.findMany({
        where: {
            role: 3,
            student: {
                term: String(term),
                academicYear: String(year)
            }
        },
        orderBy: {
            id: "desc"
        },
        include: {
            student: {
                include: {
                    education: true,
                    inturnship: true,
                    department: true
                }
            },
        }
    });
    if(!students) {
        return NextResponse.json({},{status: 200})
    }
    return NextResponse.json(students)
}