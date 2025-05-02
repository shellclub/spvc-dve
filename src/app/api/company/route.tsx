import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if(!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const student = await prisma.student.findUnique({
        where: { 
            userId: Number(session.user.id)
         },
    });
    if(!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const companies = await prisma.companies.findUnique({
        where: {
            studentId: student.id,
        },
    });
    if(!companies) {
        return NextResponse.json({}, { status: 200 });
    }
    return NextResponse.json(companies, { status: 200 });
}
export async function POST(request: NextRequest) {
    const session = await auth();

    if(!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const student = await prisma.student.findUnique({
        where: { 
            userId: Number(session.user.id)
         },
    });
    if(!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const existingCompany = await prisma.companies.findUnique({
        where: {
            studentId: student.id,
        },
    });

    
    let companies;
    if(existingCompany) {
        const body = await request.json() as Prisma.companiesUpdateInput;
        companies = await prisma.companies.update({
            where: {
                studentId: student.id,
            },
            data: {
                name: body.name,
                address: body.address,
                tel: body.tel,
                trainer: body.trainer,
                position: body.position,
                week: Number(body.week),
            },
        });
    }else{
        const body = await request.json() as Prisma.companiesCreateInput;
         companies = await prisma.companies.create({
            data: {
                name: body.name,
                address: body.address,
                tel: body.tel,
                trainer: body.trainer,
                position: body.position,
                week: Number(body.week),
                studentId: student.id,
            },
        });
    }
    if(!companies) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json({message: "ดำเนินการสำเร็จ"}, { status: 201 });
}