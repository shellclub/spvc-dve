import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const skipUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 วัน
    try {
        // ตรวจสอบ session
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { message: "กรุณาเข้าสู่ระบบ", type: "error" },
                { status: 401 }
            );
        }
        // ตรวจสอบว่าผู้ใช้กำลังข้ามการเปลี่ยนรหัสผ่านของตัวเองหรือไม่
        if (session.user.id !== id) {
            return NextResponse.json(
                { message: "คุณไม่มีสิทธิ์ข้ามการเปลี่ยนรหัสผ่านของผู้อื่น", type: "error" },
                { status: 403 }
            );
        }
        // อัพเดท skip_password_change ในฐานข้อมูล
        await prisma.user.update({
            where: { id: Number(id) },
            data: { login: { update: { skip_password_change: skipUntil } } }
        });
       
        return NextResponse.json(
            { message: "คุณได้ข้ามการเปลี่ยนรหัสผ่านสำเร็จ", type: "success", skipUntil },
            { status: 200 }
        );
    } catch (error) {
        // console.error("Skip password change error:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการข้ามการเปลี่ยนรหัสผ่าน", type: "error" },
            { status: 500 }
        );
    }
}
