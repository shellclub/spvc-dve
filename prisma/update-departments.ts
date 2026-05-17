/**
 * อัปเดตแผนกวิชาใหม่ 13 แผนก
 * Run: npx tsx prisma/update-departments.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  "แผนกวิชาการบัญชี",
  "แผนกวิชาการเลขานุการ",
  "แผนกวิชาการตลาด",
  "แผนกวิชาคอมพิวเตอร์ธุรกิจและเทคโนโลยีธุรกิจดิจิทัล",
  "แผนกวิชาคอมพิวเตอร์โปรแกรมเมอร์",
  "แผนกวิชาคอมพิวเตอร์กราฟิก",
  "แผนกวิชาการออกแบบ",
  "แผนกวิชาการโรงแรม",
  "แผนกวิชาการท่องเที่ยว",
  "แผนกวิชาอาหารและโภชนาการ",
  "แผนกวิชาผ้าและสื่อสิ่งทอ",
  "แผนกวิชาคหกรรม",
  "แผนกวิชาธุรกิจค้าปลีก",
];

async function main() {
  console.log("🏫 อัปเดตแผนกวิชาใหม่ 13 แผนก...\n");

  // ลบแผนกเก่าที่ไม่มีใน list ใหม่ (เฉพาะแผนกที่ไม่มี FK อ้างอิง)
  const existingDepts = await prisma.department.findMany();
  for (const dept of existingDepts) {
    if (!DEPARTMENTS.includes(dept.depname)) {
      try {
        await prisma.department.delete({ where: { id: dept.id } });
        console.log(`  🗑️  ลบแผนกเก่า: ${dept.depname}`);
      } catch {
        // มี FK อ้างอิงอยู่ → เปลี่ยนชื่อแทน
        console.log(`  ⚠️  ไม่สามารถลบ "${dept.depname}" ได้ (มีข้อมูลอ้างอิง) → จะถูกเก็บไว้`);
      }
    }
  }

  // เพิ่มแผนกใหม่ (upsert ด้วยชื่อแผนก)
  for (const depname of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { depname },
      update: {},
      create: { depname },
    });
    console.log(`  ✅ ${depname}`);
  }

  // แสดงผลลัพธ์
  const allDepts = await prisma.department.findMany({ orderBy: { id: "asc" } });
  console.log("\n📋 แผนกวิชาทั้งหมดในระบบ:");
  console.log("─".repeat(60));
  for (const dept of allDepts) {
    console.log(`  ${String(dept.id).padStart(2)}. ${dept.depname}`);
  }
  console.log("─".repeat(60));
  console.log(`\n🎉 เสร็จสิ้น! มีทั้งหมด ${allDepts.length} แผนก`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
