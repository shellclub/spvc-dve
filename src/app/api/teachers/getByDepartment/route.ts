import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth();
        if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const teacher = await prisma.teacher.findUnique({
        where: {
            userId: Number(session.user.id)
        }
    });

    if (!teacher?.departmentId) {
        return NextResponse.json(
            { message: "Department not found" },
            { status: 404 }
        );
    }
    const teachers = await prisma.teacher.findMany({
        where: {
            departmentId: Number(teacher.departmentId),
            user: {
                role: 4
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
    return NextResponse.json(teachers)
}