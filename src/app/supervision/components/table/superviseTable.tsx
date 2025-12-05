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

import { Button, Select, Spinner, Card, Textarea } from "flowbite-react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconClipboardText, // ไอคอนสำหรับการนิเทศ
} from "@tabler/icons-react"
import { Icon } from "@iconify/react"
import TitleIconCard from "@/app/components/shared/TitleIconCard"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input"
import { Skeleton } from "@/app/components/shadcn-ui/Default-Ui/skeleton"
import { Checkbox } from "@/app/components/shadcn-ui/Default-Ui/checkbox"
import { Alert, AlertTitle } from "@/app/components/shadcn-ui/Default-Ui/alert"
import { AlertCircleIcon, CheckCircle2 } from "lucide-react"
import { showToast } from "@/app/components/sweetalert/sweetalert"
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/dialog"

// Interface สำหรับข้อมูลนักศึกษา
interface PaginationTableType {
  id?: string
  citizenId: string
  user_img: string
  student: {
    id: string // เราจะใช้ ID นี้ในการส่งข้อมูล
    studentId: string
    term: string
    education: {
      name: string
    }
    major: {
      id: string
      major_name: string
    }
    academicYear: string
    room: string
    gradeLevel: string
    department: {
      id: string
      depname: string
    }
    studentCompanies?: {
      id: string
      company: {
        name: string
      }
      supervisions: {
        studentId: string
      }[],
    }[]
  }
  firstname?: string
  lastname?: string
}

// Interface สำหรับปีการศึกษา
type TermYear = {
  term: string
  academicYear: string
}

const columnHelper = createColumnHelper<PaginationTableType>()
const fetcher = async (url: string) => await fetch(url).then((res) => res.json())

// Component แสดงแถว Skeleton ขณะโหลด
const SkeletonRow = () => (
  <tr className="border-b border-ld">
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-4" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-4" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-32" />
      </div>
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-40" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-6 w-32" />
    </td>
  </tr>
)

