import prisma from './src/lib/db.ts';

async function test() {
  try {
    console.log("Testing queries...");
    
    const s1 = await prisma.student.count();
    console.log("Students:", s1);
    
    const s2 = await prisma.teacher.count();
    console.log("Teachers:", s2);
    
    const s3 = await prisma.companies.count();
    console.log("Companies:", s3);
    
    const s4 = await prisma.department.count();
    console.log("Departments:", s4);
    
    const s5 = await prisma.major.count();
    console.log("Majors:", s5);
    
    const s6 = await prisma.internshipReport.count();
    console.log("Reports:", s6);
    
    const s7 = await prisma.supervision.count();
    console.log("Supervisions:", s7);

    const s8 = await prisma.inturnship.count();
    console.log("Inturnship:", s8);

    const s9 = await prisma.internshipReport.groupBy({ by: ["studentId"] });
    console.log("Students with reports:", s9.length);

    const s10 = await prisma.studentCompanies.groupBy({ by: ["studentId"] });
    console.log("Students with company:", s10.length);

    const s11 = await prisma.teacherClassroom.groupBy({ by: ["teacherId"] });
    console.log("Teachers with students:", s11.length);

    const s12 = await prisma.supervision.groupBy({ by: ["teacherId"] });
    console.log("Teachers supervised:", s12.length);
    
    console.log("\n✅ All queries passed!");
    
  } catch(err) {
    console.error("❌ Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
