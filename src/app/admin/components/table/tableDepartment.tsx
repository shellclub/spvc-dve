"use client";
import React, { FormEvent, useState } from "react";
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
import { Badge, Button, Dropdown, Label, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import useSWR from "swr";

export interface PaginationTableType {
  id?: number | string;
  depname?: string;
  actions?: any;
}


const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = (url: string) => fetch(url).then(res => res.json());
const TableDepartment = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [depname, setDepname] = useState<string>("");
  const [Depid, setDepid] = useState<string>("");
  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];
  const {data ,isLoading, error, mutate} = useSWR("/api/departments",fetcher);
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "แจ้งเตือน!",
      text: "คุณต้องการลบข้อมูลแผนกวิชานี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการ",
      cancelButtonText: "ไม่ต้องการ"
    }).then( async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/departments/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if(!res.ok) {
          const err = await res.json();
          showToast(err.message, err.type);
        }
        if(res.ok) {
          const data = await res.json();
          showToast(data.message, data.type);
          mutate();
        }
      }
    });

  }

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const result = await fetch(Depid ? `/api/departments/${Depid}` : "/api/departments",{
    method: Depid ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ depname: depname})
  })
  if(result.ok) {
    setOpen(false);
    mutate();
    setDepname("");
    setDepid("");

  }
  const data = await result.json();
  showToast(data.message, data.type);
}

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
    columnHelper.accessor("depname", {
      cell: (info) => (
        
        <div className="text-base">
        {info.getValue()}
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
            { icon: "tabler:pen", listtitle: "Edit", onclick: () => {
              setDepname(String(info.row.original.depname));
              setDepid(String(info.row.original.id));
              setOpen(true);
            }},
            { icon: "tabler:trash", listtitle: "Delete", onclick: () => handleDelete(info.row.original.id as string) },
          ].map((item, index) => (
            <Dropdown.Item key={index} onClick={item.onclick} className="flex gap-3">
              <Icon icon={item.icon} height={18} />
              <span >{item.listtitle}</span>
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

  return (
    <TitleIconCard title="ข้อมูลแผนกวิชา">
      <div className="flex justify-end items-center my-6">
            <Button onClick={() => {
              setOpen(true)
            }}>เพิ่ม</Button>
            <Modal show={open} size="3xl" onClose={() => setOpen(false)} popup>
              <ModalHeader />
              <ModalBody>
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">จัดการข้อมูลแผนกวิชา</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Label>กรอกชื่อแผนกวิชา</Label>
                    <TextInput 
                      name="depname"
                      placeholder="กรุณากรอกชื่อแผนกวิชา"
                      id="depname"
                      value={depname}
                      onChange={(e) => setDepname(e.target.value)}
                    />
                  </div>
                  <div className="w-full flex mt-6 text-end justify-end">
                      <Button type="submit">ส่งข้อมูล</Button>
                  </div>
                </form>
              </div>
              </ModalBody>
            </Modal>
            </div>
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
            {isLoading ? (
          <tr>
            <td colSpan={2} className="text-center p-4">
              กำลังโหลดข้อมูล...
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={2} className="text-center p-4 text-red-500">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap py-3 px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        )
              }
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
  );
};

export default TableDepartment;
