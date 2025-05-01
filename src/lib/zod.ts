import { z } from 'zod';

const isValidDate = (val: string) => {
  const date = new Date(val);
  return !isNaN(date.getTime()) && val === date.toISOString().split('T')[0];
};

export const studentSchema = z.object({
  studentId: z.string().min(1, { message: "กรุณากรอกรหัสนักศึกษา" }),

  firstname: z.string().min(1, { message: "กรุณากรอกชื่อ" }),
  lastname: z.string().min(1, { message: "กรุณากรอกนามสกุล" }),

  academicYear: z.string().min(1, { message: "กรุณากรอกปีการศึกษา" }),

  citizenId: z.string()
    .regex(/^\d{13}$/, { message: "กรุณากรอกเลขบัตร 13 หลักให้ถูกต้อง" }),

  phone: z.string()
    .regex(/^0\d{9}$/, { message: "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 0987654321" }),

  sex: z.string().min(1, { message: "กรุณาเลือกเพศ" }),

  educationLevel: z.string().min(1, { message: "กรุณาเลือกระดับชั้น" }),

  departmentId: z.string().min(1, { message: "กรุณาเลือกแผนกวิชา" }),

  major: z.string().min(1, { message: "กรุณากรอกสาขาวิชา" }),
  birthday: z
  .string()
  .refine((val) => isValidDate(val), {
    message: 'วันเกิดไม่ถูกต้อง ต้องเป็นวันที่ในรูปแบบ YYYY-MM-DD',
  }),

  user_img: z
    .instanceof(File) // ตรวจสอบว่าเป็นอินสแตนซ์ของ File
    .refine((file) => file.type === 'image/png' || file.type === 'image/jpeg', {
      message: 'ไฟล์ต้องเป็น .png หรือ .jpg',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, { // ตรวจสอบขนาดไฟล์ไม่เกิน 5MB
      message: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB',
    }),
});
