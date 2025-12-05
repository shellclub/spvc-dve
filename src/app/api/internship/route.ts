import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   const { id, selectedDays,dayperweeks } = await request.json();
    
   const user = await prisma.user.findUnique({
       where: { id: Number(id) },
       include: { student: true}
   });

   if (!user || !user.student) {
       return NextResponse.json(
           { message: "ไม่พบข้อมูลนักศึกษา", type: "error" },
           { status: 404 }
       );
   }


   // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
   const company = await prisma.studentCompanies.findFirst({
       where: {
           studentId: Number(user.student.id)
       }
   });

   if (!company) {
       return NextResponse.json(
           { message: "ไม่พบข้อมูลการฝึกงานของนักศึกษา ติดครูนิเทศ", type: "error" },
           { status: 404 }
       );
   }

   try {

        const internship = await prisma.inturnship.create({
            data: {
                studentId: Number(user.student.id),
                selectedDays: selectedDays,
                dayperweeks: String(dayperweeks)
            }
        })
       return NextResponse.json(
           { message: "ดำเนินการสำเร็จ", type: "success", data: internship },
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