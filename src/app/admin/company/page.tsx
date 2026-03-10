import CompaniesTable from "../components/table/companyTable";
import Breadcrumbcustom from "../components/breadcamp/Breadcamp";

const BCrumb = [
    {
        to: "/admin",
        title: "Home",
    },
    {
        to: "/admin/company",
        title: "ข้อมูลสถานประกอบการ",
    },
];

export default function CompanyPage() {
    return (
        <>
            <Breadcrumbcustom items={BCrumb} />
            <CompaniesTable />
        </>
    );
}