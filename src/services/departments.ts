import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function findAllDepartments() {
    return await prisma.department.findMany({
        orderBy: {
            id: "desc"
        }
    })
}

export async function findOneDepartment(id: string) {
    return await prisma.department.findUnique({
        where: {
            id: Number(id)
        }
    })
}

export async function createDepartment(department: Prisma.DepartmentCreateInput){
    return await prisma.department.create({
        data: department
    })
}

export async function updateDepartment(id: string, department: Prisma.DepartmentUpdateInput){
    return await prisma.department.update({
        where: {
            id: Number(id)
        },
        data: department
    })
}

export async function removeDepartment(id: string): Promise<{ success: boolean; message: string }> {
    const deptId = Number(id);

    // ตรวจสอบว่าแผนกนี้มีอยู่จริง
    const dept = await prisma.department.findUnique({ where: { id: deptId } });
    if (!dept) {
        return { success: false, message: "ไม่พบข้อมูลแผนกวิชานี้ในระบบ" };
    }

    // ตรวจสอบข้อมูลที่อ้างอิงอยู่
    const [majorCount, teacherCount, studentCount] = await Promise.all([
        prisma.major.count({ where: { departmentId: deptId } }),
        prisma.teacher.count({ where: { departmentId: deptId } }),
        prisma.student.count({ where: { departmentId: deptId } }),
    ]);

    // ถ้ามี Major อ้างอิงอยู่ → ไม่สามารถลบได้ (FK RESTRICT)
    if (majorCount > 0 || teacherCount > 0 || studentCount > 0) {
        const reasons: string[] = [];
        if (majorCount > 0) reasons.push(`สาขาวิชา ${majorCount} สาขา`);
        if (teacherCount > 0) reasons.push(`บุคลากร ${teacherCount} คน`);
        if (studentCount > 0) reasons.push(`นักศึกษา ${studentCount} คน`);

        return {
            success: false,
            message: `ไม่สามารถลบแผนก "${dept.depname}" ได้ เนื่องจากยังมีข้อมูลที่เกี่ยวข้อง: ${reasons.join(", ")} กรุณาลบหรือย้ายข้อมูลเหล่านี้ก่อน`,
        };
    }

    // ลบแผนกวิชา
    await prisma.department.delete({ where: { id: deptId } });
    return { success: true, message: `ลบแผนก "${dept.depname}" สำเร็จ` };
}

export async function countDepartment() {
    return await prisma.department.count();
}