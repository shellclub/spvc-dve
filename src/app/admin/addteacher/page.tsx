import Breadcrumbcustom from "../components/breadcamp/Breadcamp";
import FormTeacher from "../components/form/formTeacher";
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
        title: "เพิ่มข้อมูลอาจารย์ประจำแผนกวิชา",
    },
  ];
export default function Page() {
    return (
        <>
            <Breadcrumbcustom items={BCrumb} />
            <FormTeacher/>
        </>
    );
}