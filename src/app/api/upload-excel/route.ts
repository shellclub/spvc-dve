import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { prisma } from "@/lib/db";
import { excelSerialToDate } from "@/lib/utils";
import { formatThaiDateFixed } from "@/lib/thaiDateConvert";
import bcrypt from "bcryptjs";

interface ExcelRow {
  firstname: string;
  lastname: string;
  citizenId: string;
  phone: string;
  sex: number;
  birthday: string;
  dep_name: number;
  username?: string;
  password?: string;
  studentId: string;
  educationlevel: number;
  major: string;
  academicyear: string;
  user_img: string;
  room: string;
  term: string;
  gradelevel: string;
}

const columnHeaderMap: Record<string, string> = {
  "ชื่อ": "firstname",
  "นามสกุล": "lastname",
  "เลขบัตรประชาชน": "citizenId",
  "เบอร์โทร": "phone",
  "เพศ": "sex",
  "วันเกิด": "birthday",
  "แผนก": "dep_name",
  "รูปภาพ": "user_img",
  "รหัสนักศึกษา": "studentId",
  "ระดับการศึกษา": "educationlevel",
  "สาขา": "major",
  "ปีการศึกษา": "academicyear",
  "ชั้นปี": "gradelevel",
  "ห้อง": "room",
  "ภาคเรียน": "term"
};

const requiredUserFields = [
  "firstname", "lastname", "citizenId", "phone", "sex",
  "birthday", "dep_name"
];

const requiredStudentFields = [
  "studentId", "educationlevel", "major","dep_name", "academicyear", "gradelevel","term","room"
];

// Validation functions
function validateCitizenId(citizenId: string): boolean {
  // Thai citizen ID validation (13 digits with checksum)
  if (!/^\d{13}$/.test(citizenId)) return false;
  
  const digits = citizenId.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * (13 - index), 0);
  const checksum = (11 - (sum % 11)) % 10;
  
  return checksum === digits[12];
}

function validatePhone(phone: string): boolean {
  // Thai phone number validation
  return /^[0-9]{10}$/.test(phone.replace(/[-\s]/g, ''));
}

