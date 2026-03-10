import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { message: "Unauthorized", type: "error" },
                { status: 401 }
            );
        }

        const userId = Number(session.user.id);

        // 1. Find User -> Student
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { student: true }
        });

        if (!user || !user.student) {
            return NextResponse.json(
                { message: "Student profile not found", type: "error" },
                { status: 404 }
            );
        }

        // 2. Find StudentCompanies -> Company
        // Assuming a student has one active internship, or we pick the latest one?
        // The schema has `@@id([studentId, companyId])` so one student can have multiple companies theoretically,
        // but usually in this context it's one active. Let's findFirst for now or handle list.
        // The user wants "The internship details", implying singular.

        // We need to include Company -> User (to get Mentor info)
        const internship = await prisma.studentCompanies.findFirst({
            where: { studentId: user.student.id },
            orderBy: { assignedAt: 'desc' }, // Get latest
            include: {
                company: {
                    include: {
                        user: true // This user is the Company Contact/Mentor
                    }
                }
            }
        });

        if (!internship) {
            return NextResponse.json(
                { message: "No internship found", type: "error" },
                { status: 404 } // Or 200 with null data if UI handles it
            );
        }

        // 3. Calculate Weeks
        const start = new Date(internship.startDate);
        const end = new Date(internship.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diffDays / 7);
        const remainingDays = diffDays % 7;

        // Format duration string
        let durationStr = `${weeks} สัปดาห์`;
        if (remainingDays > 0) {
            durationStr += ` ${remainingDays} วัน`;
        }

        // 4. Construct Response Data
        const data = {
            companyName: internship.company.name,
            companyAddress: internship.company.address,
            companyTel: internship.company.user.phone || "-", // Assuming company.user is the contact
            mentorName: `${internship.company.user.firstname} ${internship.company.user.lastname}`,
            mentorPosition: "-", // Position is not in User/Company schema, returning dash
            startDate: internship.startDate,
            endDate: internship.endDate,
            duration: durationStr,
        };

        return NextResponse.json(data);

    } catch (error) {
        console.error("Error fetching internship details:", error);
        return NextResponse.json(
            { message: "Internal Server Error", type: "error" },
            { status: 500 }
        );
    }
}

import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { message: "Unauthorized", type: "error" },
                { status: 401 }
            );
        }

        const userId = Number(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { student: true }
        });

        if (!user || !user.student) {
            return NextResponse.json(
                { message: "Student profile not found", type: "error" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            selectedCompanyId,
            name,
            address,
            firstname,
            lastname,
            phone,
            startDate,
            endDate,
        } = body;

        if (!startDate || !endDate) {
            return NextResponse.json(
                { message: "กรุณาระบุวันที่เริ่มและสิ้นสุดการฝึกงาน", type: "error" },
                { status: 400 }
            );
        }

        if (selectedCompanyId) {
            // Check if already has internship
            const existing = await prisma.studentCompanies.findFirst({
                where: { studentId: user.student.id, companyId: Number(selectedCompanyId) }
            });
            if (existing) {
                return NextResponse.json({ message: "คุณมีข้อมูลสถานประกอบการนี้แล้ว", type: "error" }, { status: 400 });
            }
            await prisma.studentCompanies.create({
                data: {
                    studentId: user.student.id,
                    companyId: Number(selectedCompanyId),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                }
            });
            return NextResponse.json({ message: "บันทึกข้อมูลสำเร็จ", type: "success" }, { status: 201 });
        }

        // Create new company
        if (!name || !firstname || !lastname) {
            return NextResponse.json(
                { message: "กรุณากรอกข้อมูลสถานประกอบการให้ครบถ้วน", type: "error" },
                { status: 400 }
            );
        }

        const citizenId = `CMP${Date.now()}`.substring(0, 13);
        const existingCompany = await prisma.companies.findUnique({ where: { name: String(name) } });
        if (existingCompany) {
            return NextResponse.json(
                { message: "มีชื่อสถานประกอบการดังกล่าวแล้ว กรุณาเลือกจากรายชื่อ", type: "error" },
                { status: 400 }
            );
        }

        const studentId = user.student.id;

        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    firstname,
                    lastname,
                    phone: phone || "",
                    citizenId,
                    role: 6,
                    login: {
                        create: {
                            username: citizenId,
                            password: bcrypt.hashSync(citizenId, 10),
                        },
                    },
                    company: {
                        create: {
                            name,
                            address: address || "",
                        },
                    },
                },
                include: {
                    company: true,
                },
            });

            if (!newUser.company) throw new Error("ไม่สามารถสร้างข้อมูลได้");

            await tx.studentCompanies.create({
                data: {
                    studentId: studentId,
                    companyId: newUser.company.id,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                }
            });
        });

        return NextResponse.json({ message: "เพิ่มข้อมูลสถานประกอบการใหม่สำเร็จ", type: "success" }, { status: 201 });
    } catch (error) {
        console.error("Error adding student company:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" }, { status: 500 });
    }
}
