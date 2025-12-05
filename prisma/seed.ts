
import { hash } from 'bcryptjs'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Clean up existing data (optional, reset handles this usually)
    // await prisma.studentCompanies.deleteMany({})
    // await prisma.company.deleteMany({})
    // await prisma.student.deleteMany({})
    // await prisma.user.deleteMany({})
    // await prisma.major.deleteMany({})
    // await prisma.department.deleteMany({})

    console.log('Seeding database...')

    // 2. Create Departments
    const deptIT = await prisma.department.upsert({
        where: { depname: 'เทคโนโลยีสารสนเทศ' },
        update: {},
        create: {
            depname: 'เทคโนโลยีสารสนเทศ',
        },
    })

    // 3. Create Majors
    const majorSoftDev = await prisma.major.upsert({
        where: { major_name: 'พัฒนาซอฟต์แวร์' },
        update: {},
        create: {
            major_name: 'พัฒนาซอฟต์แวร์',
            departmentId: deptIT.id,
        },
    })

    // 4. Create Education Levels
    const eduPvc = await prisma.education_levels.upsert({
        where: { name: 'ปวช.' },
        update: {},
        create: { name: 'ปวช.' },
    })

    const eduPvs = await prisma.education_levels.upsert({
        where: { name: 'ปวส.' },
        update: {},
        create: { name: 'ปวส.' },
    })


    // 5. Create Users (Student)
    const passwordHash = await hash('123456', 10)

    const studentUser = await prisma.user.upsert({
        where: { citizenId: '1103702589654' },
        update: {},
        create: {
            firstname: 'ธนวัฒน์',
            lastname: 'กิตติกำหยา',
            citizenId: '1103702589654',
            phone: '0987654321',
            role: 7, // Student role
            sex: 1, // Male
            birthday: new Date('2000-01-01'),
            login: {
                create: {
                    username: 'student',
                    password: passwordHash,
                    is_first_login: false,
                }
            }
        },
    })

    // 6. Create Student Profile
    const studentProfile = await prisma.student.upsert({
        where: { userId: studentUser.id },
        update: {},
        create: {
            studentId: '65309010001',
            userId: studentUser.id,
            educationLevel: eduPvs.id,
            major_id: majorSoftDev.id,
            departmentId: deptIT.id,
            academicYear: '2567',
            term: '1',
            room: '1',
            status: 1, // Active
            inturnship: {
                create: {
                    selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    dayperweeks: '5',
                }
            }
        }
    })

    // 7. Create Users (Mentor/Company Contact)
    const mentorUser = await prisma.user.upsert({
        where: { citizenId: '9999999999999' },
        update: {},
        create: {
            firstname: 'สมชาย',
            lastname: 'ใจดี',
            citizenId: '9999999999999',
            phone: '0811111111',
            role: 5, // Mentor/Company role? Adjust as needed
            sex: 1,
            login: {
                create: {
                    username: 'mentor',
                    password: passwordHash,
                    is_first_login: false,
                }
            }
        },
    })

    // 8. Create Company
    const company = await prisma.companies.upsert({
        where: { name: 'Tech Solutions Co., Ltd.' },
        update: {},
        create: {
            name: 'Tech Solutions Co., Ltd.',
            address: '123 Tech Park, Bangkok',
            userId: mentorUser.id
        },
    })

    // 9. Assign Student to Company (Internship)
    // Check if exists first to avoid duplicate primary key error on re-seed
    const existingInternship = await prisma.studentCompanies.findUnique({
        where: {
            studentId_companyId: {
                studentId: studentProfile.id,
                companyId: company.id
            }
        }
    })

    if (!existingInternship) {
        await prisma.studentCompanies.create({
            data: {
                studentId: studentProfile.id,
                companyId: company.id,
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-09-30'),
            }
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
