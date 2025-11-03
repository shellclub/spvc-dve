"use client";
import React, { useState, useMemo } from "react";
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

import { Button, Select, Spinner, Card } from "flowbite-react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Skeleton } from "@/app/components/shadcn-ui/Default-Ui/skeleton";
import { Checkbox } from "@/app/components/shadcn-ui/Default-Ui/checkbox";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/app/components/shadcn-ui/Default-Ui/alert";
import { AlertCircleIcon, CheckCircle2 } from "lucide-react";
import { showToast } from "@/app/components/sweetalert/sweetalert";

interface PaginationTableType {
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
    internship?: {
      id: string;
      company: {
        name: string;
      };
    };
  };
  firstname?: string;
  lastname?: string;
}

type TermYear = {
  term: string;
  academicYear: string;
};

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = async (url: string) => await fetch(url).then(res => res.json());

const SkeletonRow = () => (
  <tr className="border-b border-ld">
    <td className="py-3 px-4"><Skeleton className="h-4 w-4" /></td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-4" /></td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-32" />
      </div>
    </td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
    <td className="py-3 px-4"><Skeleton className="h-6 w-32" /></td>
  </tr>
);

const BulkInternshipManagement = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const router = useRouter();
  const rerender = React.useReducer(() => ({}), {})[1];
  
  const { data: academicYears, error: yearError, isLoading: yearLoading } = useSWR<TermYear[]>('/api/academic_year', fetcher);
  const { data, error, isLoading, mutate } = useSWR<PaginationTableType[]>(
    !selected ? '/api/students/getByDepartment' : `/api/students/getByDepartment?term=${selectedTerm}&year=${selectedYear}`, 
    fetcher
  );
  const { data: companyData, error: companyError, isLoading: companyLoading } = useSWR<Company[]>('/api/company', fetcher);

  const stdData = data ?? [];

  const nameFilterFn: FilterFn<PaginationTableType> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase();
    const firstName = row.original.firstname?.toLowerCase() || '';
    const lastName = row.original.lastname?.toLowerCase() || '';
    const studentId = row.original.student.studentId.toLowerCase();
    return firstName.includes(searchTerm) || lastName.includes(searchTerm) || studentId.includes(searchTerm);
  };

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    
    return data.filter((student) => {
      const matchesMajor = majorFilter === "all" || student.student.major.major_name === majorFilter;
      const studentGradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`;
      const matchesGrade = gradeFilter === "all" || studentGradeCombo === gradeFilter;
      const matchesRoom = roomFilter === "all" || student.student.room === roomFilter;

      return matchesMajor && matchesGrade && matchesRoom;
    });
  }, [data, majorFilter, gradeFilter, roomFilter]);

  const availableGrades = useMemo(() => {
    if (!data) return [];
    const gradesSet = new Set<string>();
    data.forEach((student) => {
      const gradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`;
      gradesSet.add(gradeCombo);
    });
    return Array.from(gradesSet).sort();
  }, [data]);

  const availableRooms = useMemo(() => {
    if (!data) return [];
    const roomsSet = new Set<string>();
    data.forEach((student) => {
      if (majorFilter === "all" || student.student.major.major_name === majorFilter) {
        roomsSet.add(student.student.room);
      }
    });
    return Array.from(roomsSet);
  }, [data, majorFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allStudentIds = new Set(
        filteredStudents
          .filter(s => !s.student.internship)
          .map(s => s.student.id)
      );
      setSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkSubmit = async () => {
    if (selectedStudents.size === 0) {
      showToast('กรุณาเลือกนักศึกษาอย่างน้อย 1 คน', 'warning');
      return;
    }

    if (!selectedCompany) {
      showToast('กรุณาเลือกสถานประกอบการ', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const promises = Array.from(selectedStudents).map(studentId =>
        fetch('/api/internship/addInternshipCompany', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: studentId,
            companyId: selectedCompany,
            startDate: startDate || null,
            endDate: endDate || null,
          }),
        })
      );

      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as Response).ok).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showToast(`เพิ่มข้อมูลสำเร็จ ${successCount} คน${failCount > 0 ? ` (ล้มเหลว ${failCount} คน)` : ''}`, 'success');
        mutate();
        setSelectedStudents(new Set());
        setSelectedCompany("");
        setStartDate("");
        setEndDate("");
      } else {
        showToast('ไม่สามารถเพิ่มข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const availableStudents = table.getFilteredRowModel().rows.filter(row => !row.original.student.internship);
        const allSelected = availableStudents.length > 0 && availableStudents.every(row => selectedStudents.has(row.original.student.id));
        
        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
            disabled={availableStudents.length === 0}
          />
        );
      },
      cell: (info) => {
        const hasInternship = info.row.original.student.internship;
        return (
          <Checkbox
            checked={selectedStudents.has(info.row.original.student.id)}
            onCheckedChange={(checked) => handleSelectStudent(info.row.original.student.id, checked as boolean)}
            disabled={!!hasInternship}
          />
        );
      },
    }),
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
      id: "status",
      header: () => <span>สถานะ</span>,
      cell: (info) => {
        const internship = info.row.original.student.internship;
        return internship ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              {internship.company.name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">ยังไม่มีข้อมูล</span>
        );
      },
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

  const studentsWithoutInternship = filteredStudents.filter(s => !s.student.internship).length;

  return (
    <>
      <div className="mb-4">
        <Button
          color="gray"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <Icon icon="tabler:arrow-left" height={18} />
          ย้อนกลับ
        </Button>
      </div>

      <TitleIconCard title="เพิ่มข้อมูลการฝึกงานหลายคน">
        {/* Bulk Action Card */}
        {selectedStudents.size > 0 && (
          <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:users" className="text-blue-600" height={24} />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    เลือกแล้ว {selectedStudents.size} คน
                  </span>
                </div>
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => setSelectedStudents(new Set())}
                >
                  ยกเลิกทั้งหมด
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    สถานประกอบการ <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  >
                    <option value="">เลือกสถานประกอบการ</option>
                    {companyData?.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    วันที่เริ่มฝึกงาน
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    วันที่สิ้นสุดฝึกงาน
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    color="primary"
                    onClick={handleBulkSubmit}
                    disabled={isSubmitting || !selectedCompany}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Icon icon="tabler:check" height={18} className="mr-2" />
                        บันทึกข้อมูล ({selectedStudents.size} คน)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
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

        {/* Stats */}
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">ทั้งหมด:</span>
            <span className="font-semibold">{filteredStudents.length} คน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">ยังไม่มีข้อมูลฝึกงาน:</span>
            <span className="font-semibold text-orange-600">{studentsWithoutInternship} คน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">มีข้อมูลแล้ว:</span>
            <span className="font-semibold text-green-600">{filteredStudents.length - studentsWithoutInternship} คน</span>
          </div>
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
                      <tr key={row.id} className={row.original.student.internship ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
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
                      {[10, 20, 50, 100].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                    <div className="flex gap-1">
                        <Button
                            color="gray"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >   

                            <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            color="gray"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            color="gray"   
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            color="gray"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronsRight className="h-4 w-4" />
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
}
export default BulkInternshipManagement;