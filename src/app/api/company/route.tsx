
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
      const { name, address, firstname, lastname, phone, citizenId } = body;
  
    const exitsUser = await prisma.user.findUnique({
        where: { citizenId: String(citizenId) }
        });
    if (exitsUser) {
        return NextResponse.json(
        { message: "มีข้อมูลผู้ใช้งานดังกล่าวแล้ว", type: "error" },
        { status: 400 }
        );
    }
      // ตรวจสอบว่า student นี้มี company แล้วหรือยัง
      const existingCompany = await prisma.companies.findUnique({
        where: { name: String(name) }
      });
  
      if (existingCompany) {
        return NextResponse.json(
          { message: "มีข้อมูลสถานประกอบการดังกล่าวแล้ว", type: "error" },
          { status: 400 }
        );
      }
  
      // สร้าง user สำหรับสถานประกอบการ
      const user = await prisma.user.create({
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
            }
        },
        company: {
            create: {
                name,
                address
            }
        }
       
    },
    include: {
        company: true,
        login: true
    }

      });
  

  
      return NextResponse.json({
        message: "เพิ่มข้อมูลสถานประกอบการสำเร็จ",
        type: "success",
      }, { status: 201 });
  
    } catch (error) {
      console.error("Error creating company:", error);
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล", type: "error" },
        { status: 500 }
      );
    }
  }