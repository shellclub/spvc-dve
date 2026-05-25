import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany({
    include: {
      user: true,
      department: true,
      major: true,
      education: true
    }
  })
  console.log("Total students:", students.length);
  const nullUsers = students.filter(s => !s.user)
  console.log("Students without user:", nullUsers.length);
  const nullFirstnames = students.filter(s => s.user && !s.user.firstname)
  console.log("Students with null firstname:", nullFirstnames.length);
  
  // Also check if any other fields are unexpectedly null
  const nullStudentIds = students.filter(s => !s.studentId)
  console.log("Students with null studentId:", nullStudentIds.length);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
