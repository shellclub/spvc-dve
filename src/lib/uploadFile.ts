import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
export const config = {
  api: {
    bodyParser: false,
  },
  runtime: 'nodejs',
};

export async function parseForm(file: File, pathName: string = 'uploads'): Promise<string> {
  const uploadDir = path.join(process.cwd(), `public/${pathName}`);
  
  // สร้างโฟลเดอร์หากยังไม่มี
 try {
        await fs.promises.access(uploadDir);
      } catch {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }
      
      const uniqueFilename = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, uniqueFilename);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // ใช้ sharp เพื่อบีบอัดไฟล์
      let compressedBuffer = await sharp(buffer)
        .jpeg({ quality: 80 }) // ลด quality เหลือ 80% (ปรับได้)
        .toBuffer();
      
      // เช็คขนาด ถ้ายังเกิน 2MB ให้ลด quality ลงอีก
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      while (compressedBuffer.length > maxSize) {
        compressedBuffer = await sharp(compressedBuffer)
          .jpeg({ quality: 70 }) // ลดคุณภาพลงอีก
          .toBuffer();
      }
      
      // เซฟไฟล์
      await writeFile(filePath, compressedBuffer);
  
  return uniqueFilename; 
}
// export async function uploadExcel(formData: FormData) {
//   const file = formData.get("excel") as File;
//   if (!file || file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
//     return { error: "กรุณาอัปโหลดไฟล์ .xlsx เท่านั้น" };
//   }

//   const XLSX = await import("xlsx");
//   const buffer = Buffer.from(await file.arrayBuffer());
//   const workbook = XLSX.read(buffer, { type: "buffer" });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const jsonData = XLSX.utils.sheet_to_json(sheet);

//   if (jsonData.length === 0) {
//     return { error: "ไม่พบข้อมูลในไฟล์" };
//   }

//   const requiredFields = ["name", "price"];
//   const hasMissing = jsonData.some((row: any) =>
//     requiredFields.some((f) => !(f in row))
//   );
//   if (hasMissing) {
//     return { error: "ข้อมูลบางแถวขาดคอลัมน์ name หรือ price" };
//   }
// }