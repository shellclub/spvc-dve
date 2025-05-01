import { prisma } from "@/lib/db";
import { createDepartment, findAllDepartments } from "@/services/departments";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const jsonBody = await req.json() as Prisma.DepartmentCreateInput;
        const havedDepname = await prisma.department.findUnique({
            where: {
                depname: jsonBody.depname
            }
        })
        if(havedDepname) {
            return NextResponse.json({ message: "มีข้อมูลดังกล่าวอยู่ในระบบแล้ว", type: "error"}, {status: 500})
        }
        const newDep = await createDepartment(jsonBody);
        if(!newDep) {
            return NextResponse.json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล", type: "error"}, {status: 500})
        }   
        return NextResponse.json({ message: "เพิ่มข้อมูลสำเร็จ", type: "success"},{ status: 201})        
        
    } catch (error) {
     
        console.log(error);
        
    }
    
}

export async function GET() {
    const departments = await findAllDepartments();
    
    return NextResponse.json(departments)
}