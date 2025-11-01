import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const teacher = await prisma.teacher.findMany({
        where: {
            user: {
                role: {
                    notIn: [1,2]
                }
            }
        },
        orderBy: {
            id: "desc"
        },
        include: {
            department: true,
            user: true,
            major: true,
            education: true
        }
    });
    return NextResponse.json(teacher)
}