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
    return console.log(error);
    
  }
}
export async function DELETE(request: NextRequest, {params}:{params: Params}) {
    try {
        const { id } = await params;
        const del = await removeDepartment(id);
        if(!del) {
            return NextResponse.json({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", type: "error"}, { status: 500})
        }
        return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"}, { status: 200})
    } catch (error) {
        return console.log(error)
    }
}