"use client";
import React, { useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/dialog";
import { Dropdown, Spinner } from "flowbite-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDots,
  IconPlus,
  IconEdit,
  IconBuilding,
} from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn-ui/Default-Ui/select";
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";
import { validateThaiID } from "@/lib/thaiIdVaildate";

export interface CompanyType {
  id: number;
  name: string;
  address: string;
  userId: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    citizenId: string;
  };
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const columnHelper = createColumnHelper<CompanyType>();

const CompaniesTable = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyType | null>(null);
  // Fetch companies data
  const { data, isLoading, error, mutate } = useSWR("/api/company", fetcher);




  const rerender = () => {
    setColumnFilters([]);
    mutate();
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <div className="text-base">{info.row.index + 1}</div>,
    }),
    columnHelper.accessor("name", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base font-semibold">{info.getValue()}</h6>
        </div>
      ),
      header: () => <span>ชื่อสถานประกอบการ</span>,
    }),
    columnHelper.accessor("address", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-72">
          <p className="text-sm">{info.getValue()}</p>
        </div>
      ),
      header: () => <span>ที่อยู่</span>,
    }),
    columnHelper.accessor("user", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue().firstname} ${info.getValue().lastname}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {info.getValue().phone || "-"}
          </p>
        </div>
      ),
      header: () => <span>ผู้ติดต่อ</span>,
    }),
  ]
  const table = useReactTable({
    data: data || [],
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
      <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
        <Spinner
          size="xl"
          color="primary"
          aria-label="Loading..."
          className="text-blue-600 dark:text-blue-500"
        />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          กำลังโหลดข้อมูลสถานประกอบการ โปรดรอสักครู่...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
        <p className="text-lg font-medium text-red-600 dark:text-red-500">
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <TitleIconCard title="ข้อมูลสถานประกอบการ">

        {/* Table */}
        <div className="border rounded-md border-ld overflow-hidden">
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
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border dark:divide-darkborder">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap border py-3 px-2 xxl:px-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                  {table.getState().pagination.pageIndex + 1} จาก{" "}
                  {table.getPageCount()}
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
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
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
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                >
                  <IconChevronsLeft className="text-ld" size={20} />
                </Button>
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                >
                  <IconChevronLeft className="text-ld" size={20} />
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                >
                  <IconChevronRight className="text-ld" size={20} />
                </Button>
                <Button
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

export default CompaniesTable