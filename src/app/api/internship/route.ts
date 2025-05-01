import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await auth();
   try {
    const { selectedDays, dayPerWeeks} = await request.json();
    if(!session) {
        return NextResponse.json({ message: "Not has session", type: "error"}, { status: 401});
    }
    const students = await prisma.student.findUnique({
        where: {
            userId: Number(session.user.id)
        }
    });

    if(!students) {
        return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษา", type: "error"}, { status: 401});
    }
    const check = await prisma.inturnship.findUnique({
        where: {
            studentId: students.id
        }
    });
    let internship;
    if(check) {
         internship = await prisma.inturnship.update({
            where: {
                studentId: students.id
            },
            data: {
                dayperweeks: String(dayPerWeeks),
                selectedDays: selectedDays
            }
        });
    }else{
         internship = await prisma.inturnship.create({
            data: {
                studentId: students.id,
                dayperweeks: String(dayPerWeeks),
                selectedDays: selectedDays
            }
        });
    }
   

    if(!internship) {
        return NextResponse.json({ message: "เกิดข้อผิดพลาด", type: "error"},{ status: 400});
    }
    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success"},{ status: 201});
   } catch (error) {
    console.log(error);
    
    return NextResponse.json({ message: error, type: "error"}, { status: 500})
   }
}

export async function GET() {
 try {
    const internship = await prisma.inturnship.findMany({
        orderBy: {
            id: "desc"
        }
    })

    if(!internship) {
        return NextResponse.json({ message: 'เกิดข้อผิดพลาด', type: 'error'}, { status: 500})
    }

    return NextResponse.json(internship)
 } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error}, { status: 500})
    
 }
}