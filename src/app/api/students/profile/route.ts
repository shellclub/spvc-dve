import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { message: "Unauthorized", type: "error" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const rawData = Object.fromEntries(formData.entries());
        const data = Object.fromEntries(
            Object.entries(rawData).map(([key, value]) => [key, String(value)])
        );

        // Prepare Major update if name is provided
        let majorUpdate = undefined;
        if (data.major) {
            const majorObj = await prisma.major.findFirst({
                where: { major_name: String(data.major) }
            });
            if (majorObj) {
                majorUpdate = majorObj.id
            }
        }

        // Update Student via userId
        const student = await prisma.student.update({
            where: {
                userId: Number(session.user.id),
            },
            data: {
                departmentId: Number(data.departmentId),
                room: data.room,
                major_id: majorUpdate, // Can be undefined, which Prisma ignores
            }
        });

        if (!student) {
            return NextResponse.json(
                { message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล", type: "error" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "ดำเนินการสำเร็จ", type: "success" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { message: "Internal Server Error", type: "error" },
            { status: 500 }
        );
    }
}