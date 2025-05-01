import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function findAllEducation() {
    return await prisma.education_levels.findMany({
        orderBy: {
            id: "desc"
        }
    })
}

export async function findOneEducation(id: string) {
    return await prisma.education_levels.findUnique({
        where: {
            id: Number(id)
        }
    })
}

export async function createEducation(education: Prisma.education_levelsCreateInput){
    return await prisma.education_levels.create({
        data: education
    })
}

export async function updateEducation(id: string, education: Prisma.education_levelsUpdateInput){
    return await prisma.education_levels.update({
        where: {
            id: Number(id)
        },
        data: education
    })
}

export async function removeEducation(id: string){
    return await prisma.education_levels.delete({
        where: {
            id: Number(id)
        }
    })
}

export async function countEducation(){
    return await prisma.education_levels.count()
}