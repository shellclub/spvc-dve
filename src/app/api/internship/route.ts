import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   const { id, companyId } = await request.json();

   const student = await prisma.student.findUnique({
       where: { id: Number(id) }
   });

   if (!student) {
       return NextResponse.json(
           { message: "ไม่พบข้อมูลนักศึกษา", type: "error" },
           { status: 404 }
       );
   }

   // ตรวจสอบว่า Company มีอยู่จริงหรือไม่
   const company = await prisma.companies.findUnique({
       where: { id: Number(companyId) }
   });

   if (!company) {
       return NextResponse.json(
           { message: "ไม่พบข้อมูลบริษัท", type: "error" },
           { status: 404 }
       );
   }

   // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
   const existing = await prisma.studentCompanies.findUnique({
       where: {
           studentId_companyId: {
               studentId: Number(id),
               companyId: Number(companyId)
           }
       }
   });

   if (existing) {
       return NextResponse.json(
           { message: "นักศึกษามีข้อมูลการฝึกงานแล้ว", type: "error" },
           { status: 400 }
       );
   }

   try {
       const internshipCompany = await prisma.studentCompanies.create({
           data: {
               studentId: Number(id),
               companyId: Number(companyId),
               startDate: new Date(),
               endDate: new Date(),
           }
       });

       return NextResponse.json(
           { message: "ดำเนินการสำเร็จ", type: "success", data: internshipCompany },
           { status: 201 }
       );
   } catch (error) {
       console.error("Error creating studentCompanies:", error);
       return NextResponse.json(
           { message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" },
           { status: 500 }
       );
   }
}