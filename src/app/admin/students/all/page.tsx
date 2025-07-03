import Breadcrumbcustom from "../../components/breadcamp/Breadcamp";
import { StudentsAllTable } from "../../components/table/studentsAllTable";

const BCrumb = [
    {
      to: "/admin",
      title: "Home",
    },
    {
        to: "/admin/teachers",
        title: "ข้อมูลนักศึกษา",
    },
  ];
export default async function Users() {
    return (
        <>
            <Breadcrumbcustom items={BCrumb} />
            <StudentsAllTable />
        </>
    );
}