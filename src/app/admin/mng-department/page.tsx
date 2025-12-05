
import { findAllDepartments } from "@/services/departments";
import TableDepartment, { PaginationTableType } from "../components/table/tableDepartment";
import Breadcrumbcustom from "../components/breadcamp/Breadcamp";


export const dynamic = 'force-dynamic';

const BCrumb = [
  {
    to: "/admin",
    title: "Home",
  },
  {
    to: "#",
    title: "ข้อมูลแผนกวิชา",
  },
];
export default async function MsgDepartment() {
  const data: PaginationTableType[] = await findAllDepartments()
  return (
    <>
      <Breadcrumbcustom items={BCrumb} />
      <TableDepartment />
    </>
  );
}