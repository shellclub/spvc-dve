import Breadcrumbcustom from "../components/breadcamp/Breadcamp";
import FormStudent from "../components/form/formStudent";
const BCrumb = [
    {
      to: "/admin",
      title: "Home",
    },
    {
        to: "/admin/teachers",
        title: "ข้อมูลนักศึกษา",
        },
    {
        to: "#",
        title: "เพิ่มข้อมูลนักศึกษ",
    },
  ];
export default function Addperson() {
    return (
        <>
            <Breadcrumbcustom items={BCrumb} />
            <FormStudent/>
        </>
    );
}