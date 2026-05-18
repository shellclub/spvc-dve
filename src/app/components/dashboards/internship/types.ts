export type InternshipDashboardData = {
  overview: {
    totalStudents: number;
    reportedToday: number;
    reportedThisWeek: number;
    reportedThisMonth: number;
    totalStaff: number;
    supervisionTeachers: number;
    teachersSupervised: number;
    totalSupervisions: number;
  };
  staffByRole: { role: number; roleName: string; count: number }[];
  staffList: {
    id: number;
    name: string;
    role: number;
    roleName: string;
    phone: string;
    department: string;
    teacherId: number | null;
  }[];
  monthlyReports: {
    key: string;
    label: string;
    reportCount: number;
    studentCount: number;
  }[];
  weeklyReports: {
    weekStart: string;
    reportCount: number;
    studentCount: number;
  }[];
  dailyReports: { date: string; count: number }[];
  students: StudentSummary[];
  teachers: TeacherSummary[];
};

export type StudentSummary = {
  id: number;
  studentId: string;
  name: string;
  department: string;
  major: string;
  reportCountYear: number;
  lastReportDate: string | null;
  hasReportToday: boolean;
  hasReportThisWeek: boolean;
  hasReportThisMonth: boolean;
  reportDates: string[];
};

export type TeacherSummary = {
  id: number;
  name: string;
  role: number;
  roleName: string;
  department: string;
  assignedStudentCount: number;
  studentsReportedThisMonth: number;
  studentsNotReportedThisMonth: number;
  supervisionCountYear: number;
  lastSupervisionDate: string | null;
  supervisionStatus: "done" | "partial" | "none";
  assignedStudents: {
    id: number;
    studentId: string;
    name: string;
    hasReportThisMonth: boolean;
    lastReportDate: string | null;
  }[];
};
