/**
 * Script: ลบข้อมูล demo + ลบแผนกเก่า + นำเข้านักศึกษาจาก Excel
 * Run: npx tsx prisma/import-students-from-excel.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();
const DOWNLOADS = "/Users/shellclub/Downloads";

// ไฟล์ Excel ที่ต้อง import (เวอร์ชันล่าสุด)
const EXCEL_FILES = [
  { file: "ปวช2ธุรกิจค้าปลีก.xlsx", department: "แผนกวิชาธุรกิจค้าปลีก", educationLevel: "ปวช." },
  { file: "ปวส1-2เทคโนโลยีธุรกิจดิจิทัล (1).xlsx", department: "แผนกวิชาคอมพิวเตอร์ธุรกิจและเทคโนโลยีธุรกิจดิจิทัล", educationLevel: "ปวส." },
  { file: "ปวส1การจัดการธุรกิจค้าปลีก (1).xlsx", department: "แผนกวิชาธุรกิจค้าปลีก", educationLevel: "ปวส." },
  { file: "ปวส1การตลาด (1).xlsx", department: "แผนกวิชาการตลาด", educationLevel: "ปวส." },
  { file: "ปวส1การท่องเที่ยว (1).xlsx", department: "แผนกวิชาการท่องเที่ยว", educationLevel: "ปวส." },
  { file: "ปวส1การโรงแรม (2).xlsx", department: "แผนกวิชาการโรงแรม", educationLevel: "ปวส." },
  { file: "ปวส1อาหารและโภชนาการ.xlsx", department: "แผนกวิชาอาหารและโภชนาการ", educationLevel: "ปวส." },
];

// แผนกเก่าที่ต้องลบ
const OLD_DEPARTMENTS_TO_DELETE = ["แผนกเทคโนโลยีสารสนเทศ", "แผนกช่างไฟฟ้า", "แผนกการบัญชี"];

// ─── Thai date parser ───
const THAI_MONTHS: Record<string, number> = {
  "ม.ค.": 1, "มค": 1, "ก.พ.": 2, "กพ": 2, "มี.ค.": 3, "มีค": 3,
  "เม.ย.": 4, "เมย": 4, "พ.ค.": 5, "พค": 5, "มิ.ย.": 6, "มิย": 6,
  "ก.ค.": 7, "กค": 7, "ส.ค.": 8, "สค": 8, "ก.ย.": 9, "กย": 9,
  "ต.ค.": 10, "ตค": 10, "พ.ย.": 11, "พย": 11, "ธ.ค.": 12, "ธค": 12,
};

function parseThaiDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  // รูปแบบ: "01 เม.ย. 50" หรือ "12 พ.ย. 49"
  const match = trimmed.match(/^(\d{1,2})\s+(\S+)\s+(\d{2,4})$/);
  if (!match) return null;

  const day = parseInt(match[1]);
  const monthStr = match[2];
  const yearBE = parseInt(match[3]);

  const month = THAI_MONTHS[monthStr];
  if (!month) return null;

  // แปลง ปี พ.ศ. 2 หลัก → ค.ศ.
  // ปี 50 = 2550 - 543 = 2007, ปี 49 = 2549 - 543 = 2006
  let yearCE: number;
  if (yearBE < 100) {
    yearCE = yearBE + 2500 - 543; // 50 → 2007
  } else {
    yearCE = yearBE - 543;
  }

  return new Date(yearCE, month - 1, day);
}

// รหัสผ่าน = วันเกิด ddmmyyyy (พ.ศ.)
function birthdayToPassword(birthday: Date): string {
  const day = String(birthday.getDate()).padStart(2, "0");
  const month = String(birthday.getMonth() + 1).padStart(2, "0");
  const yearBE = birthday.getFullYear() + 543;
  return `${day}${month}${yearBE}`;
}

// แปลงกลุ่มเรียน → ข้อมูลที่ต้องการ
function parseGroup(groupStr: string) {
  // "ปวส.1/1" → educationLevel=ปวส., gradeLevel=ปวส.1, room=1
  // "ปวช.2/1" → educationLevel=ปวช., gradeLevel=ปวช.2, room=1
  const match = groupStr.match(/(ปว[ชส])\.(\d+)\/(\d+)/);
  if (!match) return { gradeLevel: groupStr, room: "1" };
  return {
    gradeLevel: `${match[1]}.${match[2]}`,
    room: match[3],
  };
}

// แปลงคำนำหน้า
function normalizePrefix(prefix: string): string {
  const p = prefix.trim();
  if (p === "นาย") return "นาย";
  if (p === "น.ส." || p === "นางสาว" || p === "น.ส") return "นางสาว";
  if (p === "นาง") return "นาง";
  return p;
}

// sex จาก prefix
function sexFromPrefix(prefix: string): number {
  if (prefix === "นาย") return 1;
  return 2;
}

async function main() {
  console.log("═".repeat(70));
  console.log("📋 เริ่มกระบวนการ: ลบ demo → ลบแผนกเก่า → นำเข้านักศึกษาจาก Excel");
  console.log("═".repeat(70));

  // ════════════════════════════════════════════
  // STEP 1: ลบข้อมูล demo เก่าทั้งหมด
  // ════════════════════════════════════════════
  console.log("\n🗑️  STEP 1: ลบข้อมูล demo เก่า...");

  // ลบ supervisions ก่อน (FK)
  const delSupervisions = await prisma.supervision.deleteMany({});
  console.log(`  - ลบข้อมูลการนิเทศ: ${delSupervisions.count} รายการ`);

  // ลบ student_companies
  const delStudentCompanies = await prisma.studentCompanies.deleteMany({});
  console.log(`  - ลบข้อมูลการจับคู่นศ.-สถานประกอบการ: ${delStudentCompanies.count} รายการ`);

  // ลบ teacher_classrooms
  const delTeacherClassrooms = await prisma.teacherClassroom.deleteMany({});
  console.log(`  - ลบข้อมูลครูดูแลนศ.: ${delTeacherClassrooms.count} รายการ`);

  // ลบ inturnship
  const delInturnship = await prisma.inturnship.deleteMany({});
  console.log(`  - ลบข้อมูลฝึกงาน: ${delInturnship.count} รายการ`);

  // ลบ internship_report
  const delReports = await prisma.internshipReport.deleteMany({});
  console.log(`  - ลบรายงานฝึกงาน: ${delReports.count} รายการ`);

  // ลบ students (จะ cascade delete user ผ่าน manual cleanup)
  const allStudents = await prisma.student.findMany({ select: { userId: true } });
  const studentUserIds = allStudents.map(s => s.userId);

  const delStudents = await prisma.student.deleteMany({});
  console.log(`  - ลบนักศึกษา: ${delStudents.count} รายการ`);

  // ลบ users ที่เป็นนักศึกษา (role=7)
  if (studentUserIds.length > 0) {
    // ลบ login ของ students ก่อน
    await prisma.login.deleteMany({ where: { userId: { in: studentUserIds } } });
    const delUsers = await prisma.user.deleteMany({ where: { id: { in: studentUserIds } } });
    console.log(`  - ลบ user นักศึกษา: ${delUsers.count} รายการ`);
  }

  // ลบ teachers (demo)
  const allTeachers = await prisma.teacher.findMany({ select: { userId: true } });
  const teacherUserIds = allTeachers.map(t => t.userId);

  const delTeachers = await prisma.teacher.deleteMany({});
  console.log(`  - ลบครู: ${delTeachers.count} รายการ`);

  if (teacherUserIds.length > 0) {
    await prisma.login.deleteMany({ where: { userId: { in: teacherUserIds } } });
    const delTeacherUsers = await prisma.user.deleteMany({ where: { id: { in: teacherUserIds } } });
    console.log(`  - ลบ user ครู: ${delTeacherUsers.count} รายการ`);
  }

  // ลบ companies (demo)
  const allCompanies = await prisma.companies.findMany({ select: { userId: true } });
  const companyUserIds = allCompanies.map(c => c.userId);

  const delCompanies = await prisma.companies.deleteMany({});
  console.log(`  - ลบสถานประกอบการ: ${delCompanies.count} รายการ`);

  if (companyUserIds.length > 0) {
    await prisma.login.deleteMany({ where: { userId: { in: companyUserIds } } });
    const delCompanyUsers = await prisma.user.deleteMany({ where: { id: { in: companyUserIds } } });
    console.log(`  - ลบ user สถานประกอบการ: ${delCompanyUsers.count} รายการ`);
  }

  // ════════════════════════════════════════════
  // STEP 2: ลบแผนกเก่า + สาขาวิชาที่เกี่ยวข้อง
  // ════════════════════════════════════════════
  console.log("\n🗑️  STEP 2: ลบแผนกเก่า (ไฟฟ้า, สารสนเทศ, การบัญชีเก่า)...");

  for (const depName of OLD_DEPARTMENTS_TO_DELETE) {
    const dept = await prisma.department.findFirst({ where: { depname: depName } });
    if (!dept) {
      console.log(`  ⏭️  ไม่พบ "${depName}" (อาจลบไปแล้ว)`);
      continue;
    }

    // ลบ major ภายใต้แผนก
    const delMajors = await prisma.major.deleteMany({ where: { departmentId: dept.id } });
    console.log(`  - ลบสาขาวิชาใน "${depName}": ${delMajors.count} สาขา`);

    // ลบแผนก
    await prisma.department.delete({ where: { id: dept.id } });
    console.log(`  ✅ ลบแผนก "${depName}" สำเร็จ`);
  }

  // ════════════════════════════════════════════
  // STEP 3: เตรียม prerequisites
  // ════════════════════════════════════════════
  console.log("\n⚙️  STEP 3: เตรียมข้อมูลพื้นฐาน...");

  // Education levels
  const eduPvc = await prisma.education_levels.upsert({
    where: { name: "ปวช." },
    update: {},
    create: { name: "ปวช." },
  });
  const eduPvs = await prisma.education_levels.upsert({
    where: { name: "ปวส." },
    update: {},
    create: { name: "ปวส." },
  });
  console.log(`  ✅ ระดับการศึกษา: ปวช.(id=${eduPvc.id}), ปวส.(id=${eduPvs.id})`);

  // Cache departments
  const deptCache: Record<string, number> = {};
  const allDepts = await prisma.department.findMany();
  for (const d of allDepts) deptCache[d.depname] = d.id;
  console.log(`  ✅ แผนกวิชา: ${allDepts.length} แผนก`);

  // ════════════════════════════════════════════
  // STEP 4: นำเข้านักศึกษาจาก Excel
  // ════════════════════════════════════════════
  console.log("\n📥 STEP 4: นำเข้านักศึกษาจาก Excel...");

  let totalImported = 0;
  let totalSkipped = 0;
  const defaultPasswordHash = await bcrypt.hash("123456", 10);

  for (const excelConfig of EXCEL_FILES) {
    const filePath = path.join(DOWNLOADS, excelConfig.file);
    console.log(`\n  📁 ${excelConfig.file}`);
    console.log(`     แผนก: ${excelConfig.department}`);

    // หา departmentId
    const deptId = deptCache[excelConfig.department];
    if (!deptId) {
      console.log(`     ❌ ไม่พบแผนก "${excelConfig.department}" ในระบบ → ข้าม!`);
      continue;
    }

    // หา educationLevel
    const eduId = excelConfig.educationLevel === "ปวช." ? eduPvc.id : eduPvs.id;

    // อ่าน Excel
    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.readFile(filePath);
    } catch (err: any) {
      console.log(`     ❌ อ่านไฟล์ไม่ได้: ${err.message}`);
      continue;
    }

    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

    // หา header row (row ที่มี "ลำดับ")
    let headerIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      if (rows[i] && rows[i].some((c: any) => String(c).includes("ลำดับ"))) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) {
      console.log(`     ❌ ไม่พบ header row → ข้าม!`);
      continue;
    }

    let fileImported = 0;
    let fileSkipped = 0;

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0] || row[0] === "") continue;

      const citizenId = String(row[1]).trim();
      const studentId = String(row[2]).trim();
      const groupName = String(row[4]).trim(); // "ปวส.1/1"
      const prefix = String(row[5]).trim();
      const firstname = String(row[6]).trim();
      const lastname = String(row[7]).trim();
      const birthdayStr = String(row[8]).trim();

      // Validate
      if (!citizenId || !studentId || !firstname || !lastname) {
        fileSkipped++;
        continue;
      }

      // Check if already exists
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ citizenId }] },
      });
      if (existingUser) {
        fileSkipped++;
        continue;
      }

      // Parse data
      const birthday = parseThaiDate(birthdayStr);
      const normalizedPrefix = normalizePrefix(prefix);
      const sex = sexFromPrefix(normalizedPrefix);
      const { gradeLevel, room } = parseGroup(groupName);

      // สร้าง password = วันเกิด ddmmyyyy (พ.ศ.) ถ้ามี, ไม่งั้นใช้ 123456
      let passwordRaw = "123456";
      let passwordHash = defaultPasswordHash;
      if (birthday) {
        passwordRaw = birthdayToPassword(birthday);
        passwordHash = await bcrypt.hash(passwordRaw, 10);
      }

      try {
        // Create User
        const user = await prisma.user.create({
          data: {
            prefix: normalizedPrefix,
            firstname,
            lastname,
            citizenId,
            phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`, // placeholder phone
            role: 7,
            sex,
            birthday,
          },
        });

        // Create Login
        await prisma.login.create({
          data: {
            username: studentId,
            password: passwordHash,
            userId: user.id,
            is_first_login: true,
          },
        });

        // Create Student
        await prisma.student.create({
          data: {
            studentId,
            userId: user.id,
            educationLevel: eduId,
            academicYear: "2568",
            term: "1",
            room,
            departmentId: deptId,
            gradeLevel,
            curriculum: "ทวิภาคี",
          },
        });

        fileImported++;
      } catch (err: any) {
        console.log(`     ⚠️ ข้าม ${firstname} ${lastname}: ${err.message?.substring(0, 80)}`);
        fileSkipped++;
      }
    }

    console.log(`     ✅ นำเข้า: ${fileImported} คน, ข้าม: ${fileSkipped} คน`);
    totalImported += fileImported;
    totalSkipped += fileSkipped;
  }

  // ════════════════════════════════════════════
  // STEP 5: สรุปผล
  // ════════════════════════════════════════════
  const finalStudents = await prisma.student.count();
  const finalDepts = await prisma.department.findMany({ orderBy: { id: "asc" } });
  const finalUsers = await prisma.user.count();

  console.log("\n" + "═".repeat(70));
  console.log("🎉 เสร็จสิ้น!");
  console.log("═".repeat(70));
  console.log(`\n📊 สรุป:`);
  console.log(`  - นำเข้านักศึกษาใหม่: ${totalImported} คน`);
  console.log(`  - ข้าม (ซ้ำ/ไม่ครบ): ${totalSkipped} คน`);
  console.log(`  - นักศึกษาในระบบ: ${finalStudents} คน`);
  console.log(`  - ผู้ใช้ทั้งหมด: ${finalUsers} คน`);

  console.log(`\n📋 แผนกวิชาในระบบ (${finalDepts.length} แผนก):`);
  for (const d of finalDepts) {
    const studentCount = await prisma.student.count({ where: { departmentId: d.id } });
    console.log(`  ${String(d.id).padStart(2)}. ${d.depname} (${studentCount} นศ.)`);
  }

  console.log(`\n🔑 ข้อมูลเข้าสู่ระบบ:`);
  console.log(`  - Username: รหัสประจำตัวนักศึกษา (เช่น 68319100016)`);
  console.log(`  - Password: วันเดือนปีเกิด พ.ศ. (เช่น 01042550)`);
  console.log(`  - is_first_login: true → ต้องเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
