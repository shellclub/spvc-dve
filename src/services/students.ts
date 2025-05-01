import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function findAllStudent() {
    return await prisma.student.findMany({
        orderBy: {
            id: "desc"
        },
        include: {
            user: true,
        }
    });
}

export async function findOneStudent(id: string) {
    return await prisma.student.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            user: true,
            department: true
        }
    });
}

export async function createStudent(student: Prisma.StudentCreateInput) {
    return await prisma.student.create({
        data: student
    });
}

export async function updateStudent(id: string, student: Prisma.StudentUpdateInput) {
    return await prisma.student.update({
        where: {
            id: Number(id)
        },
        data: student
    });
}

export async function removeStudent(id: string){
    return await prisma.student.delete({
        where: {
            id: Number(id)
        }
    });
}

export async function countStudent() {
    return await prisma.student.count();
}