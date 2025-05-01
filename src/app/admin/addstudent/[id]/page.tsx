'use server'
import Breadcrumbcustom from "../../components/breadcamp/Breadcamp";
import FormStudent from "../../components/form/formStudent";
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
        title: "แก้ไขข้อมูลนักศึกษา",
    },
  ];
export default async function Page({ params }: {params: Promise<{id: string}>}) {
    const { id } = await params;
    return (
        <>
        <Breadcrumbcustom items={BCrumb}/>
        <FormStudent id={id} />
        
        </>
    );
}