import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { createUser } from "@/services/users";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    api: {
      bodyParser: false,
    },
};

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries()) as unknown as Prisma.UserCreateInput;
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)])
    );
    const file = formData.get('user_img') as File;
    
    try {
        const haveTeacher = await prisma.user.findUnique({
            where: {
                citizenId: data.citizenId
            }
        });
        
        if(haveTeacher) {
            return NextResponse.json({ message: "ผู้ใช้นี้มีข้อมูลอยู่ในระบบแล้ว", type: "error"}, { status: 400})
        } else {
            // ตรวจสอบว่ามีไฟล์รูปภาพหรือไม่
            let userImgPath = "avatar.jpg"; // ค่าเริ่มต้น
            
            if (file && file.size > 0) {
                userImgPath = await parseForm(file);
            }
                    
            const teacher = await prisma.user.create({
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
                        create: {
                            departmentId: Number(data.departmentId) || null,
                            majorId: Number(data.majorId) || null,
                            room: data.room || null,
                            grade: data.grade || null,
                            educationId: Number(data.educationId) || null,
                            term: data.term || null,
                            years: data.years || null
                        }
                    },
                    login: {
                        create: {
                            username: data.citizenId,
                            password: bcrypt.hashSync(data.citizenId, 10),
                        }
                    }
                },
                include: {
                    login: true,
                    teacher: {
                        include: {
                            department: true,
                            major: true,
                            education: true
                        }
                    },
                }
            });
            
            if(!teacher) return NextResponse.json({ message: "โปรดลองใหม่อีกครั้ง!", type: "error"}, {status: 500})
            return NextResponse.json({ message: "เพิ่มข้อมูลสำเร็จ", type: "success"}, { status: 201})
        }
         
    } catch (error) {
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
            major: true,
            education: true
        }
    });
    return NextResponse.json(teacher)
}