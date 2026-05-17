import { removeDepartment, updateDepartment } from "@/services/departments";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>
export async function PUT(request: NextRequest, {params}: {params: Params}) {
  try {
    const { id } = await params;
    const jsonBody = await request.json() as Prisma.DepartmentUpdateInput;
    const update = await updateDepartment(id, jsonBody);
    if(!update) {
        return NextResponse.json({message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล", type: "error"}, { status: 500})
    }
    return NextResponse.json({ message: "แก้ไขข้อมูลสำเร็จ", type: "success"}, {status: 200})
  } catch (error) {
    console.error("PUT /api/departments/[id] error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล", type: "error" }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, {params}:{params: Params}) {
    try {
        const { id } = await params;
        const result = await removeDepartment(id);

        if (result.success) {
            return NextResponse.json({ message: result.message, type: "success" }, { status: 200 });
        } else {
            return NextResponse.json({ message: result.message, type: "error" }, { status: 400 });
        }
    } catch (error) {
        console.error("DELETE /api/departments/[id] error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง", type: "error" }, { status: 500 });
    }
}