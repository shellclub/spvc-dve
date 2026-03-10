import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { findOneUser, removeUser, updateUser } from "@/services/users";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
            student: {
                include: {
                    department: true,
                    major: true,
                    education: true,
                    inturnship: true,
                }
            },
            teacher: {
                include: {
                    department: true,
                    major: true,
                    education: true,
                }
            },
            company: true
        }
    });

    if (!user) return NextResponse.json({});

    return NextResponse.json(user)
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formdata = await request.formData();
    const file = formdata.get("user_img") as File;
    const userData = await findOneUser(id);
    if (!userData) return NextResponse.json({ message: "ไม่พบข้อมูล", type: "error" }, { status: 404 });
    if (!file) {
        formdata.delete("user_img");
    }
    let filename = userData.user_img;
    if (file.size > 0 && file) {
        filename = await parseForm(file);
    }
    formdata.append("user_img", String(filename))
    const rawData = Object.fromEntries(formdata.entries());
    const data = Object.fromEntries(
        Object.entries(rawData)
    ) as Prisma.UserUpdateInput;

    const user = await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: {
            firstname: data.firstname,
            lastname: data.lastname,
            phone: data.phone,
            user_img: data.user_img
        }
    });
    if (!user) {
        return NextResponse.json({ message: "ลองใหม่ภายหลัง", type: "error" }, { status: 400 });
    }

    return NextResponse.json({ message: "ดำเนินการสำเร็จ", type: "success" }, { status: 200 });
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deleteStd = await removeUser(id);

    if (!deleteStd) return NextResponse.json({ message: "ลองใหม่ภายหลัง!", type: "error" }, { status: 500 });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success" });
}