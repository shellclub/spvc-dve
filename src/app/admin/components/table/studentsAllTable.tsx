"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/app/components/shadcn-ui/Default-Ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/shadcn-ui/Default-Ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/shadcn-ui/Default-Ui/table"
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/shadcn-ui/Default-Ui/select"
import Image from "next/image"
import { IconDots, IconEye, IconTrash } from "@tabler/icons-react"
import useSWR from "swr"
import { Skeleton } from "@/app/components/shadcn-ui/Default-Ui/skeleton"
import Swal from "sweetalert2"
import { showToast } from "@/app/components/sweetalert/sweetalert"

import { filterFns } from "@tanstack/react-table"
import type { FilterFn } from "@tanstack/react-table"


export type Student = {
  id: string
  firstname: string
  lastname: string
  sex: number
  role: number
  user_img: string
  student: {
    studentId: string
    major: string
    room: string
    term: string
    academicYear: string
    education: {
      name: string
    },
    gradeLevel: string
  }
  department: {
    depname: string
  }
}

export type Department = {
  id: string
  depname: string
}

// Helper functions
const userRole = (role: number) => {
  switch (role) {
    case 3: return "นักศึกษา"
    case 2: return "อาจารย์"
    case 1: return "ผู้ดูแลระบบ"
    default: return "ไม่ระบุ"
  }
}

const userSex = (sex: number) => {
  switch (sex) {
    case 1: return "ชาย"
    case 2: return "หญิง"
    default: return "ไม่ระบุ"
  }
}

const SkeletonRow = () => (
    <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  )

const fetcher = (url: string) => fetch(url).then(res => res.json()) 

export function StudentsAllTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [departmentFilter, setDepartmentFilter] = React.useState<string>('all')

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
          await mutate();
        }
      }
    });
  }

  const handleView = (id: string) => {
    console.log("View student:", id)
    // Add your view logic here
    // router.push(`/admin/students/${id}`)
  }

  const columns: ColumnDef<Student>[] = [
    {
      id: "index",
      header: () => <span>#</span>,
      cell: ({ row }) => (
        <div className="text-base">
          {row.index + 1}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "student.studentId",
      header: () => <span>รหัสนักศึกษา</span>,
      cell: ({ row }) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{row.original.student.studentId}</h6>
        </div>
      ),
    },
    {
      accessorKey: "firstname",
      header: () => <span>ผู้ใช้</span>,
      cell: ({ row }) => (
        <div className="flex gap-3 items-center">
          <Image
            src={`/uploads/${row.original.user_img}`}
            width={50}
            height={50}
            alt="icon"
            className="h-10 w-10 rounded-xl"
          />
          <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${row.original.firstname} ${row.original.lastname}`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
              {userRole(Number(row.original.role))}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sex",
      header: () => <span>เพศ</span>,
      cell: ({ row }) => (
        <div className="text-base">
          {userSex(Number(row.getValue("sex")))}
        </div>
      ),
    },
    {
      accessorKey: "department.depname",
      header: () => <span>แผนกวิชา</span>,
      cell: ({ row }) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{row.original.department.depname}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {row.original.student.major}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "student.education.name",
      header: () => <span>ระดับชั้น</span>,
      cell: ({ row }) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${row.original.student.education.name}.${row.original.student.gradeLevel}/${row.original.student.room}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            ปีการศึกษา: {`${row.original.student.term}/${row.original.student.academicYear}`}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDots size={22} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleView(student.id)}
                className="flex gap-3  bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <IconEye size={18} />
                <span>รายละเอียด</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(student.id)}
                className="flex gap-3  bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-800 text-red-600"
              >
                <IconTrash size={18} />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const nameFilterFn: FilterFn<Student> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase();
    const firstName = row.original.firstname.toLowerCase();
    const lastName = row.original.lastname.toLowerCase();
    return firstName.includes(searchTerm) || lastName.includes(searchTerm);
  };

  // Fetch students data
  const { data: stdData, isLoading, error, mutate } = useSWR('/api/students', fetcher);
  
  // Fetch departments data
  const { data: deptData, isLoading: isDeptLoading } = useSWR('/api/departments', fetcher);
  
  const departments: Department[] = deptData ?? [];
  const allStudents: Student[] = stdData ?? [];

  // Filter students based on selected department
  const filteredStudents = React.useMemo(() => {
    if (departmentFilter === 'all') {
      return allStudents;
    }
    return allStudents.filter(student => student.department.depname === departmentFilter);
  }, [allStudents, departmentFilter]);

  const table = useReactTable({
    data: filteredStudents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: nameFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="ค้นหาชื่อ นามสกุล..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="เลือกแผนกวิชา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">ทุกแผนกวิชา</SelectItem>
            {isDeptLoading ? (
              <SelectItem value="loading" disabled>กำลังโหลด...</SelectItem>
            ) : (
              departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.depname} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                  {dept.depname}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className={`text-gray-900 dark:text-gray-100 ${
                        header.id === 'select' ? 'w-12' : 
                        header.id === 'index' ? 'w-16' : 
                        header.id === 'student_studentId' ? 'w-40' : 
                        header.id === 'sex' ? 'w-20' : 
                        header.id === 'actions' ? 'w-20' : 
                        header.id === 'student_education_name' ? 'w-48' : 
                        header.id === 'department_depname' ? 'w-64' : 
                        ''
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {departmentFilter === 'all' 
                    ? 'ไม่พบข้อมูลนักศึกษา' 
                    : `ไม่พบข้อมูลนักศึกษาในแผนก ${departmentFilter}`
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          แสดง {table.getFilteredRowModel().rows.length} จาก {allStudents.length} รายการ
          {departmentFilter !== 'all' && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามแผนก: {departmentFilter})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}