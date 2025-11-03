"use client";
import React, { use, useEffect, useState } from "react";
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
import { Badge, Button, Dropdown } from "flowbite-react";
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
  id?:  string;
  department: {
    depname: string;
  };
  user: {
    id: string;
    citizenId: string;
    user_img: string;
    firstname?: string;
    lastname?: string;
    role?: string;
    sex?: string;
  }
}



const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const TeacherTable = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];
  const { data, isLoading, mutate } = useSWR<PaginationTableType[]>("/api/teachers/getByDepartment", fetcher);




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
    columnHelper.accessor("user.citizenId", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${maskCitizenId(info.getValue())}`}</h6>
        </div>
        
      ),
      header: () => <span>เลขบัตรประชาชน</span>,
    }),
    columnHelper.accessor("user", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
                    <Image
                    src={`/uploads/${info.getValue().user_img ? info.getValue().user_img : 'avatar.jpg'}`}
                    width={50}
                    height={50}
                    alt="icon"
                    className="h-10 w-10 rounded-xl"
                  />
                  <div className="truncate line-clamp-2 max-w-56">
                    <h6 className="text-base">{`${Number(info.getValue()?.sex) === 1 ? "นาย" : "นางสาว"} ${info.getValue()?.firstname} ${info.getValue()?.lastname}`}</h6>
                    <p className="text-sm text-darklink dark:text-bodytext">
                      {userRole(Number(info.getValue().role))}
                    </p>
                  </div>
                  
                </div>
        
      ),
      header: () => <span>ผู้ใช้</span>,
    }),
    columnHelper.accessor("user.sex", {
      cell: (info) => (
        
        <div className="text-base">
        {userSex(Number(info.getValue()))}
      </div>
        
      ),
      header: () => <span>เพศ</span>,
    }),
    columnHelper.accessor("department", {
      id: "department",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${!info.getValue()?.depname ? "-" : info.getValue().depname}`}</h6>
          
        </div>
        
      ),
      header: () => <span>แผนกวิชา</span>,
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
    <TitleIconCard title="ข้อมูลบุคลากร">
      <div className="border rounded-md border-ld overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-base text-ld font-semibold py-3 text-left border-b border-ld px-4"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
                { isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-4">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-lightgray dark:hover:bg-dark">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="text-base text-ld py-3 px-4 align-top"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-4">
                      ไม่พบข้อมูลบุคลากร
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
        <div className="sm:flex gap-2 p-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button color="primary" onClick={() => rerender()}>
              รีโหลดข้อมูล
            </Button>
            <h1 className="text-gray-700">
              {table.getPrePaginationRowModel().rows.length} แถว
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
  );
};

export default TeacherTable;
