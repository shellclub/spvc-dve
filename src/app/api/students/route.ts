import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import dayjs from "dayjs";
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        user: true,
        department: true,
        major: true,
        education: true
      }
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    // console.error("Error fetching students:", error);
    // return NextResponse.json(
    //   { message: "เกิดข้อผิดพลาดในการดึงข้อมูล", type: "error" },
    //   { status: 500 }
    // );

    return NextResponse.json(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key]) => key !== "user_img")
        .map(([key, value]) => [key, String(value)])
    );

    const file = formData.get("user_img") as File;

    if (!file) {
      return NextResponse.json(
        { message: "กรุณาอัพโหลดรูปภาพ", type: "error" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { citizenId: data.citizenId },
          { phone: data.phone },
        ]
      }
    });
    
    if (existingUser) {
      let message = "พบข้อมูลผู้ใช้ดังกล่าวในระบบแล้ว";
    
      if (existingUser.citizenId === data.citizenId) {
        message = "พบข้อมูลผู้ใช้ดังกล่าวในระบบแล้ว (เลขบัตรประชาชนซ้ำ)";
      } else if (existingUser.phone === data.phone) {
        message = "พบข้อมูลเบอร์โทรศัพท์ดังกล่าวในระบบแล้ว";
      }
    
      return NextResponse.json(
        { message, type: "error" },
        { status: 400 }
      );
    }

    // Check for existing student ID
    const existingStudent = await prisma.student.findUnique({
      where: {
        studentId: data.studentId,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { message: "รหัสนักศึกษานี้มีในระบบแล้ว", type: "error" },
        { status: 400 }
      );
    }

    // Upload file
    const userImgPath = await parseForm(file);
    const passwordString = dayjs(data.birthday).add(543, 'year').format('DD/MM/YYYY')
    console.log("password:",passwordString);
    
    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        citizenId: data.citizenId,
        sex: Number(data.sex),
        phone: data.phone,
        birthday: new Date(data.birthday),
        user_img: userImgPath,
        
        student: {
          create: {
            studentId: data.studentId,
            educationLevel: Number(data.educationLevel),
            major_id: Number(data.major_id),
            departmentId: Number(data.department), // Make sure form sends this
            academicYear: data.academicYear,
            room: data.room,
            term: data.term,
            gradeLevel: data.gradeLevel,
          },
        },
        login:{
          create: {
            username: data.studentId,
            password: bcrypt.hashSync(passwordString, 10),
          }
        }
      },
      include: {
        login: true,
        student: {
          include: {
            education: true,
            major: true,
            department: true,
          },
        },
      },
    });
    // Create user and student
   

    return NextResponse.json(
      {
        message: "เพิ่มข้อมูลนักศึกษาสำเร็จ",
        type: "success",
      },
      { status: 201 }
    );
  } catch (error) {
    // // console.log("Error creating student:", JSON.parse(String(error)));
    // return NextResponse.json({message: error}, {status: 500});
    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล"+error,
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}