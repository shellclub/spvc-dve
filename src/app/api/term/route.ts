import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const term = await prisma.student.findMany({
        distinct: ['term'],
        select: { term: true},
        orderBy: {
            term: "asc"
        }
    })

    if(!term) {
        return NextResponse.json({ error: "Not found!"},{status: 404})
    }
    
    const getterm = term.map(s => s.term);
    return NextResponse.json(getterm);
}