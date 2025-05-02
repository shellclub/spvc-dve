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
import { Badge, Button, Dropdown } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import { maskCitizenId, userRole, userSex } from "@/lib/utils";
import Image from "next/image";
export interface PaginationTableType {
  id?:  string;
  citizenId: string;
  user_img: string;
  student: {
    studentId: string;
    term: string;
    education: {
      name: string;
    }
    
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



const columnHelper = createColumnHelper<PaginationTableType>();

const StudentTable = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [data, setData] = useState<PaginationTableType[]>([])
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];
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
        const res = await fetch(`/api/users/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if(!res.ok) {
          const err = await res.json();
          showToast(err.message, err.type);
        }else {
          const data = await res.json();
          showToast(data.message, data.type);
          router.refresh();
        }
      }
    });

  }


  async function handleSubmitUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/upload-excel", {
      method: "POST",
      body: formData,
    });
    if(res.ok) {
      setOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    }
    const data = await res.json();
    showToast(data.message || data.error, data.type)

  }

  useEffect(() => {
    const fetchUser = async () => {
      const hooks = await fetch("/api/students",{
        cache: "no-store",
        headers: {
          "Content-Type": "application/json"
        }
      })
      if(!hooks.ok) {
        const res = await hooks.json();
        console.log(res);
      }

      const res = await hooks.json();
      setData(res);
    }
    fetchUser();
  },[])


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
            <Image
            src={`/uploads/${info.row.original.user_img}`}
            width={50}
            height={50}
            alt="icon"
            className="h-10 w-10 rounded-xl"
          />
          <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue()} ${info.row.original.lastname}`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
              {userRole(Number(info.row.original.role))}
            </p>
          </div>
          
        </div>
      ),
      header: () => <span>ผู้ใช้</span>,
    }),
    columnHelper.accessor("sex", {
      cell: (info) => (
        
        <div className="text-base">
        {userSex(Number(info.getValue()))}
      </div>
        
      ),
      header: () => <span>เพศ</span>,
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
    columnHelper.accessor((row) => row.student.education.name, {
      id: "education",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue()}`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
            ปีการศึกษา: {`${info.row.original.student.term}/${info.row.original.student.academicYear}`}
          </p>
          
        </div>
        
      ),
      header: () => <span>ระดับชั้น</span>,
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
            { icon: "tabler:eye", listtitle: "รายละเอียด", onclick: () => router.push(`/admin/students/${info.row.original.id}`) },
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
    data,
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
      <div className=" flex justify-end items-center my-6 ">
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button color={`success`} className="mx-2">Import Excel</Button>

      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>อัปโหลดไฟล์ Excel</DialogTitle>
          <DialogDescription>
            กรุณาอัปโหลดไฟล์ .xlsx ที่มีคอลัมน์ name และ price
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitUpload} encType="multipart/form-data">
          <input
            type="file"
            name="excel"
            accept=".xlsx"
            required
            className="mb-4 border rounded p-2 w-full"
          />
          <Button type="submit" className="w-full">
            อัปโหลด
          </Button>
        </form>
      </DialogContent>
    </Dialog>


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
                    <td key={cell.id} className="whitespace-nowrap border py-3 px-2 xxl:px-4">
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

export default StudentTable;
