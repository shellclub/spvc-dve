"use client";
import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { Button } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { useRouter } from "next/navigation";
import { formatThaiDate } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSession } from "next-auth/react";
import useSWR from "swr";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import '@/fonts/THSarabunNew-normal.js';
dayjs.extend(customParseFormat)
export interface PaginationTableType {
  id?:  string;
  title: string;
  description: string;
  reportDate: Date;
  image: string;
}



 

const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = (url: string) => fetch(url).then(res => res.json());
const ExportTable = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];

  const { data: session} = useSession();
  if(!session) {
    router.push("/signin");
  }

  const { data, error, isLoading, mutate } = useSWR(`/api/report/getBystudent/${session?.user.id}`,fetcher);
  const { data:user, error:userError, isLoading: userLoading } = useSWR(`/api/students/${session?.user.id}`,fetcher);

  if(error) {
    console.log(error);
    
  }

    const exportToPDF = async () => {
    
    const input = document.getElementById('reportContent');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();


    const headerText = `รายงานการฝึกงาน \n ${user?.student?.studentId}  ${user?.sex === 1 ? "นาย" : user?.sex === 2 ? "นางสาว": ""} ${user?.firstname} ${user?.lastname} ระดับชั้น ${user?.student?.gradeLevel} กลุ่ม ${user?.student?.room} สาขาวิชา ${user?.student?.major}`;
    pdf.setFont('THSarabunNew');
    pdf.setFontSize(18);
    pdf.text(headerText, pageWidth / 2, 15, { align: 'center' });

    const topOffset = 25;

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, topOffset, pdfWidth, pdfHeight);
    const blob = pdf.output('blob');
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL)
};
 
  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => (
        <div className="text-base">
          <h6 className="text-base">{info.row.index + 1}</h6>
        </div>
      ),
    }),
    columnHelper.accessor("reportDate", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${formatThaiDate(String(info.getValue()))}`}</h6>
        </div>
        
      ),
      header: () => <span>วัน/เดือน/ปี</span>,
    }),
    columnHelper.accessor("image", {
      cell: (info) => (
        <div className="flex gap-3 items-center mx-auto justify-center">
            <Image
            src={`/report/${info.getValue()}`}
            width={100}
            height={100}
            alt="icon"
          />
          
        </div>
      ),
      header: () => <span>รูปภาพ</span>,
    }),
    columnHelper.accessor("title", {
      cell: (info) => (
        
        <div className="text-base">
        <h6 className="text-base">{`${info.getValue()}`}</h6>
      </div>
        
      ),
      header: () => <span>ข้อมูลการฝึกงาน</span>,
    }),
    columnHelper.accessor("description",{
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue()}`}</h6>
          
        </div>
        
      ),
      header: () => <span>รายละเอียด</span>,
    }),   
  ];

  const table = useReactTable({
    data: data ?? [],
    columns,
    filterFns: {},
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  

  return (
    <>
    <TitleIconCard title="ข้อมูลนักศึกษา">
      <div className="flex justify-end items-center my-6">
    <Button onClick={exportToPDF}>
        <Icon icon="tabler:printer" height={20} />
      </Button>
      
      </div>
    
      <div className="border rounded-md border-ld overflow-hidden">
        <div className="overflow-x-auto p-6" id="reportContent">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-base text-center text-ld font-semibold py-3 border border-ld border-black px-2 xxl:px-4"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap border border-black py-3 px-2 xxl:px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:flex gap-2 p-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button color="primary" onClick={() => rerender()}>
              Force Rerender
            </Button>
            <h1 className="text-gray-700">
              {table.getPrePaginationRowModel().rows.length} Rows
            </h1>
          </div>
          <div className="sm:flex items-center gap-2 sm:mt-0 mt-3">
            <div className="flex">
              <h2 className="text-gray-700 pe-1">Page</h2>
              <h2 className="font-semibold text-gray-900">
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              | Go to page:
              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="w-16 form-control-input"
              />
            </div>
            <div className="select-md sm:mt-0 mt-3">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="border w-20"
              >
                {[10, 15, 20, 25].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 sm:mt-0 mt-3">
              <Button
                size="small"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
              >
                <IconChevronsLeft className="text-ld" size={20} />
              </Button>
              <Button
                size="small"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
              >
                <IconChevronLeft className="text-ld" size={20} />
              </Button>
              <Button
                size="small"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
              >
                <IconChevronRight className="text-ld" size={20} />
              </Button>
              <Button
                size="small"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
              >
                <IconChevronsRight className="text-ld" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TitleIconCard>

    
</>


  );
};

export default ExportTable;
