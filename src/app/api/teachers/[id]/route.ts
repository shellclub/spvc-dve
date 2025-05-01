import { prisma } from "@/lib/db";
import { parseForm } from "@/lib/uploadFile";
import { removeUser, updateUser } from "@/services/users";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
    const formData = await request.formData() ;
    const rawData = Object.fromEntries(formData.entries());
    const data = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, String(value)])
    )
    const file = formData.get('user_img') as File;
    data.user_img = await parseForm(file);
    try {
        
        const updateuser = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                citizenId: data.citizenId,
                sex: Number(data.sex),
                phone: data.phone,
                departmentId: Number(data.departmentId),
                birthday: new Date(data.birthday),
                user_img: data.user_img,
            }
        });
        if(!updateuser) return NextResponse.json({ message: "โปรดลองใหม่ภายหลัง", type: "error"}, { status: 400});
        return NextResponse.json({ message: "แก้ไขข้อมูลสำเร็จ", type: "success"}, {status: 200})
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
        }, { status: 500 });
    }

}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const deluser = await removeUser(id);
        if(!deluser) return NextResponse.json({ message: "โปรดลองใหม่ภายหลัง", type: "error"}, { status: 400});

        return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"}, { status: 200})
    } catch (error) {
        console.log(error);
        
    }
}