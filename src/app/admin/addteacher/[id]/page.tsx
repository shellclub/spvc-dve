import Breadcrumbcustom from "../../components/breadcamp/Breadcamp";
import FormTeacher from "../../components/form/formTeacher";
const BCrumb = [
    {
      to: "/admin",
      title: "Home",
    },
    {
        to: "/admin/teachers",
        title: "ข้อมูลผู้อาจารย์ประจำแผนกวิชา",
        },
    {
        to: "#",
        title: "แก้ไขข้อมูลอาจารย์ประจำแผนกวิชา",
    },
  ];
export default async function Page({ params }: { params: Promise<{ id: string}>}) {
    const { id } = await params;
    return (
        <>
            <Breadcrumbcustom items={BCrumb} />
            <FormTeacher id={id} />
        </>
    );
}