import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { convertThaiDateToEnglishFormat } from "@/lib/utils";
import { parseForm } from "@/lib/uploadFile";
export async function POST(request: NextRequest) {
    const session = await auth();
    const formdata = await request.formData();
    const rawData = Object.fromEntries(formdata.entries());
    const data = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, String(value)])
    );
    const file = formdata.get("image") as File;
    if (!session) {
        console.log("session error");
        return;
    }
    const student = await prisma.student.findUnique({
        where: {
            userId: Number(session.user.id)
        }
    })
    if (!student) {
        return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษา", type: "error" }, { status: 400 })
    }
    let uniqueFilename;
    if (file && file.size > 0) {
        uniqueFilename = await parseForm(file, "report");
    }

    const report = await prisma.internshipReport.create({
        data: {
            studentId: student.id,
            title: data.title,
            description: data.description,
            reportDate: new Date(convertThaiDateToEnglishFormat(data.reportDate)),
            image: String(uniqueFilename) ?? null
        }
    })

    if (!report) {
        return NextResponse.json({ message: "เกิดข้อผิดพลาด", type: "error" }, { status: 500 })
    }

    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: 'success' }, { status: 201 })
}
