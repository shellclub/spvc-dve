import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { NextRequest, NextResponse } from "next/server";

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
    const existingUser = await prisma.user.findUnique({
      where: {
        citizenId: data.citizenId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "พบข้อมูลผู้ใช้ดังกล่าวในระบบแล้ว", type: "error" },
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

    // Create user and student
    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        citizenId: data.citizenId,
        sex: Number(data.sex),
        phone: data.phone,
        birthday: new Date(data.birthday),
        user_img: userImgPath,
        username: data.studentId,
        student: {
          create: {
            studentId: data.studentId,
            educationLevel: Number(data.educationLevel),
            major_id: Number(data.major_id),
            departmentId: Number(data.departmentId), // Make sure form sends this
            academicYear: data.academicYear,
            room: data.room,
            term: data.term,
            gradeLevel: data.gradeLevel,
          },
        },
      },
      include: {
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
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);

    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล",
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}