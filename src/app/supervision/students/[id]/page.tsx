import StudentDetailTable from "../../components/table/studentDetail";

export default async function StudentDetail({params}: { params: Promise<{id: string}>}) {
    const { id } = await params;
    return (
        <>
            <StudentDetailTable id={id} />
        </>
    );
}