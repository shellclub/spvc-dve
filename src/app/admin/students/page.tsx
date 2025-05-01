import { findAllUser } from "@/services/users";
import StudentTable from "../components/table/studentTable";
import Breadcrumbcustom from "../components/breadcamp/Breadcamp";
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
            <StudentTable />
        </>
    );
}