import Breadcrumbcustom from "../components/breadcamp/Breadcamp";
import TeacherTable from "../components/table/teacherTable";
const BCrumb = [
  {
    to: "/admin",
    title: "Home",
  },
  {
    to: "/admin/teachers",
    title: "ข้อมูลผู้อาจารย์ประจำแผนกวิชา",
  },
];
export default function Page() {
  return (
    <>
      <Breadcrumbcustom items={BCrumb} />
      <TeacherTable />
    </>
  );
}