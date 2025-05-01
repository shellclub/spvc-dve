import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const year = await prisma.student.findMany({
        distinct: ['academicYear'],
        select: { academicYear: true, term: true },
        orderBy: {
            academicYear: 'desc'
        }
    })
    if(!year) {
        return NextResponse.json({ error: "Not found!"},{ status: 404});
    }

    return NextResponse.json(year);
}