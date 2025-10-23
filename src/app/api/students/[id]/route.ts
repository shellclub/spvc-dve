import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
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
    };
    student: {
        id: string;
        studentId: string;
        educationLevel: number;
        major_id: string;
        academicYear: string;
        birthday: string;
        department: number
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
        userImgPath = await parseForm(file); // สมมุติว่าเป็นฟังก์ชันอัปโหลดรูป
      }
  
      const userData = {
        firstname: data.firstname,
        lastname: data.lastname,
        citizenId: data.citizenId,
        sex: Number(data.sex),
        phone: data.phone,
        birthday: new Date(data.birthday),
        user_img: userImgPath,
        username: data.studentId,
      };
  
      const studentData = {
        studentId: data.studentId,
        educationLevel: Number(data.educationLevel),
        major_id: Number(data.major_id),
        academicYear: data.academicYear,
        departmentId: Number(data.department),
        room: data.room,
        term: data.term,
        gradeLevel: data.gradeLevel,
      };

      const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          ...userData,
          student: { update: studentData },
        },
        include: { student: true },
      });
        if (!updated) {
            return NextResponse.json({ message: "ไม่สามารถอัปเดตข้อมูลได้", type: "error" }, { status: 500 });
        }
  
      return NextResponse.json({ message: "แก้ไขข้อมูลสำเร็จ", type: "success" }, { status: 200 });
  
    } catch (error) {
      // console.log("Update error:", error);
      return NextResponse.json({ message: "เกิดข้อผิดพลาดในระบบ", type: "error" }, { status: 500 });
    }
  }
  


export async function DELETE(request: NextRequest, {params}: {params: Promise<{ id: string}>}) {
    const { id } = await params;
    const deleteStd = await removeStudent(id);

    if(!deleteStd) return NextResponse.json({ message: "ลองใหม่ภายหลัง!", type: "error"},{ status: 500});

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"});
}