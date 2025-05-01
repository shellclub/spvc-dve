import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { convertThaiDateToEnglishFormat } from "@/lib/utils";
import { parseForm } from "@/lib/uploadFile";

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string }>}) {
    const { id } = await params;
    const student = await prisma.student.findUnique({
        where: {
            userId: Number(id)
        }
    })

    if(!student) {
        return NextResponse.json({ error: "ไม่มีพบข้อมูลนักศึกษา"}, { status: 400})
    }
    const intern = await prisma.internshipReport.findMany({
        where: {
            studentId: student.id
        }
    })

    if(!intern) {
        return NextResponse.json({ error: "ไม่พบข้อมูลการฝึกงาน"}, { status: 400})
    }

    return NextResponse.json(intern)
}

export async function PUT(request: NextRequest, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const formdata = await request.formData();
    const file = formdata.get("image") as File;
    const filename = await parseForm(file, "report");
    const thaidate = formdata.get("reportDate");
    formdata.append('image', filename);
    if (thaidate) {
        const englishDate = new Date(convertThaiDateToEnglishFormat(String(thaidate)));
        formdata.append('reportDate',String(englishDate));
      }    const rawData = Object.fromEntries(formdata.entries());
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)] )
    ) as Prisma.InternshipReportUpdateInput;


    
    const update = await prisma.internshipReport.update({
      where: {
        id: Number(id)
      },
      data: {
        title: data.title,
        description: data.description,
        reportDate: new Date(String(data.reportDate)),
        image: data.image
      }
    });
  
    if(!update) {
      return NextResponse.json({ message: "เกิดข้อผิดพลาด", type: "error"}, { status: 400});
    }
  
    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success"});
  }
  
  export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string}>}) {
        const { id } = await params;
        const del = await prisma.internshipReport.delete({
            where: {
                id: Number(id)
            }
        })

        if(!del) {
            return NextResponse.json({ message: "เกิดข้อผิดพลาด", type: "error"}, { status: 400});
        }

        return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success"});
        
  }