function sanitizeData(data: any): any {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("excel") as File;

    // File validation
    if (!file) {
      return NextResponse.json({ 
        error: "กรุณาเลือกไฟล์สำหรับอัปโหลด", 
        type: "error" 
      }, { status: 400 });
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ 
        error: "กรุณาอัปโหลดไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น", 
        type: "error" 
      }, { status: 400 });
    }

    // File size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)", 
        type: "error" 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    
    if (!workbook.SheetNames.length) {
      return NextResponse.json({ 
        error: "ไม่พบแผ่นงานในไฟล์ Excel", 
        type: "error" 
      }, { status: 400 });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

    if (!rawRows.length) {
      return NextResponse.json({ 
        error: "ไม่พบข้อมูลในไฟล์", 
        type: "error" 
      }, { status: 400 });
    }

    // Separate header row and data rows
    const [headerRow, ...dataRows] = rawRows;
    
    if (!headerRow || headerRow.length === 0) {
      return NextResponse.json({ 
        error: "ไม่พบหัวคอลัมน์ในไฟล์", 
        type: "error" 
      }, { status: 400 });
    }

    // Map headers and validate
    const headers = headerRow.map((h: string) => {
      const trimmed = h?.toString().trim();
      return columnHeaderMap[trimmed] || null;
    });
    
    // Check for required columns
    const allRequiredFields = [...requiredUserFields, ...requiredStudentFields];
    const missingHeaders = allRequiredFields.filter(field => !headers.includes(field));
    
    if (missingHeaders.length > 0) {
      const thaiHeaders = Object.keys(columnHeaderMap).filter(thaiKey => 
        missingHeaders.includes(columnHeaderMap[thaiKey])
      );
      
      return NextResponse.json({
        error: `คอลัมน์ที่ขาดหายไป: ${thaiHeaders.join(", ")}`,
        type: "error"
      }, { status: 400 });
    }

    // Process data rows
    const processedData: ExcelRow[] = [];
    const errors: string[] = [];
    
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      const mapped: Record<string, any> = {};
      
      // Map row data to field names
      headers.forEach((key: string | null, colIndex: number) => {
        if (key && row[colIndex] !== undefined && row[colIndex] !== null) {
          mapped[key] = row[colIndex];
        }
      });
      
      // Skip empty rows
      if (Object.keys(mapped).length === 0) continue;
      
      // Sanitize data
      const sanitized = sanitizeData(mapped);
      
      // Validate required fields
      const missingFields = allRequiredFields.filter(field => !sanitized[field]);
      if (missingFields.length > 0) {
        errors.push(`แถว ${rowIndex + 2}: ข้อมูลที่ขาดหายไป - ${missingFields.join(", ")}`);
        continue;
      }
      
      // Validate citizen ID
      if (!validateCitizenId(sanitized.citizenId)) {
        errors.push(`แถว ${rowIndex + 2}: เลขบัตรประชาชนไม่ถูกต้อง`);
        continue;
      }
      
      // Validate phone number
      if (!validatePhone(sanitized.phone)) {
        errors.push(`แถว ${rowIndex + 2}: เบอร์โทรศัพท์ไม่ถูกต้อง`);
        continue;
      }

      if(sanitized.sex === 'ชาย'){
        sanitized.sex = 1;
      } else if(sanitized.sex === 'หญิง'){
        sanitized.sex = 2;
      }
      // Validate sex (1 = male, 2 = female)
      if (![1, 2].includes(Number(sanitized.sex))) {
        errors.push(`แถว ${rowIndex + 2}: เพศต้องเป็น ชาย หรือ หญิง`);
        continue;
      }

      
      
      processedData.push(sanitized as ExcelRow);
    }
    
    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json({
        error: errors.slice(0, 10),
        type: "error"
      }, { status: 400 });
    }
    
    if (processedData.length === 0) {
      return NextResponse.json({
        error: "ไม่พบข้อมูลที่ถูกต้องสำหรับนำเข้า",
        type: "error"
      }, { status: 400 });
    }

    // Process data in batches using transaction
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      await prisma.$transaction(async (tx) => {
        for (const row of batch) {
          try {
            // Check if user already exists
            const existingUser = await tx.user.findUnique({
              where: { citizenId: String(row.citizenId) }
            });
            
            if (existingUser) {
              skippedCount++;
              continue;
            }
            
            // Check if student ID already exists
            const existingStudent = await tx.student.findUnique({
              where: { studentId: String(row.studentId) }
            });
            
            if (existingStudent) {
              skippedCount++;
              continue;
            }
            
            // Parse birthday
            let birthday: Date;
            try {
              if (typeof row.birthday === 'number') {
                // ส่วนนี้จัดการ Excel Serial Date (น่าจะคืนค่าเป็น ค.ศ. อยู่แล้ว)
                birthday = new Date(excelSerialToDate(row.birthday));
              } else {
                // ส่วนนี้สำหรับข้อความ (เช่น "10/05/2540")
                const tempDate = dayjs(row.birthday);
          
                // ตรวจสอบว่าวันที่ถูกต้อง และปีที่ได้มีค่าสูง (น่าจะเป็น พ.ศ.)
                if (tempDate.isValid() && tempDate.year() > 2400) {
                  // ถ้าใช่ ให้ลบ 543 ปี เพื่อแปลงเป็น ค.ศ.
                  birthday = tempDate.subtract(543, 'year').toDate();
                } else {
                  // ถ้าไม่ใช่ (เป็น ค.ศ. อยู่แล้ว หรือ format ผิด)
                  birthday = tempDate.toDate();
                }
              }
          
              // (เพิ่มการตรวจสอบ Invalid Date หลังการแปลงค่า)
              if (isNaN(birthday.getTime())) {
                throw new Error("Invalid date after processing");
              }
          
            } catch (error) {
              console.error(`Invalid birthday format for student ${row.studentId}:`, row.birthday);
              errorCount++;
              continue;
            }
            
            // Create user with student
            await tx.user.create({
              data: {
                firstname: String(row.firstname),
                lastname: String(row.lastname),
                citizenId: String(row.citizenId),
                phone: String(row.phone).replace(/[-\s]/g, ''),
                sex: Number(row.sex),
                birthday: birthday,
                role: 7, // Student role
                user_img: String(row.user_img || 'avatar.jpg'),
                student: {
                  create: {
                    studentId: String(row.studentId),
                    education: { 
                      connect: { name: String(row.educationlevel) } 
                    },
                    major: { 
                      connect: { major_name: String(row.major) } 
                    },
                    academicYear: String(row.academicyear),
                    department: {
                      connect: { depname: String(row.dep_name) }
                    },
                    room: String(row.room || ''),
                    term: String(row.term || ''),
                    gradeLevel: String(row.gradelevel),
                  }
                },
                login: {
                  create: {
                    username: row.citizenId,
                    password: bcrypt.hashSync(formatThaiDateFixed(row.birthday), 10),
                  }
                }
              }
            });
            
            createdCount++;
            
          } catch (error) {
            console.error(`Error creating user for student ${row.studentId}:`, error);
            errorCount++;
          }
        }
      });
    }

    return NextResponse.json({ 
      message: `นำเข้าข้อมูลสำเร็จ! สร้างใหม่: ${createdCount} รายการ, ข้าม: ${skippedCount} รายการ${errorCount > 0 ? `, ข้อผิดพลาด: ${errorCount} รายการ` : ''}`,
      type: "success",
      stats: {
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount,
        total: processedData.length
      }
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ 
      error: "เกิดข้อผิดพลาดขณะประมวลผล กรุณาลองใหม่อีกครั้ง", 
      type: "error" 
    }, { status: 500 });
  }
}