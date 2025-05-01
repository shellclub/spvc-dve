import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest,{params}: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            department: true,
            student: {
                include: {
                    education: true,
                    inturnship: true,
                    report: true
                    
                }
            }
        }
    })
    if(!user) {
        return NextResponse.json([],{status: 404});
    }
    return NextResponse.json(user);
}