// Component หลัก
const SuperviseTable = () => {
  // States สำหรับตาราง
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // States สำหรับ Filter
  const [selected, setSelected] = useState<boolean>(false)
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [majorFilter, setMajorFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [roomFilter, setRoomFilter] = useState<string>("all")

  // State สำหรับนักศึกษาที่ถูกเลือก
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  // States สำหรับ Dialog การนิเทศ
  const [openSupervisionDialog, setOpenSupervisionDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const rerender = React.useReducer(() => ({}), {})[1]

  // State สำหรับฟอร์มข้อมูลการนิเทศ
  const [supervisionData, setSupervisionData] = useState({
    notes: "",
    supervisionDate: new Date().toISOString().split("T")[0], // ค่าเริ่มต้นเป็นวันนี้
    supervisionType: "ON_SITE",
  })

  // Handler เมื่อข้อมูลในฟอร์มการนิเทศเปลี่ยนแปลง
  const handleSupervisionChange = (name: string, value: string) => {
    setSupervisionData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Reset ฟอร์มการนิเทศ
  const resetSupervisionForm = () => {
    setSupervisionData({
      notes: "",
      supervisionDate: new Date().toISOString().split("T")[0],
      supervisionType: "ON_SITE",
    })
  }

  // Handler สำหรับการ Submit ฟอร์มการนิเทศ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const studentIds = Array.from(selectedStudents)

    // ตรวจสอบข้อมูล
    if (studentIds.length === 0) {
      showToast("กรุณาเลือกนักศึกษาที่ต้องการบันทึกการนิเทศ", "warning")
      setLoading(false)
      return
    }
    if (!supervisionData.supervisionDate) {
      showToast("กรุณากรอกข้อมูลการนิเทศให้ครบถ้วน (วันที่)", "warning")
      setLoading(false)
      return
    }

    try {
      // ส่งข้อมูลไปยัง API Route
      const response = await fetch("/api/supervision/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: studentIds,
          ...supervisionData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/signin")
        }
        throw new Error(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
      }

      // เมื่อสำเร็จ
      showToast(`บันทึกการนิเทศสำหรับนักศึกษา ${studentIds.length} คนเรียบร้อยแล้ว`, "success")
      resetSupervisionForm()
      setSelectedStudents(new Set())
      setOpenSupervisionDialog(false)
      mutate() // โหลดข้อมูลตารางใหม่
    } catch (error) {
      showToast(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error")
    } finally {
      setLoading(false)
    }
  }

  // SWR Hooks สำหรับดึงข้อมูล
  const {
    data: academicYears,
    error: yearError,
    isLoading: yearLoading,
  } = useSWR<TermYear[]>("/api/academic_year", fetcher)

  const { data, error, isLoading, mutate } = useSWR<PaginationTableType[]>(
    !selected
      ? "/api/students/getByDepartment" // ดึงข้อมูลนักเรียนทั้งหมด
      : `/api/students/getByDepartment?term=${selectedTerm}&year=${selectedYear}`, // ดึงตามปีการศึกษา
    fetcher,
  )

  // !!! SWR นี้สำหรับดึงข้อมูลอาจารย์มาใส่ใน Dropdown !!!
  // const { data: teachers, error: teacherError } = useSWR<any[]>('/api/teachers', fetcher);

  const stdData = data ?? []

  // Filter Function สำหรับการค้นหาชื่อ/รหัส
  const nameFilterFn: FilterFn<PaginationTableType> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase()
    const firstName = row.original.firstname?.toLowerCase() || ""
    const lastName = row.original.lastname?.toLowerCase() || ""
    const studentId = row.original.student.studentId.toLowerCase()
    return firstName.includes(searchTerm) || lastName.includes(searchTerm) || studentId.includes(searchTerm)
  }

  // กรองข้อมูลนักศึกษา (แสดงเฉพาะคนที่มีที่ฝึกงานแล้ว)
  const filteredStudents = useMemo(() => {
    if (!data) return []

    return data.filter((student) => {
      // ตรรกะสำคัญ: ต้องมีที่ฝึกงานแล้วเท่านั้น
      const hasInternship = student.student.studentCompanies && student.student.studentCompanies.length > 0
      if (!hasInternship) return false // ถ้าไม่มีที่ฝึกงาน ให้ข้ามไปเลย

      // ตรรกะการกรองอื่นๆ (สาขา, ระดับชั้น, ห้อง)
      const matchesMajor = majorFilter === "all" || student.student.major.major_name === majorFilter
      const studentGradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`
      const matchesGrade = gradeFilter === "all" || studentGradeCombo === gradeFilter
      const matchesRoom = roomFilter === "all" || student.student.room === roomFilter

      return matchesMajor && matchesGrade && matchesRoom
    })
  }, [data, majorFilter, gradeFilter, roomFilter])

  // ดึงข้อมูล "ระดับชั้น" ที่ไม่ซ้ำกันสำหรับ Dropdown
  const availableGrades = useMemo(() => {
    if (!data) return []
    const gradesSet = new Set<string>()
    data.forEach((student) => {
      const gradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`
      gradesSet.add(gradeCombo)
    })
    return Array.from(gradesSet).sort()
  }, [data])

  // ดึงข้อมูล "ห้อง" ที่ไม่ซ้ำกันสำหรับ Dropdown
  const availableRooms = useMemo(() => {
    if (!data) return []
    const roomsSet = new Set<string>()
    data.forEach((student) => {
      if (majorFilter === "all" || student.student.major.major_name === majorFilter) {
        roomsSet.add(student.student.room)
      }
    })
    return Array.from(roomsSet)
  }, [data, majorFilter])

  // Handler เมื่อกด "เลือกทั้งหมด"
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allStudentIds = new Set(filteredStudents.map((s) => String(s.student.id)))
      setSelectedStudents(allStudentIds)
    } else {
      setSelectedStudents(new Set())
    }
  }

  // Handler เมื่อเลือกนักศึกษาทีละคน
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents)
    if (checked) {
      newSelected.add(studentId)
    } else {
      newSelected.delete(studentId)
    }
    setSelectedStudents(newSelected)
  }

  // Handler ปิด Dialog
  const handleDialogClose = () => {
    setOpenSupervisionDialog(false)
    if (!loading) {
      resetSupervisionForm()
    }
  }

  // กำหนดคอลัมน์สำหรับตาราง
  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const totalRows = table.getFilteredRowModel().rows.length;
        const isAllSelected = totalRows > 0 && selectedStudents.size === totalRows;

        return (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => {

              if (checked) {
                const allStudentIds = new Set(filteredStudents.map((s) => String(s.student.id)))
                setSelectedStudents(allStudentIds)
              } else {
                setSelectedStudents(new Set())
              }
            }}
            disabled={totalRows === 0}
          />
        )
      },
      cell: (info) => {
        return (
          <Checkbox
            checked={selectedStudents.has(String(info.row.original.student.id))}
            onCheckedChange={(checked) => handleSelectStudent(String(info.row.original.student.id), !!checked)}
          />
        )
      },
    }),
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <div className="text-base">{info.row.index + 1}</div>,
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
              src={info.row.original.user_img ? `/uploads/${info.row.original.user_img}` : "/default-user.png"}
              width={50}
              height={50}
              alt="user"
              className="object-cover"
              unoptimized={true}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/default-user.png"
              }}
            />
          </div>
          <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue()} ${info.row.original.lastname}`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">{info.row.original.student.education.name}</p>
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
    columnHelper.accessor((row) => row.student.education.name, {
      id: "education",
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue()}.${info.row.original.student.gradeLevel
            }/${info.row.original.student.room}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            ปีการศึกษา: {`${info.row.original.student.term}/${info.row.original.student.academicYear}`}
          </p>
        </div>
      ),
      header: () => <span>ระดับชั้น</span>,
    }),

    columnHelper.display({
      id: "supervision-status",
      header: () => <span>สถานะ</span>,
      cell: (info) => {
        const internshipArray = info.row.original.student.studentCompanies
        const hasSupervision =
          internshipArray &&
          internshipArray.length > 0 &&
          internshipArray[0].supervisions &&
          internshipArray[0].supervisions.length > 0

        return hasSupervision ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">นิเทศแล้ว {internshipArray[0].supervisions.length} ครั้ง</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">ยังไม่มีข้อมูล</span>
        )
      },
    }),
  ]

  // สร้างตาราง
  const table = useReactTable({
    data: filteredStudents, // ใช้ data ที่กรองแล้ว (เฉพาะคนมีที่ฝึกงาน)
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
  })

  // UI ขณะโหลดข้อมูลปีการศึกษา
  if (yearLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  // UI เมื่อเกิด Error
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
        <Button color="gray" onClick={() => router.back()} className="flex items-center gap-2">
          <Icon icon="tabler:arrow-left" height={18} />
          ย้อนกลับ
        </Button>
      </div>

      <TitleIconCard title="บันทึกการนิเทศนักศึกษา (เลือกหลายคน)">
        {/* แถบ Action เมื่อมีการเลือกนักศึกษา */}
        {selectedStudents.size > 0 && (
          <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:clipboard-check" className="text-blue-600" height={24} />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    เลือกแล้ว {selectedStudents.size} คน (พร้อมสำหรับการนิเทศ)
                  </span>
                </div>
                <Button size="sm" color="gray" onClick={() => setSelectedStudents(new Set())}>
                  ยกเลิกทั้งหมด
                </Button>
              </div>

              {/* ปุ่มเปิด Dialog สำหรับบันทึกการนิเทศ */}
              <div>
                <Dialog open={openSupervisionDialog} onOpenChange={setOpenSupervisionDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
                      <IconClipboardText size={16} className="mr-2" />
                      บันทึกการนิเทศ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <IconClipboardText size={20} />
                        บันทึกข้อมูลการนิเทศ
                      </DialogTitle>
                      <DialogDescription>
                        ข้อมูลนี้จะถูกบันทึกให้กับนักศึกษาที่เลือกทั้งหมด {selectedStudents.size} คน
                      </DialogDescription>
                    </DialogHeader>

                    {/* ฟอร์มสำหรับบันทึกการนิเทศ */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      {/* เลือกวันที่ และ ประเภท */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supervisionDate">วันที่นิเทศ *</Label>
                          <Input
                            id="supervisionDate"
                            type="date"
                            value={supervisionData.supervisionDate}
                            onChange={(e) => handleSupervisionChange("supervisionDate", e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="supervisionType">ประเภทการนิเทศ *</Label>
                          <Select
                            id="supervisionType"
                            value={supervisionData.supervisionType}
                            onChange={(e) => handleSupervisionChange("supervisionType", e.target.value)}
                            required
                          >
                            <option value="ON_SITE">ไปนิเทศที่บริษัท (ON_SITE)</option>
                            <option value="ONLINE">นิเทศออนไลน์ (ONLINE)</option>
                            <option value="PHONE">โทรศัพท์ติดตามผล (PHONE)</option>
                          </Select>
                        </div>
                      </div>

                      {/* บันทึกข้อเสนอแนะ */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">บันทึก/ข้อเสนอแนะ</Label>
                        <Textarea
                          id="notes"
                          value={supervisionData.notes}
                          onChange={(e) => handleSupervisionChange("notes", e.target.value)}
                          placeholder="เช่น การปรับตัวของนักศึกษา, ปัญหาที่พบ, ข้อเสนอแนะจากพี่เลี้ยง..."
                          rows={4}
                          className="block w-full text-sm"
                        />
                      </div>

                      <DialogFooter className="gap-2">
                        <Button type="button" color="gray" onClick={handleDialogClose} disabled={loading}>
                          ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading} color="primary">
                          {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        )}

        {/* ส่วนควบคุมการค้นหาและ Filter */}
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
            {[...new Set(stdData.map((std) => std.student.major.major_name))].map((major, index) => (
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
            value={`${selectedTerm}/${selectedYear}`}
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

        {/* สถิติ (แสดงเฉพาะนักศึกษาที่มีที่ฝึกงาน) */}
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">นักศึกษาที่มีที่ฝึกงาน (ตามตัวกรอง):</span>
            <span className="font-semibold text-green-600">{filteredStudents.length} คน</span>
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <div className="border rounded-md border-ld overflow-hidden">
          {isLoading ? (
            // UI ขณะโหลด
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
            // UI เมื่อ Error
            <div className="p-4 text-center text-red-500">Error loading student data</div>
          ) : !filteredStudents || filteredStudents.length === 0 ? (
            // UI เมื่อไม่พบข้อมูล
            <div className="flex flex-col items-center justify-center py-8">
              <Icon icon="tabler:database-off" className="text-gray-400 text-4xl mb-2" />
              <span className="text-gray-500">ไม่พบนักศึกษาที่มีที่ฝึกงาน (ตามตัวกรอง)</span>
            </div>
          ) : (
            // UI เมื่อมีข้อมูล
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

              {/* ส่วนควบคุม Pagination */}
              <div className="sm:flex gap-2 p-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button color="primary" onClick={() => rerender()}>
                    รีโหลดข้อมูล
                  </Button>
                  <h1 className="text-gray-700">{table.getPrePaginationRowModel().rows.length} แถว</h1>
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
                    <Button color="gray" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
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
  )
}
export default SuperviseTable
