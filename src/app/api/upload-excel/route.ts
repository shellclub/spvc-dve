import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { prisma } from "@/lib/db";
import { excelSerialToDate } from "@/lib/utils";
interface ExcelRow {
    firstname: string;
    lastname: string;
    citizenId: string;
    phone: string;
    sex: number;
    birthday: string;
    departmentId: number;
    username?: string;
    password?: string;
    studentId: string;
    educationLevel: number;
    major: string;
    academicYear: string;
    user_img: string;
    room: string;
    term: string;
  }
  
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("excel") as File;

    if (!file || !file.name.endsWith(".xlsx")) {
      return NextResponse.json({ error: "กรุณาอัปโหลดไฟล์ .xlsx เท่านั้น", type: "error" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet); // ✅ ใส่ generic type

    if (!jsonData.length) {
      return NextResponse.json({ error: "ไม่พบข้อมูลในไฟล์", type: "error" }, { status: 400 });
    }

    const requiredUserFields = [
      "firstname", "lastname", "citizenId", "phone", "sex",
      "birthday", "departmentId", "user_img"
    ];
    const requiredStudentFields = ["studentId", "educationLevel", "major", "academicYear"];

    const missingFields = jsonData.some((row: any) =>
      [...requiredUserFields, ...requiredStudentFields].some(f => !(f in row))
    );
    if (missingFields) {
      return NextResponse.json({ error: "ข้อมูลบางแถวขาดคอลัมน์ที่จำเป็น", type: "error" }, { status: 400 });
    }
    console.log(excelSerialToDate(Number(jsonData[0].birthday)));
    for (const row of jsonData) {
        const existingUser = await prisma.user.findUnique({
            where: { citizenId: String(row.citizenId) },
          });
        
          if (existingUser) continue; 
      const user = await prisma.user.create({
        data: {
          firstname: String(row.firstname),
          lastname: String(row.lastname),
          citizenId: String(row.citizenId),
          phone: String(row.phone),
          sex: Number(row.sex),
          birthday: new Date(excelSerialToDate(Number(row.birthday))),
          departmentId: Number(row.departmentId),
          username: String(row.studentId),
          role: 3,
          user_img: String(row.user_img),
          student: {
              create: {
                  studentId: String(row.studentId),
                  educationLevel: Number(row.educationLevel),
                  major: String(row.major),
                  academicYear: String(row.academicYear),
                  room: String(row.room),
                  term: String(row.term)
              }
            },
        },
        include: {
            student: true
        }
      });
    }
    

    return NextResponse.json({ message: "นำเข้าข้อมูลสำเร็จ!", type: "success"});
  } catch (error) {
    // console.error("Upload Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดขณะประมวลผล", type: "error" }, { status: 500 });
  }
}
