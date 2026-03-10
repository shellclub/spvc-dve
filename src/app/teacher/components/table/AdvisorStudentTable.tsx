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
  SortingState,
  FilterFn,
} from "@tanstack/react-table";
import { Button, Spinner } from "flowbite-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";

export interface AdvisorStudentRow {
  id: number;
  user_img: string | null;
  firstname: string;
  lastname: string;
  student: {
    id: number;
    studentId: string;
    term: string;
    academicYear: string;
    room: string;
    gradeLevel: string;
    education: { name: string };
    major: { major_name: string };
    department: { depname: string };
  };
}

const columnHelper = createColumnHelper<AdvisorStudentRow>();
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdvisorStudentTable() {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { data, error, isLoading, mutate } = useSWR<AdvisorStudentRow[]>(
    "/api/teachers/me/students",
    fetcher
  );

  const nameFilterFn: FilterFn<AdvisorStudentRow> = (row, columnId, filterValue) => {
    const search = String(filterValue).toLowerCase();
    const first = row.original.firstname?.toLowerCase() ?? "";
    const last = row.original.lastname?.toLowerCase() ?? "";
    const sid = row.original.student?.studentId?.toLowerCase() ?? "";
    return first.includes(search) || last.includes(search) || sid.includes(search);
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <span className="text-base">{info.row.index + 1}</span>,
    }),
    columnHelper.accessor((row) => row.student.studentId, {
      id: "studentId",
      header: () => <span>รหัสนักศึกษา</span>,
      cell: (info) => (
        <div className="font-medium text-gray-800">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor(
      (row) => `${row.firstname} ${row.lastname}`.trim(),
      {
        id: "name",
        header: () => <span>ชื่อ-นามสกุล</span>,
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden relative flex-shrink-0">
              <Image
                src={
                  info.row.original.user_img
                    ? `/uploads/${info.row.original.user_img}`
                    : "/default-user.png"
                }
                width={40}
                height={40}
                alt=""
                className="object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-user.png";
                }}
              />
            </div>
            <div>
              <div className="font-medium text-gray-800">{info.getValue()}</div>
              <div className="text-sm text-gray-500">
                {info.row.original.student.education?.name}
              </div>
            </div>
          </div>
        ),
      }
    ),
    columnHelper.accessor((row) => row.student.department?.depname ?? "", {
      id: "department",
      header: () => <span>แผนก/สาขา</span>,
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue()}</div>
          <div className="text-sm text-gray-500">
            {info.row.original.student.major?.major_name}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor(
      (row) =>
        `${row.student.education?.name ?? ""}.${row.student.gradeLevel ?? ""}/${row.student.room ?? ""}`,
      {
        id: "grade",
        header: () => <span>ระดับชั้น</span>,
        cell: (info) => (
          <div className="text-sm">
            {info.getValue()}
            <div className="text-gray-500">
              {info.row.original.student.term}/
              {info.row.original.student.academicYear}
            </div>
          </div>
        ),
      }
    ),
    columnHelper.display({
      id: "actions",
      header: () => <span>ดำเนินการ</span>,
      cell: (info) => (
        <Button
          size="xs"
          color="green"
          onClick={() =>
            router.push(
              `/teacher/students/${info.row.original.student.id}`
            )
          }
          className="flex items-center gap-1"
        >
          <Icon icon="tabler:file-text" width={16} />
          ดูรายงานการปฏิบัติงาน
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: data ?? [],
    columns,
    filterFns: { nameFilter: nameFilterFn },
    state: {
      columnFilters,
      sorting,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: nameFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูลนักศึกษาในความดูแล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <TitleIconCard title="นักศึกษาในความดูแล">
        <div className="text-center py-8 text-red-500">
          <Icon icon="tabler:alert-circle" className="inline-block text-2xl mb-2" />
          <p>โหลดข้อมูลไม่สำเร็จ</p>
          <Button color="gray" onClick={() => mutate()} className="mt-4">
            ลองอีกครั้ง
          </Button>
        </div>
      </TitleIconCard>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <TitleIconCard title="นักศึกษาในความดูแล - ตรวจสอบรายงานการปฏิบัติงานแต่ละวัน">
      <p className="text-sm text-gray-500 mb-4">
        คลิก &quot;ดูรายงานการปฏิบัติงาน&quot; เพื่อดูว่านักศึกษาบันทึกอะไรบ้างในแต่ละวัน
      </p>
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="ค้นหาชื่อ นามสกุล หรือรหัสนักศึกษา..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-md border-ld overflow-hidden">
        {!rows.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Icon icon="tabler:school-off" className="text-4xl mb-2" />
            <p>ยังไม่มีนักศึกษาในความดูแล</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
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
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="whitespace-nowrap border border-ld py-3 px-4"
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
            <div className="sm:flex gap-2 p-3 items-center justify-between border-t border-ld">
              <div className="text-gray-600 text-sm">
                แสดง {table.getFilteredRowModel().rows.length} รายการ
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="small"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <IconChevronsLeft size={18} />
                </Button>
                <Button
                  size="small"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <IconChevronLeft size={18} />
                </Button>
                <span className="text-sm">
                  หน้า {table.getState().pagination.pageIndex + 1} จาก{" "}
                  {table.getPageCount() || 1}
                </span>
                <Button
                  size="small"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <IconChevronRight size={18} />
                </Button>
                <Button
                  size="small"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <IconChevronsRight size={18} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </TitleIconCard>
  );
}
