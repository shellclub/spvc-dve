/**
 * Seed script: Create 5 test students with reports
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-students.ts
 * Or: npx tsx prisma/seed-students.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STUDENTS = [
  { firstname: "สมชาย", lastname: "ใจดี", phone: "0900000001", citizenId: "1100100100001", studentId: "66201001", sex: 1 },
  { firstname: "สมหญิง", lastname: "แก้วมณี", phone: "0900000002", citizenId: "1100100100002", studentId: "66201002", sex: 2 },
  { firstname: "ธนากร", lastname: "สุขสันต์", phone: "0900000003", citizenId: "1100100100003", studentId: "66201003", sex: 1 },
  { firstname: "พิมพา", lastname: "รุ่งเรือง", phone: "0900000004", citizenId: "1100100100004", studentId: "66201004", sex: 2 },
  { firstname: "วีรภัทร", lastname: "มั่นคง", phone: "0900000005", citizenId: "1100100100005", studentId: "66201005", sex: 1 },
];

async function main() {
  console.log("🌱 Seeding 5 test students...");

  // Get or create prerequisites
  let dept = await prisma.department.findFirst();
  if (!dept) {
    dept = await prisma.department.create({ data: { depname: "แผนกเทคโนโลยีสารสนเทศ" } });
    console.log("  ✅ Created department:", dept.depname);
  }

  let major = await prisma.major.findFirst({ where: { departmentId: dept.id } });
  if (!major) {
    major = await prisma.major.create({ data: { major_name: "สาขาเทคโนโลยีสารสนเทศ", departmentId: dept.id } });
    console.log("  ✅ Created major:", major.major_name);
  }

  let edu = await prisma.education_levels.findFirst();
  if (!edu) {
    edu = await prisma.education_levels.create({ data: { name: "ปวส." } });
    console.log("  ✅ Created education level:", edu.name);
  }

  const password = await bcrypt.hash("1234", 10);

  for (const s of STUDENTS) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ citizenId: s.citizenId }, { phone: s.phone }] },
    });
    if (existingUser) {
      console.log(`  ⏭️ Skipping ${s.firstname} ${s.lastname} (already exists)`);
      continue;
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        prefix: s.sex === 1 ? "นาย" : "นางสาว",
        firstname: s.firstname,
        lastname: s.lastname,
        citizenId: s.citizenId,
        phone: s.phone,
        role: 7, // student role
        sex: s.sex,
      },
    });

    // Create Login
    await prisma.login.create({
      data: {
        username: s.studentId,
        password,
        userId: user.id,
        is_first_login: false,
      },
    });

    // Create Student
    const student = await prisma.student.create({
      data: {
        studentId: s.studentId,
        userId: user.id,
        educationLevel: edu.id,
        major_id: major.id,
        academicYear: "2568",
        term: "1",
        room: "1",
        departmentId: dept.id,
        gradeLevel: "ปวส.2",
        curriculum: "ปกติ",
      },
    });

    // Create Inturnship record (Mon-Fri)
    await prisma.inturnship.create({
      data: {
        studentId: student.id,
        selectedDays: ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"],
        dayperweeks: "5",
      },
    });

    // Create sample reports (5 reports per student)
    const reportBase = new Date(2026, 1, 1); // Feb 2026
    for (let i = 0; i < 5; i++) {
      const d = new Date(reportBase);
      d.setDate(d.getDate() + i * 2 + Math.floor(Math.random() * 2)); // spread out
      
      await prisma.internshipReport.create({
        data: {
          studentId: student.id,
          title: `งานวันที่ ${i + 1}: ${["ลงข้อมูลระบบ", "ตรวจเช็คสินค้า", "จัดเอกสาร", "ประชุมทีม", "สรุปรายงาน"][i]}`,
          description: `รายละเอียดงาน ${["บันทึกข้อมูลลูกค้าลงระบบ ERP", "ตรวจนับสินค้าคงคลังประจำสัปดาห์", "จัดเรียงเอกสารใบสั่งซื้อ", "ประชุมสรุปแผนงานประจำสัปดาห์กับทีม", "สรุปรายงานยอดขายประจำเดือน"][i]}`,
          reportDate: d,
        },
      });
    }

    console.log(`  ✅ ${s.firstname} ${s.lastname} (username: ${s.studentId}, password: 1234)`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("📝 Login credentials: username = studentId, password = 1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
