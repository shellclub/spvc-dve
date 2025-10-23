import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { createUser } from "@/services/users";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
export const config = {
    api: {
      bodyParser: false,
    },
  };
export async function POST(request: NextRequest) {
    const formData = await request.formData() ;
    const rawData = Object.fromEntries(formData.entries()) as unknown as Prisma.UserCreateInput;
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)])
    ) ;
    const file = formData.get('user_img') as File;
    try {
        const haveTeacher = await prisma.user.findUnique({
            where: {
                citizenId: data.citizenId
            }
        });

        if(haveTeacher) {
            return NextResponse.json({ message: "ผู้ใช้นี้มีข้อมูลอยู่ในระบบแล้ว", type: "error"}, { status: 400})
        }else{
             const userImgPath = await parseForm(file); 
                    
            const teacher = await prisma.user.create({
                data: {
                  username: data.citizenId,
                  firstname: data.firstname,
                  lastname: data.lastname,
                  citizenId: data.citizenId,
                  sex: Number(data.sex),
                  phone: data.phone,
                  birthday: new Date(data.birthday),
                  user_img: userImgPath,
                  role: 2,
                    teacher: {
                        create: {
                            departmentId: Number(data.departmentId)
                        }
                    }
                },
                include: {
                    teacher: true
                }
              });
            if(!teacher) return NextResponse.json({ message: "โปรดลองใหม่อีกครั้ง!", type: "error"}, {status: 500})
            return NextResponse.json({ message: "เพิ่มข้อมูลสำเร็จ", type: "success"}, { status: 201})
        }
         
    } catch (error) {
        console.log("Error creating teacher:", error);
        return NextResponse.json({ message: error, type: "error"}, { status: 500})
        
    }
}
export async function GET() {
    const teacher = await prisma.teacher.findMany({
        orderBy: {
            id: "desc"
        },
        include: {
            department: true,
            user: true,
            major: true
        }
    });
    if(!teacher) {
        return NextResponse.json({},{status: 200})
    }
    return NextResponse.json(teacher)
}