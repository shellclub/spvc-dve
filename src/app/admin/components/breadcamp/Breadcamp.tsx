  
    import { Breadcrumb } from "flowbite-react";
    import { HiHome } from "react-icons/hi";
    type BCrumb = {
            title: string;
            to: string;
        
    }
    export default function Breadcrumbcustom({items}: {items: BCrumb[]}) {
        return (
            <>
            <Breadcrumb aria-label="Default breadcrumb example">
            { items?.map((row, index) => (
                <Breadcrumb.Item href={row.to} key={index}>
                    {row.title}
                </Breadcrumb.Item>
            )) }
            </Breadcrumb>
            </>
        );
    }