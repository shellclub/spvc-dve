import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface StudentResponse {
  id: number;
  citizenId: string;
  user_img: string;
  firstname?: string;
  lastname?: string;
  department: {
    depname: string;
  };
  student?: {
    studentId: string;
    term: string;
    academicYear: string;
    major: string;
    education: {
      name: string;
    };
    inturnship: {
      selectedDays: string[];
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Validate session
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const term = searchParams.get("term");

    // Validate department user
    const user = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id)
      },
      include: {
        teacher: {
          select: { departmentId: true}
        }
      }
    });

    // console.log("user:", user);
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" }, 
        { status: 404 }
      );
    }
    if (!user?.teacher?.departmentId) {
      return NextResponse.json(
        { message: "User is not associated with any department or majorId" }, 
        { status: 403 }
      );
    }


    // Build query conditions
    const whereConditions: any = {
      departmentId: user.teacher.departmentId || null,
      // majorId: user?.teacher?.majorId || null,
    };

    // Add term/year filters if provided
    if (year && term) {
      whereConditions.term = String(term);
      whereConditions.academicYear = String(year);
    }

    // Get students
    const students = await prisma.user.findMany({
      where: {
        student: whereConditions
      },
      orderBy: {
        id: "desc"
      },
      include: {
        student: {
          include: {
            education: true,
            inturnship: true,
            department: true,
            major: true
          },
        },
      
      }
    });

  

    // Transform response data
   
    return NextResponse.json(students);

  } catch (error) {
    console.error("Error in GET /api/students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}