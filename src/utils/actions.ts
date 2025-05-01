import { education_levels } from './../../node_modules/.prisma/client/index.d';
'use server'

import { prisma } from "@/lib/db";
import { studentSchema } from "@/lib/zod";

type ResponseType = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createStd(prevState: any, formData: FormData): Promise<ResponseType> {
  // Convert FormData to object
  const rawData = Object.fromEntries(formData.entries());
  const data = Object.fromEntries(
    Object.entries(rawData).map(([key, value]) => [key, String(value)])
  );

  // Validate input data
  const result = studentSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "กรุณากรอกข้อมูลให้ถูกต้องครบถ้วน"
    };
  }

  try {
    // Check for duplicate citizenId or studentId
    const [existingUser, existingStudent] = await Promise.all([
      prisma.user.findUnique({ where: { citizenId: data.citizenId } }),
      prisma.student.findUnique({ where: { studentId: data.studentId } })
    ]);

    if (existingUser || existingStudent) {
      return {
        success: false,
        errors: {},
        message: "พบข้อมูลผู้ใช้งานอยู่ในระบบแล้ว"
      };
    }

    // Create user and student
    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        citizenId: data.citizenId,
        sex: Number(data.sex),
        phone: data.phone,
        departmentId: Number(data.departmentId),
        birthday: new Date(data.birthday),
        student: {
          create: {
              studentId: data.studentId,
              educationLevel: Number(data.educationLevel),
              major: data.major,
              academicYear: data.academicYear,
          }
        }
      },
      include: {
        student: true
      }
    });

    if (!user || !user.student) {
      return {
        success: false,
        errors: {},
        message: "ไม่สามารถสร้างผู้ใช้งานได้"
      };
    }

    return {
      success: true,
      message: "สร้างผู้ใช้งานสำเร็จ"
    };

  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      errors: {},
      message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน"
    };
  }
}