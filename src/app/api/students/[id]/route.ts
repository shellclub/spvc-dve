import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { removeStudent } from "@/services/students";
import { NextRequest, NextResponse } from "next/server";

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
                    report: true,
                    department: true,
                    major: true
                }
            },
        }
    })

    if(!student) return NextResponse.json({}, { status: 404});
    
    return NextResponse.json(student, { status: 200});
    
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string}> }) {
    const { id } = await params;
  
    try {
      const formData = await req.formData();
      const data = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
      
      const student = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { student: true },
      });
  
      if (!student) {
        return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษา", type: "error" }, { status: 200 });
      }
  
      const file = formData.get("user_img") as File | null;
      let userImgPath = student.user_img;
  
      if (file && file.size > 0) {
        userImgPath = await parseForm(file);
      }
  
      const userData = {
        firstname: data.firstname,
        lastname: data.lastname,
        prefix: data.prefix || null,
        phone: data.phone,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
        user_img: userImgPath,
      };
  
      const studentData = {
        studentId: data.studentId,
        educationLevel: data.educationLevel ? Number(data.educationLevel) : undefined,
        major_id: data.major_id ? Number(data.major_id) : undefined,
        academicYear: data.academicYear || undefined,
        curriculum: data.curriculum || undefined,
        departmentId: data.department ? Number(data.department) : undefined,
        room: data.room || undefined,
        term: data.term || undefined,
        gradeLevel: data.gradeLevel || undefined,
      };

      const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          ...userData,
          student: { update: studentData },
          login: { update: {
            username: data.studentId
          }}
        },
        include: { 
          student: true,
          login: true
        },
      });
        if (!updated) {
            return NextResponse.json({ message: "ไม่สามารถอัปเดตข้อมูลได้", type: "error" }, { status: 500 });
        }
  
      return NextResponse.json({ message: "แก้ไขข้อมูลสำเร็จ", type: "success" }, { status: 200 });
  
    } catch (error) {
      return NextResponse.json({ message: "เกิดข้อผิดพลาดในระบบ", type: "error" }, { status: 500 });
    }
  }
  


export async function DELETE(request: NextRequest, {params}: {params: Promise<{ id: string}>}) {
    const { id } = await params;
    const deleteStd = await removeStudent(id);

    if(!deleteStd) return NextResponse.json({ message: "ลองใหม่ภายหลัง!", type: "error"},{ status: 500});

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"});
}