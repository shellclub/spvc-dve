import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, login: true }
    });

    if (!user || user.role !== 7 || !user.student) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลนักศึกษา", type: "error" },
        { status: 404 }
      );
    }

    // Calculate birthdate for password
    let newPassword = "";

    if (user.birthday) {
      const bdate = new Date(user.birthday);
      const dd = String(bdate.getDate()).padStart(2, '0');
      const mm = String(bdate.getMonth() + 1).padStart(2, '0');
      const yyyy = String(bdate.getFullYear() + 543);
      newPassword = `${dd}${mm}${yyyy}`;
    } else {
      // Fallback to citizenId if no birthday set
      newPassword = user.citizenId;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.$transaction([
      prisma.login.update({
        where: { userId: userId },
        data: {
          password: hashedPassword,
          is_first_login: true,
          skip_password_change: null
        }
      })
    ]);

    return NextResponse.json({
      message: `รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่คือ ${newPassword}`,
      type: "success"
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", type: "error" },
      { status: 500 }
    );
  }
}
