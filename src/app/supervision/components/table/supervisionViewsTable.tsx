"use client"
import React, { useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type FilterFn,
} from "@tanstack/react-table"
import { Button, Select, Spinner, Card } from "flowbite-react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconEye, // ไอคอนสำหรับ "ดู"
  IconListDetails,
} from "@tabler/icons-react"
import { Icon } from "@iconify/react"
import TitleIconCard from "@/app/components/shared/TitleIconCard"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input"
import { Skeleton } from "@/app/components/shadcn-ui/Default-Ui/skeleton"
import { Alert, AlertTitle } from "@/app/components/shadcn-ui/Default-Ui/alert"
import { AlertCircleIcon, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/shadcn-ui/Default-Ui/dialog" // ลบ DialogTrigger เพราะเราเปิด/ปิดด้วย State

// --- Interfaces ---
interface SupervisionRecord {
  id: number
  supervisionDate: string
  type: string
  notes: string | null
  supervisor: {
    user: {
      firstname: string
      lastname: string
    }
  }
}

interface StudentCompanyRecord {
  id: string
  company: {
    name: string
  }
  supervisions: SupervisionRecord[]
}

interface PaginationTableType {
  id?: string
  citizenId: string
  user_img: string
  student: {
    id: string
    studentId: string
    term: string
    academicYear: string
    room: string
    gradeLevel: string
    major: {
      major_name: string
    }
    education: {
      name: string
    }
    department: {
      depname: string
    }
    studentCompanies?: StudentCompanyRecord[]
  }
  firstname?: string
  lastname?: string
}

type TermYear = {
  term: string
  academicYear: string
}

const columnHelper = createColumnHelper<PaginationTableType>()
const fetcher = async (url: string) => await fetch(url).then((res) => res.json())

// --- [เติมเต็ม] SkeletonRow ---
const SkeletonRow = () => (
  <tr className="border-b border-ld">
    <td className="py-3 px-4"><Skeleton className="h-4 w-6" /></td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-32" />
      </div>
    </td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
    <td className="py-3 px-4"><Skeleton className="h-8 w-24" /></td>
  </tr>
)


// Component หลัก
const SupervisionViewTable = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // States สำหรับ Filter
  const [selected, setSelected] = useState<boolean>(false)
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [majorFilter, setMajorFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [roomFilter, setRoomFilter] = useState<string>("all")

  const router = useRouter()

  // State สำหรับเก็บข้อมูลนักเรียนที่กำลัง "ดูรายละเอียด"
  const [viewingStudent, setViewingStudent] = useState<PaginationTableType | null>(null)

  // SWR Hooks
  const {
    data: academicYears,
    error: yearError,
    isLoading: yearLoading,
  } = useSWR<TermYear[]>("/api/academic_year", fetcher)

  const { data, error, isLoading, mutate } = useSWR<PaginationTableType[]>(
    !selected
      ? "/api/students/withSupervisions" // ◀◀◀ API ใหม่
      : `/api/students/withSupervisions?term=${selectedTerm}&year=${selectedYear}`,
    fetcher,
  )
  
  const stdData = data ?? []

  // --- [เติมเต็ม] nameFilterFn ---
  const nameFilterFn: FilterFn<PaginationTableType> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase()
    const firstName = row.original.firstname?.toLowerCase() || ""
    const lastName = row.original.lastname?.toLowerCase() || ""
    const studentId = row.original.student.studentId.toLowerCase()
    return (
      firstName.includes(searchTerm) ||
      lastName.includes(searchTerm) ||
      studentId.includes(searchTerm)
    )
  }

  // --- [เติมเต็ม] availableGrades ---
  const availableGrades = useMemo(() => {
    if (!stdData) return []
    const gradesSet = new Set<string>()
    stdData.forEach((user) => {
      if (user.student) {
        const gradeCombo = `${user.student.education.name}.${user.student.gradeLevel}`
        gradesSet.add(gradeCombo)
      }
    })
    return Array.from(gradesSet).sort()
  }, [stdData])

  // --- [เติมเต็ม] availableRooms ---
  const availableRooms = useMemo(() => {
    if (!stdData) return []
    const roomsSet = new Set<string>()
    stdData.forEach((user) => {
      if (user.student && (majorFilter === "all" || user.student.major.major_name === majorFilter)) {
        roomsSet.add(user.student.room)
      }
    })
    return Array.from(roomsSet)
  }, [stdData, majorFilter])

  // --- [เติมเต็ม & แก้ไข] filteredStudents ---
  const filteredStudents = useMemo(() => {
    if (!stdData) return []
    return stdData.filter((user) => {
      if (!user.student) return false // กรอง user ที่ไม่มีข้อมูล student ทิ้ง

      const hasInternship = user.student.studentCompanies && user.student.studentCompanies.length > 0
      if (!hasInternship) return false 

      const matchesMajor = majorFilter === "all" || user.student.major.major_name === majorFilter
      const studentGradeCombo = `${user.student.education.name}.${user.student.gradeLevel}`
      const matchesGrade = gradeFilter === "all" || studentGradeCombo === gradeFilter
      const matchesRoom = roomFilter === "all" || user.student.room === roomFilter

      return matchesMajor && matchesGrade && matchesRoom // ◀◀◀ แก้ไข: คืนค่าให้ครบ
    })
  }, [stdData, majorFilter, gradeFilter, roomFilter])
  

  // คอลัมน์ (ถูกต้องแล้ว)
  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <div className="text-base">{info.row.index + 1}</div>,
    }),
    columnHelper.accessor("firstname", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-xl overflow-hidden relative">
            <Image
              src={info.row.original.user_img ? `/uploads/${info.row.original.user_img}` : "/default-user.png"}
              width={50} height={50} alt="user" className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/default-user.png" }}
            />
          </div>
          <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue()} ${info.row.original.lastname}`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">{info.row.original.student.studentId}</p>
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
          <p className="text-sm text-darklink dark:text-bodytext">{info.row.original.student.major.major_name}</p>
        </div>
      ),
      header: () => <span>แผนกวิชา</span>,
    }),
    columnHelper.accessor((row) => row.student.studentCompanies?.[0]?.company.name, {
        id: "company",
        header: () => <span>สถานประกอบการ</span>,
        cell: (info) => (
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                    {info.getValue() || "N/A"}
                </span>
            </div>
        )
    }),
    columnHelper.display({
      id: "supervision-count",
      header: () => <span>จำนวนครั้ง (นิเทศ)</span>,
      cell: (info) => {
        const supervisionCount = info.row.original.student.studentCompanies?.[0]?.supervisions?.length || 0
        return (
          <span className={`font-semibold ${supervisionCount > 0 ? "text-blue-600" : "text-gray-500"}`}>
            {supervisionCount} ครั้ง
          </span>
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>รายละเอียด</span>,
      cell: (info) => (
        <Button 
          color="gray" 
          size="sm" 
          onClick={() => setViewingStudent(info.row.original)}
        >
          <IconEye className="h-4 w-4 mr-1" />
          ดูข้อมูล
        </Button>
      ),
    }),
  ]

  // สร้างตาราง
  const table = useReactTable({
    data: filteredStudents, 
    columns,
    filterFns: {
      nameFilter: nameFilterFn,
    },
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
  })

  // --- [เติมเต็ม] UI ขณะโหลด / Error ---
  if (yearLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  if (yearError) {
    return (
      <div className="grid w-full max-w-xl items-center h-[80vh] my-auto mx-auto">
        <Alert variant="destructive">
          <AlertCircleIcon className="text-red-600" />
          <AlertTitle className="text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูล</AlertTitle>
        </Alert>
      </div>
    )
  }


  // UI หลัก
  return (
    <>
      <div className="mb-4">
        {/* --- [เติมเต็ม] ปุ่มย้อนกลับ --- */}
        <Button color="gray" onClick={() => router.back()} className="flex items-center gap-2">
          <Icon icon="tabler:arrow-left" height={18} />
          ย้อนกลับ
        </Button>
      </div>

      <TitleIconCard title="ข้อมูลการนิเทศนักศึกษา">
        
        {/* --- [เติมเต็ม] ส่วนควบคุมการค้นหาและ Filter --- */}
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
              setMajorFilter(e.target.value)
              setRoomFilter("all")
            }}
          >
            <option value="all">สาขาวิชาทั้งหมด</option>
            {[...new Set(stdData.map((user) => user.student.major.major_name))].map((major, index) => (
              <option key={index} value={major}>
                {major}
              </option>
            ))}
          </Select>

          <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="all">ระดับชั้นทั้งหมด</option>
            {availableGrades.map((grade, index) => (
              <option key={index} value={grade}>
                {grade}
              </option>
            ))}
          </Select>

          <Select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
            <option value="all">ห้องทั้งหมด</option>
            {availableRooms.map((room, index) => (
              <option key={index} value={room}>
                {room}
              </option>
            ))}
          </Select>

          <Select
            value={academicYears ? `${selectedTerm}/${selectedYear}` : "all"}
            onChange={(e) => {
              if (e.target.value === "all") {
                setSelectedTerm("")
                setSelectedYear("")
                setSelected(false)
                mutate()
              } else {
                const [term, academicYear] = e.target.value.split("/")
                setSelectedTerm(term)
                setSelectedYear(academicYear)
                setSelected(true)
                mutate()
              }
            }}
          >
            <option value="" hidden>
              เลือกปีการศึกษา
            </option>
            <option value="all">ทั้งหมด</option>
            {academicYears?.map((year, index) => (
              <option key={index} value={`${year.term}/${year.academicYear}`}>
                {`${year.term}/${year.academicYear}`}
              </option>
            ))}
          </Select>
        </div>

        {/* สถิติ */}
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">นักศึกษาที่มีที่ฝึกงาน (ตามตัวกรอง):</span>
            <span className="font-semibold text-green-600">{filteredStudents.length} คน</span>
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <div className="border rounded-md border-ld overflow-hidden">
          {isLoading ? (
            // --- [เติมเต็ม] Skeleton ---
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
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            // --- [เติมเต็ม] Error ---
            <div className="p-4 text-center text-red-500">Error loading student data</div>
          ) : !filteredStudents || filteredStudents.length === 0 ? (
            // --- [เติมเต็ม] ไม่พบข้อมูล ---
            <div className="flex flex-col items-center justify-center py-8">
              <Icon icon="tabler:database-off" className="text-gray-400 text-4xl mb-2" />
              <span className="text-gray-500">ไม่พบนักศึกษาที่มีที่ฝึกงาน (ตามตัวกรอง)</span>
            </div>
          ) : (
            // --- [เติมเต็ม] ตารางจริง ---
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
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
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
              
              {/* --- [เติมเต็ม] Pagination Controls --- */}
              <div className="sm:flex gap-2 p-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button color="primary" onClick={() => mutate()}>
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
                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                        table.setPageIndex(page)
                      }}
                      className="w-16 form-control-input border rounded px-2 py-1"
                    />
                  </div>

                  <div className="select-md sm:mt-0 mt-3">
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={(e) => {
                        table.setPageSize(Number(e.target.value))
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


      {/* Dialog สำหรับแสดงรายละเอียด (ถูกต้องแล้ว) */}
      <Dialog open={!!viewingStudent} onOpenChange={(isOpen) => !isOpen && setViewingStudent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {viewingStudent && ( 
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <IconListDetails size={20} />
                    ประวัติการนิเทศ
                </DialogTitle>
                <DialogDescription>
                  {viewingStudent.firstname} {viewingStudent.lastname} ({viewingStudent.student.studentId})<br/>
                  สถานประกอบการ: {viewingStudent.student.studentCompanies?.[0]?.company.name || "N/A"}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {(!viewingStudent.student.studentCompanies?.[0]?.supervisions || viewingStudent.student.studentCompanies[0].supervisions.length === 0) ? (
                  <p className="text-center text-gray-500">ยังไม่มีประวัติการนิเทศ</p>
                ) : (
                  // วนลูปแสดงประวัติการนิเทศ
                  viewingStudent.student.studentCompanies[0].supervisions.map((supervision, index) => (
                    <Card key={supervision.id} className="bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center">
                        <h5 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          ครั้งที่ {(viewingStudent.student.studentCompanies?.[0]?.supervisions?.length || 0) - index}
                        </h5>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(supervision.supervisionDate).toLocaleDateString("th-TH", {
                            dateStyle: "long"
                          })}
                        </span>
                      </div>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">
                          <strong className="min-w-[100px] inline-block">ผู้นิเทศ:</strong>
                          {supervision.supervisor.user.firstname} {supervision.supervisor.user.lastname}
                        </p>
                        <p className="text-sm">
                          <strong className="min-w-[100px] inline-block">ประเภท:</strong>
                          <span className="uppercase">{supervision.type}</span>
                        </p>
                        <p className="text-sm">
                          <strong className="min-w-[100px] inline-block align-top">บันทึก:</strong>
                          <span className="whitespace-pre-wrap break-words">
                            {supervision.notes || "-"}
                          </span>
                        </p>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
export default SupervisionViewTable