
// src/app/api/company/route.tsx
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
      const companies = await prisma.companies.findMany({
        orderBy: {
          id: 'desc'
        },
        include: {
          user: true
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
        position,
        selectedCompanyId,
        studentIds,
        startDate,
        endDate,
      } = body;

      // Generate a unique citizenId placeholder
      const citizenId = `CMP${Date.now()}`.substring(0, 13);

      // --- Validation ---
      if (!firstname || !lastname) {
        return NextResponse.json(
          { message: "กรุณากรอกชื่อและนามสกุลผู้ติดต่อ", type: "error" },
          { status: 400 }
        );
      }

      // Check for phone duplicate if phone is provided
      if (phone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: String(phone) },
        });
        if (existingPhone) {
          return NextResponse.json(
            { message: "เบอร์โทรศัพท์นี้มีในระบบแล้ว", type: "error" },
            { status: 400 }
          );
        }
      }

      // If an existing company was selected, we just need to add internships
      if (selectedCompanyId) {
        // Check if studentIds are provided for internship
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0 && startDate && endDate) {
          const internshipData = studentIds.map((studentId: string) => ({
            studentId: Number(studentId),
            companyId: Number(selectedCompanyId),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }));
          await prisma.studentCompanies.createMany({
            data: internshipData,
          });
        }
        return NextResponse.json(
          { message: "เพิ่มข้อมูลสำเร็จ", type: "success" },
          { status: 201 }
        );
      }
  
      // Check existing company name
      const existingCompany = await prisma.companies.findUnique({
        where: { name: String(name) },
      });
  
      if (existingCompany) {
        return NextResponse.json(
          { message: "มีข้อมูลสถานประกอบการดังกล่าวแล้ว", type: "error" },
          { status: 400 }
        );
      }
  
      // --- Create with Transaction ---
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            firstname,
            lastname,
            phone: phone || "",
            citizenId,
            prefix: position || null,
            role: 6,
            login: {
              create: {
                username: citizenId,
                password: bcrypt.hashSync(citizenId, 10),
              },
            },
            company: {
              create: {
                name,
                address: address || "",
              },
            },
          },
          include: {
            company: true,
          },
        });
  
        if (!newUser.company) {
          throw new Error("ไม่สามารถสร้างข้อมูลสถานประกอบการได้");
        }
  
        const newCompanyId = newUser.company.id;
  
        // If studentIds provided, create internships
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0 && startDate && endDate) {
          const internshipData = studentIds.map((studentId: string) => ({
            studentId: Number(studentId),
            companyId: Number(newCompanyId),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }));

          await tx.studentCompanies.createMany({
            data: internshipData,
          });
        }
  
        return newUser;
      });
  
      return NextResponse.json(
        {
          message: "เพิ่มข้อมูลสถานประกอบการสำเร็จ",
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