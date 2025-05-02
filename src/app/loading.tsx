import { Spinner } from "flowbite-react";

const Loading = () => {
    return (
         <div className="flex justify-center items-center h-64">
                <Spinner size="xl" />
                <span className="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
    );
}

export default Loading;