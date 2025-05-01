import { prisma } from "@/lib/db";
import { removeStudent, updateStudent } from "@/services/students";
import { updateUser } from "@/services/users";
import { NextRequest, NextResponse } from "next/server";
type StudentRequestBody = {
    user: {
      firstname: string;
      lastname: string;
      citizenId: string;
      sex: number;
      phone: string;
      departmentId: number;
    };
    student: {
        id: string;
        studentId: string;
        educationLevel: number;
        major: string;
        academicYear: string;
        birthday: string;
    };
  };
export async function GET(request: NextRequest, {params}: {params: Promise<{ id: string}>}) {
    const { id } = await params;
    const student = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            student: {
                include: {
                    education: true,
                    inturnship: true,
                    report: true
                }
            },
            department: true,
        }
    })

    if(!student) return NextResponse.json({}, { status: 404});
    
    return NextResponse.json(student, { status: 200});
    
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const jsonBody = await req.json() as StudentRequestBody;
    const student = await prisma.student.findUnique({
        where: {
            userId: Number(id)
        }
    })

    if(!student) return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษา", type: "error"}, { status: 200});
    
    const updateuser = await updateUser(id, jsonBody.user);

    if(!updateuser) return NextResponse.json({ message: "กรุณาลองใหม่ภายหลัง!", type: "error"}, { status: 200}); 

    const updatestudent = await updateStudent(student.id.toString() , jsonBody.student);

    if(!updatestudent) return NextResponse.json({ message: "กรุณาลองใหม่ภายหลัง!", type: "error"}, { status: 200});

    return NextResponse.json({ message: "แก้ไขข้อมูลสำเร็จ", type: "success" }, { status: 200});
}

export async function DELETE(request: NextRequest, {params}: {params: Promise<{ id: string}>}) {
    const { id } = await params;
    const deleteStd = await removeStudent(id);

    if(!deleteStd) return NextResponse.json({ message: "ลองใหม่ภายหลัง!", type: "error"},{ status: 500});

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"});
}