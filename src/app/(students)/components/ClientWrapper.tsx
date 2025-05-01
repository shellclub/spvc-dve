'use client';

import { useState } from 'react';
import FormDep from './form/formDep';
import TableDepartment, { PaginationTableType } from './table/tableDepartment';
type depProps = {
    depname: string;
    id: string
}
export default function ClientWrapper({data}: {data: PaginationTableType[]}) {
  const [selectedData, setSelectedData] = useState<depProps>({ depname: "", id: ""});
  const handleEdit = (depname: string, id: string) => {
    setSelectedData({ depname, id }); // สร้าง object depProps ใหม่
  };
  return (
    <>
    <FormDep data={selectedData} />
    <div className="mt-6">
      <TableDepartment data={data} onEdit={handleEdit}/>    
    </div>
</>
  );
}
