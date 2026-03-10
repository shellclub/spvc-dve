import StudentTable from "../components/table/studentTable";
import Breadcrumbcustom from "../components/breadcamp/Breadcamp";
const BCrumb = [
    {
      to: "/admin",
      title: "Home",
    },
    {
        to: "/admin/students",
        title: "ข้อมูลนักศึกษา",
    },
  ];
export default async function Students() {
    return (
        <>
            <Breadcrumbcustom items={BCrumb} />
            <StudentTable />
        </>
    );
}