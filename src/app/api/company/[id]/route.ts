import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { name, address, firstname, lastname, phone, position } = body;
    const { id } = await params;

    // ดึงข้อมูล company เดิม
    const existingCompany = await prisma.companies.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลสถานประกอบการ", type: "error" },
        { status: 404 }
      );
    }

    // อัพเดท user
    await prisma.user.update({
      where: { id: existingCompany.userId },
      data: {
        firstname,
        lastname,
        phone: phone || "",
        prefix: position || null,
      }
    });

    // อัพเดท company
    const updatedCompany = await prisma.companies.update({
      where: { id: Number(id) },
      data: {
        name,
        address: address || "",
      },
      include: {
        user: true,
        studentCompanies: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!updatedCompany) {
      return NextResponse.json(
        { message: "ไม่สามารถแก้ไขข้อมูลสถานประกอบการได้", type: "error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "แก้ไขข้อมูลสถานประกอบการสำเร็จ",
      type: "success",
    });

  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล", type: "error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ดึงข้อมูล company เพื่อเอา userId
    const company = await prisma.companies.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!company) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลสถานประกอบการ", type: "error" },
        { status: 404 }
      );
    }

    // ลบ user (จะลบ company ตามไปด้วยเพราะมี onDelete: Cascade)
    await prisma.user.delete({
      where: { id: company.userId }
    });

    return NextResponse.json({
      message: "ลบข้อมูลสถานประกอบการสำเร็จ",
      type: "success"
    });

  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบข้อมูล", type: "error" },
      { status: 500 }
    );
  }
}