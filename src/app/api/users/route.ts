import { findAllUser } from "@/services/users";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await findAllUser();
    if(!user) {
        return NextResponse.json({})
    }
    return NextResponse.json(user);
}