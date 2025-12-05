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

import { Badge, Button, Datepicker, Dropdown, TextInput, Modal, ModalBody, ModalHeader, Label, Checkbox, Textarea, FileInput, HelperText, Spinner } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import { formatThaiDate, maskCitizenId, userRole, userSex } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSession } from "next-auth/react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import useSWR from "swr";

dayjs.extend(customParseFormat)
export interface PaginationTableType {
  id?: string;
  title: string;
  description: string;
  reportDate: Date;
  image: string;
}



const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = (url: string) => fetch(url).then(res => res.json());
const InternReport = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<PaginationTableType | null>(null);

  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];

  const { data: session, status } = useSession();
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);
  const swrKey = session?.user?.id ? `/api/report/getBystudent/${session?.user.id}` : null;

  const { data, isLoading, error, mutate } = useSWR(swrKey, fetcher);



  if (error) {
    console.log(error);

  }
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "แจ้งเตือน!",
      text: "คุณต้องการลบข้อมูลรายการนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการ",
      cancelButtonText: "ไม่ต้องการ"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/report/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (!res.ok) {
          const err = await res.json();
          showToast(err.message, err.type);
        } else {
          const data = await res.json();
          showToast(data.message, data.type);
          mutate();
        }
      }
    });

  }


  async function handleSubmitUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch(editData ? `/api/report/${editData.id}` : `/api/report`, {
      method: editData ? "PUT" : "POST",
      body: formData,
    });
    if (res.ok) {
      setOpen(false);
      mutate();
    }
    const data = await res.json();
    showToast(data.message || data.error, data.type)

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
        <div className="flex gap-3 items-center">
          <Image
            src={info.getValue() ? `/report/${info.getValue()}` : '-'}
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
          {info.getValue()}
        </div>

      ),
      header: () => <span>ข้อมูลการฝึกงาน</span>,
    }),
    columnHelper.accessor("description", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-full">
          <h6 className="text-base">{`${info.getValue()}`}</h6>

        </div>

      ),
      header: () => <span>รายละเอียด</span>,
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
              icon: "tabler:edit", listtitle: "แก้ไขข้อมูล", onclick: () => {
                setEditData(info.row.original);
                setOpen(true);
              }
            },
            { icon: "tabler:trash", listtitle: "ลบข้อมูล", onclick: () => handleDelete(info.row.original.id as string) },
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

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <>
      <TitleIconCard title="รายงานการฝึกงาน">
        <div className="flex justify-end items-center my-6">
          <Button onClick={() => {
            setOpen(true)
            setEditData(null);
          }}>รายงานผลการฝึกงาน</Button>
          <Modal show={open} size="3xl" onClose={() => setOpen(false)} popup>
            <ModalHeader />
            <ModalBody>
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">รายงานผลการฝึกงาน</h3>
                <form onSubmit={handleSubmitUpload}>
                  <div className="my-3">
                    <div className="mb-2 block">
                      <Label htmlFor="reportDate">เลือกวัน/เดือน/ปี ที่ต้องการรายงาน</Label>
                    </div>
                    <Datepicker
                      language="th-TH"
                      name="reportDate"
                      id="reportDate"
                      defaultDate={editData?.reportDate ? dayjs(editData.reportDate).toDate() : new Date()}
                    />
                  </div>
                  <div className="my-3">
                    <div className="mb-3 block">
                      <Label htmlFor="title">รายงานผลฝึกงาน</Label>
                    </div>
                    <TextInput
                      id="title"
                      type="text"
                      name="title"
                      placeholder="รายงานผลการฝึกงาน"
                      required
                      defaultValue={editData?.title || ''}
                    />
                  </div>
                  <div className="my-3">
                    <div className="mb-3 block">
                      <Label htmlFor="description">รายละเอียด</Label>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="รายละเอียดเพิ่มเติม"
                      rows={4}
                      required
                      defaultValue={editData?.description || ''}
                    />
                  </div>
                  <div className="my-3">
                    <Label className="mb-2 block" htmlFor="file-upload-helper-text">
                      อัพโหลดรูปภาพ
                    </Label>
                    <FileInput id="file-upload-helper-text" accept="image/png, image/jpeg" name="image" />
                  </div>
                  <div className="w-full flex mt-6 text-end justify-end">
                    <Button type="submit">รายงานผล</Button>
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
                      <td key={cell.id} className="whitespace-nowrap border border-ld py-3 px-2 xxl:px-4">
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


    </>


  );
};

export default InternReport;
