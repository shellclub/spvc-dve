import { prisma } from "@/lib/db";
// import { removeDepartment, updateDepartment } from "@/services/departments";
// import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
// import { number } from "zod";
type Params = Promise<{ id: string }>
export async function GET(request: NextRequest, {params}: {params: Params}) {
    const { id } = await params;
    const majorFilterByDepartment = await prisma.major.findMany({
        where: {
            departmentId: Number(id)
        }
    })

    return NextResponse.json(majorFilterByDepartment);
}