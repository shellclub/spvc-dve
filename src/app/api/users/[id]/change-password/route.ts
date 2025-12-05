import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {

      // ตรวจสอบ session
      const session = await auth();
      
      if (!session) {
        return NextResponse.json(
          { message: "กรุณาเข้าสู่ระบบ", type: "error" },
          { status: 401 }
        );
      }
      const { id } = await params;
      // ตรวจสอบว่าผู้ใช้กำลังเปลี่ยนรหัสผ่านของตัวเองหรือไม่
      if (session.user.id !== id) {
        return NextResponse.json(
          { message: "คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้อื่น", type: "error" },
          { status: 403 }
        );
      }
  
      const formData = await request.formData();
      const oldPassword = formData.get("oldPassword") as string;
      const newPassword = formData.get("newPassword") as string;
  
      // Validate input
      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { message: "กรุณากรอกข้อมูลให้ครบถ้วน", type: "error" },
          { status: 400 }
        );
      }
  
      // Validate new password format
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", type: "error" },
          { status: 400 }
        );
      }
  
      if (!/[A-Z]/.test(newPassword)) {
        return NextResponse.json(
          { message: "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว", type: "error" },
          { status: 400 }
        );
      }
  
      if (!/[a-z]/.test(newPassword)) {
        return NextResponse.json(
          { message: "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว", type: "error" },
          { status: 400 }
        );
      }
  
      if (!/[0-9]/.test(newPassword)) {
        return NextResponse.json(
          { message: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว", type: "error" },
          { status: 400 }
        );
      }
  
      // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
      const user = await prisma.login.findUnique({
        where: { userId: Number(id) },
        select: { password: true }
      });
  
      if (!user) {
        return NextResponse.json(
          { message: "ไม่พบข้อมูลผู้ใช้", type: "error" },
          { status: 404 }
        );
      }
  
      // ตรวจสอบรหัสผ่านเดิม
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "รหัสผ่านปัจจุบันไม่ถูกต้อง", type: "error" },
          { status: 400 }
        );
      }
  
      // เช็คว่ารหัสผ่านใหม่ไม่ซ้ำกับรหัสผ่านเดิม
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json(
          { message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม", type: "error" },
          { status: 400 }
        );
      }
  
      // Hash รหัสผ่านใหม่
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // อัพเดทรหัสผ่านในฐานข้อมูล
      await prisma.user.update({
        where: { id: Number(id) },
        data: { 
          login: { 
            update: { 
              password: hashedPassword,
              is_first_login: false,
              skip_password_change: null,
         } } }
      });
  
      return NextResponse.json(
        { message: "เปลี่ยนรหัสผ่านสำเร็จ", type: "success" },
        { status: 200 }
      );
  
    } catch (error) {
      console.error("Change password error:", error);
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", type: "error" },
        { status: 500 }
      );
    }
}

export async function POST(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { password } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    

    const updatePassword = await prisma.user.update({
        where: { id: Number(id) },
        data: {
            login: {
                update: {
                    password: hashedPassword
                }
            }
        },
        include: {
            login: true
        }
    });
    if (!updatePassword) {
        return NextResponse.json({ message: "โปรดลองใหม่ภายหลัง", type: "error" }, { status: 400 });
    }
    return NextResponse.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ", type: "success" }, { status: 200 });
}   