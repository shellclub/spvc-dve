
// src/app/api/company/route.tsx
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { log } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
      const companies = await prisma.companies.findMany({
        orderBy: {
          id: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              phone: true,
              citizenId: true,
            }
          }
        }
      });
  
      return NextResponse.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการดึงข้อมูล", type: "error" },
        { status: 500 }
      );
    }
  }

  export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const {
        name,
        address,
        firstname,
        lastname,
        phone,
        citizenId,
        studentIds, // <-- 1. รับ studentIds
        startDate, // <-- 2. รับ startDate
        endDate, // <-- 3. รับ endDate
      } = body;
  // console.log(body);
  
      // --- 1. Validation ---
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json(
          { message: "กรุณาเลือกนักศึกษาอย่างน้อย 1 คน", type: "error" },
          { status: 400 }
        );
      }
  
      if (!startDate || !endDate) {
        return NextResponse.json(
          { message: "กรุณาระบุวันที่เริ่มและสิ้นสุดการฝึกงาน", type: "error" },
          { status: 400 }
        );
      }
  
      // --- 2. Check existing data (ก่อนเริ่ม Transaction) ---
      const exitsUser = await prisma.user.findUnique({
        where: { citizenId: String(citizenId) },
      });
  
      if (exitsUser) {
        return NextResponse.json(
          { message: "มีข้อมูลผู้ใช้งานดังกล่าวแล้ว", type: "error" },
          { status: 400 }
        );
      }
  
      const existingCompany = await prisma.companies.findUnique({
        where: { name: String(name) },
      });
  
      if (existingCompany) {
        return NextResponse.json(
          { message: "มีข้อมูลสถานประกอบการดังกล่าวแล้ว", type: "error" },
          { status: 400 }
        );
      }
  
      // --- 3. ใช้ Transaction เพื่อสร้าง User, Company, และ Internships ---
      const result = await prisma.$transaction(async (tx) => {
        // a. สร้าง User (ผู้ติดต่อ) และ Company (สถานประกอบการ)
        const newUser = await tx.user.create({
          data: {
            firstname,
            lastname,
            phone: phone || "",
            citizenId,
            role: 6, // role สำหรับสถานประกอบการ
            login: {
              create: {
                username: citizenId,
                password: bcrypt.hashSync(citizenId, 10),
              },
            },
            company: {
              create: {
                name,
                address,
              },
            },
          },
          include: {
            company: true, // <-- สำคัญมาก: เพื่อให้เราได้ ID ของ Company ที่เพิ่งสร้าง
          },
        });
  
        if (!newUser.company) {
          // Safeguard: ควรจะมี company เสมอถ้า create สำเร็จ
          throw new Error("ไม่สามารถสร้างข้อมูลสถานประกอบการได้");
        }
  
        const newCompanyId = newUser.company.id;
  
        // b. เตรียมข้อมูล Internship ที่จะสร้าง
        const internshipData = studentIds.map((studentId: string) => ({
          studentId: Number(studentId),
          companyId: Number(newCompanyId),
          startDate: new Date(startDate), // แปลง String เป็น Date
          endDate: new Date(endDate),
          // เพิ่ม field อื่นๆ ที่จำเป็นสำหรับ Model Internship ของคุณ (ถ้ามี)
        }));
  
        // c. สร้างข้อมูล Internship ทั้งหมดในครั้งเดียว
        await tx.studentCompanies.createMany({
          data: internshipData,
        });
  
        return newUser; // คืนค่ำ newUser ที่มีข้อมูล company
      });
  
      return NextResponse.json(
        {
          message: "เพิ่มข้อมูลสถานประกอบการและนักศึกษาสำเร็จ",
          type: "success",
          data: result,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating company:", error);
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล", type: "error" },
        { status: 500 }
      );
    }
  }