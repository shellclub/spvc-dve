import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function findAllUser() {
    return await prisma.user.findMany({
        orderBy: {
            id: "desc"
        }
    })
}
export async function findOneUser(id: string) {
    return await prisma.user.findUnique({
        where: {
            id: Number(id)
        }
    })
}

export async function createUser(user: Prisma.UserCreateInput){
    return await prisma.user.create({
        data: user
    })
}

export async function updateUser(id: string, user: Prisma.UserUpdateInput) {
    return await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: user
    })
}

export async function removeUser(id: string){
    return await prisma.user.delete({
        where: {
            id: Number(id)
        }
    })
}

export async function countUser() {
    return await prisma.user.count();
}