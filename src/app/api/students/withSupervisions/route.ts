// app/api/students/withSupervisions/route.ts

import { NextResponse } from "next/server"; // ◀◀◀ 1. Import NextResponse
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  
  const session = await auth()
  if (!session || session.user.role !== 5) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const teacher = await prisma.teacher.findUnique({
    where: {
        userId: Number(session.user.id)
    },
    select: { departmentId: true}
  })

  if(!teacher) {
    return NextResponse.json({ message: "ไม่พบข้อมูลครูนิเทศ"},{ status: 400});
  }
  const departmentId = teacher.departmentId;

  try {
    // ◀◀◀ 3. ดึง Query Params แบบใหม่
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");
    const year = searchParams.get("year");

    const students = await prisma.user.findMany({
      where: {
        role: 7, // สมมติว่า 7 คือนักศึกษา
        student: {
          departmentId: departmentId, // (กรองตามแผนกของอาจารย์)
          ...(term && year && { term: String(term), academicYear: String(year) })
        }
      },
      include: {
        student: {
          include: {
            education: true,
            department: true,
            major: true,
            studentCompanies: {
              orderBy: { assignedAt: "desc" }, 
              include: {
                company: true, 
                supervisions: { 
                  orderBy: { supervisionDate: "desc" }, 
                  include: {
                    supervisor: { 
                      include: {
                        user: { 
                          select: { firstname: true, lastname: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        firstname: "asc"
      }
    });

    const filteredData = students.filter(user => user.student);

    return NextResponse.json(filteredData, { status: 200 });

  } catch (error) {
    console.error("Error fetching students with supervisions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}