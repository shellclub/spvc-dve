import { findAllEducation } from "@/services/education";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const education = await findAllEducation();
    if(!education) {
        return NextResponse.json({message: "ไม่พบข้อมูลระดับการศึกษา", data: ""}, {status: 500})
    }
    return NextResponse.json(education)
}