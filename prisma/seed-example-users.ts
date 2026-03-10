/**
 * Seed script: สร้างข้อมูลตัวอย่าง username/password สำหรับครูและนักศึกษา
 * 
 * นักศึกษา:
 *   - username: รหัสนักศึกษา 11 หลัก (เช่น 68201010001)
 *   - password: วันเดือนปีเกิดภาษาไทย (เช่น เกิด 10 เม.ย. 2560 → 10042560)
 * 
 * ครู:
 *   - username: ชื่อผู้ใช้
 *   - password: เบอร์โทรศัพท์มือถือ
 * 
 * ทั้งสอง user: is_first_login = true → บังคับเปลี่ยนรหัสผ่านเมื่อเข้าระบบครั้งแรก
 * 
 * Run: npx tsx prisma/seed-example-users.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// =====================================================
// ข้อมูลนักศึกษาตัวอย่าง
// =====================================================
const STUDENTS = [
  {
    prefix: "นาย",
    firstname: "ธนวัฒน์",
    lastname: "สุขใจ",
    phone: "0812345001",
    citizenId: "1100700100001",
    studentId: "68201010001",      // username (รหัสนักศึกษา 11 หลัก)
    password: "10042560",           // วันเดือนปีเกิด: 10 เมษายน 2560
    birthday: new Date("2017-04-10"),
    sex: 1,
    gradeLevel: "ปวช.1",
  },
  {
    prefix: "นางสาว",
    firstname: "สุภาพร",
    lastname: "แก้วมณี",
    phone: "0812345002",
    citizenId: "1100700100002",
    studentId: "68201010002",
    password: "25122559",           // วันเดือนปีเกิด: 25 ธันวาคม 2559
    birthday: new Date("2016-12-25"),
    sex: 2,
    gradeLevel: "ปวช.1",
  },
  {
    prefix: "นาย",
    firstname: "พีรพัฒน์",
    lastname: "มั่นคง",
    phone: "0812345003",
    citizenId: "1100700100003",
    studentId: "68201010003",
    password: "01012560",           // วันเดือนปีเกิด: 1 มกราคม 2560
    birthday: new Date("2017-01-01"),
    sex: 1,
    gradeLevel: "ปวช.1",
  },
  {
    prefix: "นางสาว",
    firstname: "ปิยะดา",
    lastname: "รุ่งเรือง",
    phone: "0812345004",
    citizenId: "1100700100004",
    studentId: "68201010004",
    password: "15082560",           // วันเดือนปีเกิด: 15 สิงหาคม 2560
    birthday: new Date("2017-08-15"),
    sex: 2,
    gradeLevel: "ปวช.1",
  },
  {
    prefix: "นาย",
    firstname: "วรเมธ",
    lastname: "ศรีสว่าง",
    phone: "0812345005",
    citizenId: "1100700100005",
    studentId: "68201010005",
    password: "30062559",           // วันเดือนปีเกิด: 30 มิถุนายน 2559
    birthday: new Date("2016-06-30"),
    sex: 1,
    gradeLevel: "ปวช.1",
  },
];

// =====================================================
// ข้อมูลครูตัวอย่าง
// =====================================================
const TEACHERS = [
  {
    prefix: "อาจารย์",
    firstname: "สมศักดิ์",
    lastname: "ใจดี",
    phone: "0891234567",            // เป็นทั้ง password
    citizenId: "3100501234567",
    username: "somsak.j",           // username ของครู
    sex: 1,
  },
  {
    prefix: "อาจารย์",
    firstname: "วิภาวดี",
    lastname: "สุขสันต์",
    phone: "0867654321",
    citizenId: "3100501234568",
    username: "wipawadee.s",
    sex: 2,
  },
  {
    prefix: "อาจารย์",
    firstname: "ประสิทธิ์",
    lastname: "เจริญสุข",
    phone: "0923456789",
    citizenId: "3100501234569",
    username: "prasit.c",
    sex: 1,
  },
];

async function main() {
  console.log("🌱 เริ่มสร้างข้อมูลตัวอย่าง ครู & นักศึกษา...\n");

  // ==============================
  // 1. เตรียม Prerequisites
  // ==============================
  let dept = await prisma.department.findFirst();
  if (!dept) {
    dept = await prisma.department.create({ data: { depname: "แผนกเทคโนโลยีสารสนเทศ" } });
    console.log("  ✅ สร้างแผนก:", dept.depname);
  }

  let major = await prisma.major.findFirst({ where: { departmentId: dept.id } });
  if (!major) {
    major = await prisma.major.create({ data: { major_name: "สาขาเทคโนโลยีสารสนเทศ", departmentId: dept.id } });
    console.log("  ✅ สร้างสาขา:", major.major_name);
  }

  let edu = await prisma.education_levels.findFirst();
  if (!edu) {
    edu = await prisma.education_levels.create({ data: { name: "ปวช." } });
    console.log("  ✅ สร้างระดับการศึกษา:", edu.name);
  }

  // ==============================
  // 2. สร้างนักศึกษา (role 7)
  // ==============================
  console.log("\n📚 สร้างข้อมูลนักศึกษา...");
  console.log("─".repeat(70));

  for (const s of STUDENTS) {
    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ citizenId: s.citizenId }, { phone: s.phone }] },
    });
    if (existingUser) {
      console.log(`  ⏭️  ข้าม ${s.firstname} ${s.lastname} (มีอยู่ในระบบแล้ว)`);
      continue;
    }

    // Hash password (วันเดือนปีเกิด)
    const hashedPassword = await bcrypt.hash(s.password, 10);

    // สร้าง User
    const user = await prisma.user.create({
      data: {
        prefix: s.prefix,
        firstname: s.firstname,
        lastname: s.lastname,
        citizenId: s.citizenId,
        phone: s.phone,
        role: 7, // นักศึกษา
        sex: s.sex,
        birthday: s.birthday,
        login: {
          create: {
            username: s.studentId,   // รหัสนักศึกษา 11 หลัก
            password: hashedPassword,
            is_first_login: true,    // ⚠️ บังคับเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก
          },
        },
      },
    });

    // สร้างข้อมูล Student
    await prisma.student.create({
      data: {
        studentId: s.studentId,
        userId: user.id,
        educationLevel: edu.id,
        major_id: major.id,
        academicYear: "2568",
        term: "1",
        room: "1",
        departmentId: dept.id,
        gradeLevel: s.gradeLevel,
        curriculum: "ปกติ",
      },
    });

    console.log(`  ✅ ${s.prefix}${s.firstname} ${s.lastname}`);
    console.log(`     📌 Username: ${s.studentId}  |  🔑 Password: ${s.password} (วัน/เดือน/ปีเกิด)`);
    console.log(`     ⚠️  is_first_login: true → ต้องเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก`);
  }

  // ==============================
  // 3. สร้างครู (role 4)
  // ==============================
  console.log("\n👨‍🏫 สร้างข้อมูลครู...");
  console.log("─".repeat(70));

  for (const t of TEACHERS) {
    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ citizenId: t.citizenId }, { phone: t.phone }] },
    });
    if (existingUser) {
      console.log(`  ⏭️  ข้าม ${t.firstname} ${t.lastname} (มีอยู่ในระบบแล้ว)`);
      continue;
    }

    // Hash password (เบอร์โทรศัพท์)
    const hashedPassword = await bcrypt.hash(t.phone, 10);

    // สร้าง User
    const user = await prisma.user.create({
      data: {
        prefix: t.prefix,
        firstname: t.firstname,
        lastname: t.lastname,
        citizenId: t.citizenId,
        phone: t.phone,
        role: 4, // ครู
        sex: t.sex,
        login: {
          create: {
            username: t.username,     // ชื่อผู้ใช้ของครู
            password: hashedPassword,
            is_first_login: true,     // ⚠️ บังคับเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก
          },
        },
      },
    });

    // สร้างข้อมูล Teacher
    await prisma.teacher.create({
      data: {
        userId: user.id,
        departmentId: dept.id,
        majorId: major.id,
      },
    });

    console.log(`  ✅ ${t.prefix}${t.firstname} ${t.lastname}`);
    console.log(`     📌 Username: ${t.username}  |  🔑 Password: ${t.phone} (เบอร์โทรศัพท์)`);
    console.log(`     ⚠️  is_first_login: true → ต้องเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก`);
  }

  // ==============================
  // สรุปผล
  // ==============================
  console.log("\n" + "═".repeat(70));
  console.log("🎉 สร้างข้อมูลตัวอย่างสำเร็จ!");
  console.log("═".repeat(70));
  
  console.log("\n📋 สรุปข้อมูล Login ทั้งหมด:");
  console.log("─".repeat(70));
  
  console.log("\n👨‍🎓 นักศึกษา (role 7):");
  console.log("┌─────────────────────┬───────────────┬───────────────────────────────┐");
  console.log("│ Username (รหัส นศ.) │ Password      │ ชื่อ-นามสกุล                  │");
  console.log("├─────────────────────┼───────────────┼───────────────────────────────┤");
  for (const s of STUDENTS) {
    console.log(`│ ${s.studentId.padEnd(19)} │ ${s.password.padEnd(13)} │ ${(s.prefix + s.firstname + " " + s.lastname).padEnd(29)} │`);
  }
  console.log("└─────────────────────┴───────────────┴───────────────────────────────┘");

  console.log("\n👨‍🏫 ครู (role 4):");
  console.log("┌─────────────────────┬───────────────┬───────────────────────────────┐");
  console.log("│ Username            │ Password      │ ชื่อ-นามสกุล                  │");
  console.log("│                     │ (เบอร์โทร)   │                               │");
  console.log("├─────────────────────┼───────────────┼───────────────────────────────┤");
  for (const t of TEACHERS) {
    console.log(`│ ${t.username.padEnd(19)} │ ${t.phone.padEnd(13)} │ ${(t.prefix + t.firstname + " " + t.lastname).padEnd(29)} │`);
  }
  console.log("└─────────────────────┴───────────────┴───────────────────────────────┘");
  
  console.log("\n⚠️  หมายเหตุ: ทุก user จะถูกบังคับให้เปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก");
  console.log("   (is_first_login = true → Popup แจ้งเตือนให้เปลี่ยน password ก่อนเข้าใช้งาน)\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
