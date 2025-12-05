"use client";
import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/dialog";
import { Badge, Button, Dropdown, Select, Spinner } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { formatThaiDate } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import '@/fonts/THSarabunNew-normal.js';
// Interface ตามโครงสร้างข้อมูลจริงจาก API
interface Report {
  id: number;
  studentId: number;
  title: string;
  description: string;
  reportDate: string;
  image: string;
}

interface Inturnship {
  id: number;
  selectedDays: string[];
  dayperweeks: string;
}

interface Student {
  id: number;
  studentId: string;
  major: string;
  academicYear: string;
  term: string;
  room: string;
  education: {
    id: number;
    name: string;
  };
  gradeLevel: string;
  inturnship: Inturnship;
  report: Report[];
}

export interface UserData {
  id: number;
  firstname: string;
  lastname: string;
  department: {
    id: number;
    depname: string;
  };
  student: Student;
  sex: number;
}

type StudentProps = {
  id: string;
};

const columnHelper = createColumnHelper<Report>();

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
});

const StudentDetailTable = ({ id }: StudentProps) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [studentInfo, setStudentInfo] = useState({
    studentId: 'กำลังโหลด...',
    name: 'กำลังโหลด...',
    department: 'กำลังโหลด...',
    major: 'กำลังโหลด...',
    academicYear: 'กำลังโหลด...',
    internshipDays: 'กำลังโหลด...'
  });

  const { data, error, isLoading, mutate } = useSWR<UserData>(
    `/api/report/studentDetail/${id}`,
    fetcher,
    {
      onSuccess: (data) => {
        if (data) {
          setStudentInfo({
            studentId: data.student?.studentId || 'ไม่มีข้อมูล',
            name: `${data.firstname || ''} ${data.lastname || ''}`.trim(),
            department: data.department?.depname || 'ไม่มีข้อมูล',
            major: data.student?.major || 'ไม่มีข้อมูล',
            academicYear: data.student
              ? `${data.student.term}/${data.student.academicYear}`
              : 'ไม่มีข้อมูล',
            internshipDays: data.student?.inturnship?.selectedDays?.join(', ') || 'ไม่มีข้อมูล'
          });
        }
      },
      onError: (err) => {
        console.error("API Error:", err);
        showToast("ไม่สามารถโหลดข้อมูลได้", "error");
      }
    }
  );


  const exportToPDF = async () => {

    const input = document.getElementById('reportContent');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();


    const headerText = `รายงานการฝึกงาน \n ${data?.student?.studentId}  ${data?.sex === 1 ? "นาย" : data?.sex === 2 ? "นางสาว" : ""} ${data?.firstname} ${data?.lastname} ระดับชั้น ${data?.student?.gradeLevel} กลุ่ม ${data?.student?.room} สาขาวิชา ${data?.student?.major}`;
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
      header: "#",
      cell: (info) => info.row.index + 1,
    }),
    columnHelper.accessor("reportDate", {
      cell: (info) => (
        <div className="text-base">
          {info.getValue() ? formatThaiDate(info.getValue()) : "ไม่มีข้อมูล"}
        </div>
      ),
      header: "วันที่รายงาน",
    }),
    columnHelper.accessor("image", {
      cell: (info) => (
        <div className="flex justify-center">
          {info.getValue() ? (
            <Image
              src={`/report/${info.getValue()}`}
              width={100}
              height={100}
              alt="รายงานภาพ"
              className="object-contain h-20"
              priority={false}
              unoptimized={true}
            />
          ) : (
            <span className="text-gray-400">ไม่มีภาพ</span>
          )}
        </div>
      ),
      header: "รูปภาพ",
    }),
    columnHelper.accessor("title", {
      cell: (info) => <div className="text-base">{info.getValue() || "ไม่มีข้อมูล"}</div>,
      header: "หัวข้อ",
    }),
    columnHelper.accessor("description", {
      cell: (info) => (
        <div className="line-clamp-2 max-w-xs">
          {info.getValue() || "ไม่มีรายละเอียด"}
        </div>
      ),
      header: "รายละเอียด",
    }),

  ];

  const table = useReactTable({
    data: data?.student.report || [],
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <Icon icon="tabler:alert-circle" className="inline-block mr-2" />
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <Button color="gray" onClick={() => mutate()} className="mt-4">
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <TitleIconCard title="ข้อมูลนักศึกษา">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6 p-4 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">รหัสนักศึกษา</p>
          <p className="text-base font-medium">{studentInfo.studentId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">ชื่อ-สกุล</p>
          <p className="text-base font-medium">{studentInfo.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">แผนก</p>
          <p className="text-base font-medium">{studentInfo.department}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">สาขา</p>
          <p className="text-base font-medium">{studentInfo.major}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">ปีการศึกษา</p>
          <p className="text-base font-medium">{studentInfo.academicYear}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">วันฝึกงาน</p>
          <p className="text-base font-medium">{studentInfo.internshipDays}</p>
        </div>
      </div>
      <div className="flex justify-end items-center my-6">
        <Button onClick={exportToPDF}>
          <Icon icon="tabler:printer" height={20} />
        </Button>

      </div>
      <div className="border rounded-md border-ld overflow-hidden">
        {!data?.student.report || data.student.report.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Icon icon="tabler:report-off" className="text-gray-400 text-4xl mb-2" />
            <span className="text-gray-500">ไม่พบรายงานการฝึกงาน</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto p-6" id="reportContent">
              <table className="min-w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-base text-ld font-semibold py-3 text-left border border-ld px-2 xxl:px-4"
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
                        <td key={cell.id} className="whitespace-nowrap border border-ld py-3 px-4">
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
                <h1 className="text-gray-700">
                  {table.getPrePaginationRowModel().rows.length} รายการ
                </h1>
              </div>

              <div className="sm:flex items-center gap-2 sm:mt-0 mt-3">
                <div className="flex">
                  <h2 className="text-gray-700 pe-1">หน้า</h2>
                  <h2 className="font-semibold text-gray-900">
                    {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  | ไปที่หน้า:
                  <input
                    type="number"
                    min="1"
                    max={table.getPageCount()}
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={(e) => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0;
                      table.setPageIndex(page);
                    }}
                    className="w-16 form-control-input border rounded px-2 py-1"
                  />
                </div>

                <div className="select-md sm:mt-0 mt-3">
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="border w-20 rounded px-2 py-1"
                  >
                    {[5, 10, 15, 20].map((pageSize) => (
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
                    <IconChevronsLeft size={20} />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                  >
                    <IconChevronLeft size={20} />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                  >
                    <IconChevronRight size={20} />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                  >
                    <IconChevronsRight size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </TitleIconCard>
  );
};

export default StudentDetailTable;