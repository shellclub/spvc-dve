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
  SortingState,
  VisibilityState,
  FilterFn,
} from "@tanstack/react-table";

import {  Button, Dropdown, Modal, ModalBody, ModalHeader, Select, Spinner } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Skeleton } from "@/app/components/shadcn-ui/Default-Ui/skeleton";
import {
  Alert,
  AlertTitle,
} from "@/app/components/shadcn-ui/Default-Ui/alert";
import { AlertCircleIcon } from "lucide-react";

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
    major: {
      id: string;
      major_name: string;
    };
    academicYear: string;
    room: string;
    gradeLevel: string;
    department: {
      id: string;
      depname: string;
    };
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

type Department = {
  id: string;
  depname: string;
};

const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = async (url: string) => await fetch(url).then(res => res.json());

// Skeleton Loading Component
const SkeletonRow = () => (
  <tr className="border-b border-ld">
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-4" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </td>
    <td className="py-3 px-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
    </td>
    <td className="py-3 px-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-8 w-8" />
    </td>
  </tr>
);

const StudentTable = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    id: "",
    company: ""
  });
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];
  
  const { data: academicYears, error: yearError, isLoading: yearLoading } = useSWR<TermYear[]>('/api/academic_year', fetcher);
  const { data, error, isLoading, mutate } = useSWR<PaginationTableType[]>(
    !selected ? '/api/students/getByDepartment' : `/api/students/getByDepartment?term=${selectedTerm}&year=${selectedYear}`, 
    fetcher
  );

  const { data: companyData, error: companyError, isLoading: companyLoading } = useSWR('/api/company', fetcher)
  const stdData = data ?? [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

  };
  // Filter function for name search
  const nameFilterFn: FilterFn<PaginationTableType> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase();
    const firstName = row.original.firstname?.toLowerCase() || '';
    const lastName = row.original.lastname?.toLowerCase() || '';
    const studentId = row.original.student.studentId.toLowerCase();
    return firstName.includes(searchTerm) || lastName.includes(searchTerm) || studentId.includes(searchTerm);
  };

  // Filter students based on selected filters
  const filteredStudents = React.useMemo(() => {
    if (!data) return [];
    
    return data.filter((student) => {
      const matchesMajor = majorFilter === "all" || student.student.major.major_name === majorFilter;
      const studentGradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`;
      const matchesGrade = gradeFilter === "all" || studentGradeCombo === gradeFilter;
      const matchesRoom = roomFilter === "all" || student.student.room === roomFilter;

      return  matchesMajor && matchesGrade && matchesRoom;
    });
  }, [data, majorFilter, gradeFilter, roomFilter]);



  // Generate available grades
  const availableGrades = React.useMemo(() => {
    if (!data) return [];
    const gradesSet = new Set<string>();
    data.forEach((student) => {
      const gradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`;
      gradesSet.add(gradeCombo);
    });
    return Array.from(gradesSet).sort();
  }, [data]);

  // Generate available rooms based on selected major
  const availableRooms = React.useMemo(() => {
    if (!data) return [];
    const roomsSet = new Set<string>();
    data.forEach((student) => {
      if (majorFilter === "all" || student.student.major.major_name === majorFilter) {
        roomsSet.add(student.student.room);
      }
    });
    return Array.from(roomsSet);
  }, [data, majorFilter]);




       

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
    columnHelper.accessor((row) => row.student.department.depname, {
      id: "department",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue()}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {info.row.original.student.major.major_name}
          </p>
        </div>
      ),
      header: () => <span>แผนกวิชา</span>,
    }),
    columnHelper.accessor((row) => row.student.education.name, {
      id: "education",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue()}.${info.row.original.student.gradeLevel}/${info.row.original.student.room}`}</h6>
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
            { 
              icon: "tabler:plus", 
              listtitle: "เพิ่มข้อมูลการฝึกงาน", 
              onclick: () => setOpen(true)
            },
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
    data: filteredStudents,
    columns,
    filterFns: {
      nameFilter: nameFilterFn,
    },
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: nameFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  if (yearLoading || companyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (yearError || companyError) {
    return (
      <div className="grid w-full max-w-xl items-center h-[80vh] my-auto mx-auto">
        <Alert variant="destructive">
          <AlertCircleIcon className="text-red-600" />
          <AlertTitle className="text-red-600">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <TitleIconCard title="ข้อมูลนักศึกษา">
        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
           <Modal show={open} size="3xl" onClose={() => setOpen(false)} popup>
                       <ModalHeader />
                       <ModalBody>
                       <div className="space-y-6">
                         <h3 className="text-xl font-medium text-gray-900 dark:text-white">จัดการข้อมูลแผนกวิชา</h3>
                         <form onSubmit={handleSubmit}>
                           <div className="mb-3">
                            {/* model body */}
                           </div>
                           <div className="w-full flex mt-6 text-end justify-end">
                               <Button type="submit">ส่งข้อมูล</Button>
                           </div>
                         </form>
                       </div>
                       </ModalBody>
                     </Modal> 
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="ค้นหาชื่อ นามสกุล หรือรหัสนักศึกษา..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>
          

            <Select
              value={majorFilter}
              onChange={(e) => {
                setMajorFilter(e.target.value);
                setRoomFilter("all");
              }}
            >
              <option value="all">สาขาวิชาทั้งหมด</option>
              {[...new Set(stdData.map((std) => std.student.major.major_name))].map((major, index) => (
                <option key={index} value={major}>
                  {major}
                </option>
              ))}
            </Select>

            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="all">ระดับชั้นทั้งหมด</option>
              {availableGrades.map((grade, index) => (
                <option key={index} value={grade}>
                  {grade}
                </option>
              ))}
            </Select>

            <Select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">ห้องทั้งหมด</option>
              {availableRooms.map((room, index) => (
                <option key={index} value={room}>
                  {room}
                </option>
              ))}
            </Select>
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
          </div>

        {/* Academic Year Selection */}
        <div className="flex justify-start mb-3">
          
          <div className="mx-2 flex items-center">
            <p className="text-md">
              ปีการศึกษา: {!selected ? "ทั้งหมด" : `${selectedTerm}/${selectedYear}`}
            </p>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          แสดง {table.getFilteredRowModel().rows.length} จาก {data?.length || 0} รายการ
         
          {majorFilter !== "all" && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามสาขา: {majorFilter})
            </span>
          )}
          {gradeFilter !== "all" && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามระดับชั้น: {gradeFilter})
            </span>
          )}
          {roomFilter !== "all" && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามห้อง: {roomFilter})
            </span>
          )}
        </div>
        
        <div className="border rounded-md border-ld overflow-hidden">
          {isLoading ? (
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
                <tbody>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error loading student data</div>
          ) : !filteredStudents || filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Icon icon="tabler:database-off" className="text-gray-400 text-4xl mb-2" />
              <span className="text-gray-500">
                {majorFilter === "all" && gradeFilter === "all" && roomFilter === "all"
                  ? "ไม่พบข้อมูลนักศึกษา"
                  : "ไม่พบข้อมูลนักศึกษาตามเงื่อนไขที่เลือก"}
              </span>
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