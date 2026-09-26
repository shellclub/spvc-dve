import StudentInternshipReportBook from "@/app/components/shared/StudentInternshipReportBook";

export default async function StudentDetail({params}: { params: Promise<{id: string}>}) {
    const { id } = await params;
    return (
        <>
            <StudentInternshipReportBook id={id} backHref="/teacher" backLabel="กลับไปรายชื่อนักศึกษาในความดูแล" />
        </>
    );
}
