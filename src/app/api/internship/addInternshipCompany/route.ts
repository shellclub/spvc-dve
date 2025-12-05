import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   const { id, companyId, startDate, endDate } = await request.json();
   const exitsing = await prisma.studentCompanies.findFirst({
    where: {
        studentId: Number(id),
        companyId: Number(companyId)
    }
   })

    if(exitsing) {
        return NextResponse.json({ message: "นักศึกษามีข้อมูลการฝึกงานแล้ว", type: "error"}, { status: 400});
    }
    try {
        const internshipCompany = await prisma.studentCompanies.create({
            data: {
                studentId: Number(id),
                companyId: Number(companyId),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            }
        });
        if(!internshipCompany) {
            return NextResponse.json({ message: "เกิดข้อผิดพลาด", type: "error"},{ status: 400});
        }
        return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success"},{ status: 201});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error, type: "error"}, { status: 500})
    }
}