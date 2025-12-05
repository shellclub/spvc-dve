
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
            firstname: 'Admin',
            lastname: 'Admin',
            citizenId: '1103702589654',
            phone: '0987654321',
            role: 1, // Student role
            sex: 1, // Male
            birthday: new Date('2000-01-01'),
            login: {
                create: {
                    username: 'Admin',
                    password: passwordHash,
                    is_first_login: false,
                }
            }
        },
    })



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
