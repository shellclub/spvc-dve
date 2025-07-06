import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { NextRequest, NextResponse } from "next/server";

type StudentRequestBody = {
  user: {
    firstname: string;
    lastname: string;
    citizenId: string;
    sex: number;
    phone: string;
    departmentId: number;
    birthday: Date;
  };
  student: {
    studentId: string;
    educationLevel: number;
    major: string;
    academicYear: string;
  };
};

export async function GET() {
  const students = await prisma.user.findMany({
    where: {
      role: 3,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      student: {
        include: {
          education: true,
          inturnship: true,
        },
      },
      department: true,
    },
  });
  if (!students) {
    return NextResponse.json({}, { status: 200 });
  }
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rawData = Object.fromEntries(formData.entries());
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)])
    );

    const file = formData.get("user_img") as File;

    if (!file) {
      return NextResponse.json("No file uploaded", { status: 400 });
    }
    const haveUser = await prisma.user.findUnique({
      where: {
        citizenId: data.citizenId,
      },
    });
    if (haveUser) {
      return NextResponse.json(
        { message: "พบข้อมูลผู้ใช้ดังกล่าวในระบบแล้ว", type: "error" },
        { status: 400 }
      );
    } else {
      
      const userImgPath = await parseForm(file);
      const user = await prisma.user.create({
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          citizenId: data.citizenId,
          sex: Number(data.sex),
          phone: data.phone,
          departmentId: Number(data.department),
          birthday: new Date(data.birthday),
          user_img: userImgPath,
          username: data.studentId,
          student: {
            create: {
              studentId: data.studentId,
              educationLevel: Number(data.educationLevel),
              major: data.major,
              academicYear: data.academicYear,
              room: data.room,
              term: data.term,
              gradeLevel: data.gradeLevel,
            },
          },
        },
        include: {
          student: true,
        },
      });

      if (!user) {
        return NextResponse.json("เกิดข้อผิดพลาด", { status: 400 });
      }
      // เขียนไฟล์ลงดิสก์

      return NextResponse.json(
        {
          message: "เพิ่มข้อมูลนักษาสำเร็จ",
          type: "success",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(`Error: ${error}`);
    
    return NextResponse.json(
      {
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}
