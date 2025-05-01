import { findOneUser, removeUser } from "@/services/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{id: string}>}) {
    const { id } = await params;

    const user = await findOneUser(id);

    if(!user) return NextResponse.json({});
    
    return NextResponse.json(user)
}

export async function DELETE(request: NextRequest, {params}: {params: Promise<{ id: string}>}) {
    const { id } = await params;
    const deleteStd = await removeUser(id);

    if(!deleteStd) return NextResponse.json({ message: "ลองใหม่ภายหลัง!", type: "error"},{ status: 500});

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ", type: "success"});
}