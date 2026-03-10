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

    // Check for existing phone
    if (data.phone) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: data.phone }
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "พบข้อมูลเบอร์โทรศัพท์ดังกล่าวในระบบแล้ว", type: "error" },
          { status: 400 }
        );
      }
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

    // Upload file (optional)
    let userImgPath = "avatar.jpg";
    if (file && file.size > 0) {
      userImgPath = await parseForm(file);
    }

    // Generate password from birthday
    const passwordString = data.birthday
      ? dayjs(data.birthday).add(543, 'year').format('DD/MM/YYYY')
      : data.studentId; // fallback to studentId if no birthday

    // Generate a unique citizenId placeholder (since field is required by DB)
    const citizenId = `STD${data.studentId}${Date.now()}`.substring(0, 13);

    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        citizenId: citizenId,
        prefix: data.prefix || null,
        phone: data.phone,
        birthday: data.birthday ? new Date(data.birthday) : new Date(),
        user_img: userImgPath,
        
        student: {
          create: {
            studentId: data.studentId,
            educationLevel: data.educationLevel ? Number(data.educationLevel) : undefined,
            major_id: data.major_id ? Number(data.major_id) : undefined,
            departmentId: data.department ? Number(data.department) : undefined,
            academicYear: data.academicYear || undefined,
            curriculum: data.curriculum || undefined,
            room: data.room || undefined,
            term: data.term || undefined,
            gradeLevel: data.gradeLevel || undefined,
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

    return NextResponse.json(
      {
        message: "เพิ่มข้อมูลนักศึกษาสำเร็จ",
        type: "success",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล" + error,
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}