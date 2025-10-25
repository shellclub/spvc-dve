import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { removeUser, updateUser } from "@/services/users";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest,  { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
    const teachers = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            teacher: {
                include: {
                    department: true,
                    education: true,
                    major: true,
                    
                }
            },
            
        }
    })

    return NextResponse.json(teachers,{ status: 200});

}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)])
    );
  
    const file = formData.get("user_img") as File | null;
    let userImgPath: string | null = null;
  
    try {
      // 1. ดึงข้อมูล user เดิมก่อน
      const existingUser = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: { user_img: true },  
      });
  
      if (!existingUser) {
        return NextResponse.json({ message: "ไม่พบข้อมูลผู้ใช้", type: "error" }, { status: 404 });
      }
  
      // 2. ตรวจสอบว่ามีการแนบไฟล์ใหม่มาหรือไม่
      if (file && file.size > 0) {
        // ถ้ามีการแนบรูปใหม่
        userImgPath = await parseForm(file); // ฟังก์ชันอัปโหลดรูปที่คุณมีอยู่แล้ว
      } else {
        // ถ้าไม่มีการแนบรูปใหม่ ใช้รูปเดิมแทน
        userImgPath = existingUser.user_img;
      }
  
      // 3. อัปเดตข้อมูล
      const updateuser = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          citizenId: data.citizenId,
          sex: Number(data.sex),
          phone: data.phone,
          birthday: new Date(data.birthday),
          user_img: userImgPath, 
          role: Number(data.role),
          teacher: {
            update: { 
              departmentId: Number(data.departmentId),
              majorId: Number(data.majorId) || null,
              room: data.room || null,
              grade: data.grade || null,
              educationId: Number(data.educationId) || null,
              term: data.term || null,
              years: data.years || null
            },
          },
        },
        include: {
          teacher: { 
            include: { 
              department: true,
              major: true,
              education: true
            } },
        },
      });
  
      if (!updateuser)
        return NextResponse.json({ message: "โปรดลองใหม่ภายหลัง", type: "error" }, { status: 400 });
  
      return NextResponse.json({ message: "แก้ไขข้อมูลสำเร็จ", type: "success" }, { status: 200 });
    } catch (error) {
      console.error("Update teacher error:", error);
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการอัปเดต", error },
        { status: 500 }
      );
    }
  }
  


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const deluser = await removeUser(id);
        if(!deluser) return NextResponse.json({ message: "โปรดลองใหม่ภายหลัง", type: "error"}, { status: 400});

        return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"}, { status: 200})
    } catch (error) {
        console.log(error);
        
    }
}