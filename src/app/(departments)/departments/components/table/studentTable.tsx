"use client";
import React, { FormEvent, useEffect, useState } from "react";
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
import { Badge, Button, Dropdown, Select } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import { maskCitizenId, userRole, userSex } from "@/lib/utils";
import Image from "next/image";
import useSWR from "swr";

export interface PaginationTableType {
  id?: string;
  citizenId: string;
  user_img: string;
  student: {
    id: string;
    studentId: string;
    term: string;
    education: {
      name: string;
    };
    inturnship: {
      selectedDays: string[];
    };
    major: string;
    academicYear: string;
  };
  department: {
    depname: string;
  };
  firstname?: string;
  lastname?: string;
  role?: string;
  sex?: string;
  actions?: any;
}

type TermYear = {
  term: string;
  academicYear: string;
};

const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = async (url: string) => await fetch(url).then(res => res.json());

const StudentTable = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];
  
  const { data: academicYears, error: yearError, isLoading: yearLoading } = useSWR<TermYear[]>('/api/academic_year', fetcher);
  const { data, error, isLoading, mutate } = useSWR<PaginationTableType[]>(
    !selected ? '/api/students/getByDepartment' : `/api/students/getByDepartment?term=${selectedTerm}&year=${selectedYear}`, 
    fetcher
  );

  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => (
        <div className="text-base">
          {info.row.index + 1}
        </div>
      ),
    }),
    columnHelper.accessor("student", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue().studentId}`}</h6>
        </div>
      ),
      header: () => <span>รหัสนักศึกษา</span>,
    }),
    columnHelper.accessor("firstname", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-xl overflow-hidden relative">
            <Image
              src={info.row.original.user_img ? `/uploads/${info.row.original.user_img}` : '/default-user.png'}
              width={50}
              height={50}
              alt="user"
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-user.png';
              }}
            />
          </div>
          <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue()} ${info.row.original.lastname}`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
              {info.row.original.student.education.name}
            </p>
          </div>
        </div>
      ),
      header: () => <span>ชื่อ-นามสกุล</span>,
    }),
    columnHelper.accessor((row) => row.department.depname, {
      id: "department",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue()}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {info.row.original.student.major}
          </p>
        </div>
      ),
      header: () => <span>แผนกวิชา</span>,
    }),
    columnHelper.accessor((row) => row.student.academicYear, {
      id: "academicYear",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.row.original.student.term}/${info.getValue()}`}</h6>
        </div>
      ),
      header: () => <span>แผนกวิชา</span>,
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
              <IconDots size={22} />
            </span>
          )}
        >
          {[
            { 
              icon: "tabler:eye", 
              listtitle: "รายละเอียด", 
              onclick: () => router.push(`/departments/students/${info.row.original.id as string}`)
            },
          ].map((item, index) => (
            <Dropdown.Item key={index} onClick={item.onclick} className="flex gap-3">
              <Icon icon={item.icon} height={18} />
              <span>{item.listtitle}</span>
            </Dropdown.Item>
          ))}
        </Dropdown>
      ),
      header: () => <span></span>,
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

  if (yearLoading) {
    return <div>Loading academic years...</div>;
  }

  if (yearError) {
    return <div>Error loading academic years</div>;
  }

  return (
    <>
      <TitleIconCard title="ข้อมูลนักศึกษา">
        <div className="flex justify-between mb-3">
          <div className="mx-2">
            <label className="block mb-1">
              ปีการศึกษา:
              <Select
                value={`${selectedTerm}/${selectedYear}`}
                onChange={(e) => {
                  if (e.target.value === "all") {
                    setSelectedTerm('');
                    setSelectedYear('');
                    setSelected(false);
                    mutate();
                  } else {
                    const [term, academicYear] = e.target.value.split('/');
                    setSelectedTerm(term);
                    setSelectedYear(academicYear);
                    setSelected(true);
                    mutate();
                  }
                }}
              >
                <option value="" hidden>เลือกปีการศึกษา</option>
                <option value="all">ทั้งหมด</option>
                {academicYears?.map((year, index) => (
                  <option 
                    key={index} 
                    value={`${year.term}/${year.academicYear}`}
                  >
                    {`${year.term}/${year.academicYear}`}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="mx-2 flex items-center">
        <p className="text-md">ปีการศึกษา: { !selected ? "ทั้งหมด" : `${selectedTerm}/${selectedYear}`}</p>
          </div>
        </div>
        
        <div className="border rounded-md border-ld overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">Loading student data...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error loading student data</div>
          ) : !data || data.length === 0 ? (  // ตรวจสอบว่า data ว่างหรือไม่
                <div className="flex flex-col items-center justify-center py-8">
                  <Icon icon="tabler:database-off" className="text-gray-400 text-4xl mb-2" />
                  <span className="text-gray-500">ไม่พบข้อมูลนักศึกษา</span>
                </div>

          ) : (
            <>
              <div className="overflow-x-auto">
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
            </>
          )}
        </div>
      </TitleIconCard>
    </>
  );
};

export default StudentTable;