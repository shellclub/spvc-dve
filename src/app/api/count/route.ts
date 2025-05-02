import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const countUser = await prisma.user.count({
        where: {
            role: {
                not: 1
            }
        }
    });
    const countTeacher = await prisma.user.count({
        where: {
            role: 2
        }
    });

    const countStudent = await prisma.student.count();
    const countDepartment = await prisma.department.count();

    return NextResponse.json({
        user: countUser,
        teacher: countTeacher,
        student: countStudent,
        department: countDepartment,
    })
}