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
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPlus,
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
import { ThaiDatePicker } from "@/app/components/ThaiDatePicker"
import { showToast } from "@/app/components/sweetalert/sweetalert"
import { validateThaiID } from "@/lib/thaiIdVaildate"
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

interface PaginationTableType {
  id?: string
  citizenId: string
  user_img: string
  student: {
    id: string
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
    }[]
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

const BulkInternshipManagement = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [selected, setSelected] = useState<boolean>(false)
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [majorFilter, setMajorFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [roomFilter, setRoomFilter] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  const [openAdd, setOpenAdd] = useState(false)

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const rerender = React.useReducer(() => ({}), {})[1]
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    firstname: "",
    lastname: "",
    phone: "",
    citizenId: "",
    studentIds: [] as string[],
    startDate: "",
    endDate: "",
  })

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      firstname: "",
      lastname: "",
      phone: "",
      studentIds: [],
      citizenId: "",
      startDate: "",
      endDate: "",
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const studentIds = Array.from(selectedStudents)

    // 1. ตรวจสอบว่ามีนักศึกษาถูกเลือกหรือไม่ (แม้ว่า UI จะบังคับก็ตาม)
    if (studentIds.length === 0) {
      showToast("กรุณาเลือกนักศึกษาที่ต้องการเพิ่มข้อมูล", "warning")
      setLoading(false)
      return
    }

    // 2. ตรวจสอบเลขบัตรประชาชน
    if (!validateThaiID(formData.citizenId)) {
      showToast("เลขบัตรประจำตัวประชาชนไม่ถูกต้อง", "warning")
      setLoading(false)
      return
    }

    try {
      // 3. ส่งข้อมูลไปยัง API
      formData.studentIds = studentIds
      const response = await fetch("/api/company", {
        // หมายเหตุ: API endpoint นี้ของคุณ ต้องรองรับการรับ "studentIds" ด้วย
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล")
      }

      // 4. จัดการเมื่อสำเร็จ
      showToast("เพิ่มข้อมูลสถานประกอบการและนักศึกษาเรียบร้อยแล้ว", "success")
      resetForm()
      setSelectedStudents(new Set()) // <-- เพิ่ม: ล้างรายชื่อนักศึกษาที่เลือก
      setOpenAdd(false) // <-- เพิ่ม: ปิด Dialog หลังจากบันทึกสำเร็จ
      mutate() // <-- โหลดข้อมูลตารางใหม่
    } catch (error) {
      showToast(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มข้อมูล", "error")
    } finally {
      setLoading(false)
    }
  }
  const {
    data: academicYears,
    error: yearError,
    isLoading: yearLoading,
  } = useSWR<TermYear[]>("/api/academic_year", fetcher)
  const { data, error, isLoading, mutate } = useSWR<PaginationTableType[]>(
    !selected
      ? "/api/students/getByDepartment"
      : `/api/students/getByDepartment?term=${selectedTerm}&year=${selectedYear}`,
    fetcher,
  )
  // const { data: companyData, error: companyError, isLoading: companyLoading } = useSWR<Company[]>('/api/company', fetcher);

  const stdData = data ?? []

  const nameFilterFn: FilterFn<PaginationTableType> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase()
    const firstName = row.original.firstname?.toLowerCase() || ""
    const lastName = row.original.lastname?.toLowerCase() || ""
    const studentId = row.original.student.studentId.toLowerCase()
    return firstName.includes(searchTerm) || lastName.includes(searchTerm) || studentId.includes(searchTerm)
  }

  const filteredStudents = useMemo(() => {
    if (!data) return []

    return data.filter((student) => {
      const matchesMajor = majorFilter === "all" || student.student.major.major_name === majorFilter
      const studentGradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`
      const matchesGrade = gradeFilter === "all" || studentGradeCombo === gradeFilter
      const matchesRoom = roomFilter === "all" || student.student.room === roomFilter

      return matchesMajor && matchesGrade && matchesRoom
    })
  }, [data, majorFilter, gradeFilter, roomFilter])

  const availableGrades = useMemo(() => {
    if (!data) return []
    const gradesSet = new Set<string>()
    data.forEach((student) => {
      const gradeCombo = `${student.student.education.name}.${student.student.gradeLevel}`
      gradesSet.add(gradeCombo)
    })
    return Array.from(gradesSet).sort()
  }, [data])

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

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(() => {
      if (!checked) return new Set()

      const selectableIds = table
        .getFilteredRowModel()
        .rows.filter(
          (row) => !row.original.student.studentCompanies || row.original.student.studentCompanies.length === 0,
        )
        .map((row) => String(row.original.student.id))

      return new Set(selectableIds)
    })
  }

  const handleSelectStudent = (id: string, checked: boolean) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev)
      if (checked) newSet.add(id)
      else newSet.delete(id)
      return newSet
    })
  }
  const handleDialogClose = () => {
    setOpenAdd(false)
    if (!loading) {
      resetForm()
    }
  }

  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const availableStudents = table
          .getFilteredRowModel()
          .rows.filter(
            (row) => !row.original.student.studentCompanies || row.original.student.studentCompanies.length === 0,
          )
        const allSelected =
          availableStudents.length > 0 &&
          availableStudents.every((row) => selectedStudents.has(String(row.original.student.id)))

        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
            disabled={availableStudents.length === 0}
          />
        )
      },
      cell: (info) => {
        const hasInternship =
          info.row.original.student.studentCompanies && info.row.original.student.studentCompanies.length > 0

        return (
          <Checkbox
            checked={selectedStudents.has(String(info.row.original.student.id))}
            onCheckedChange={(checked) => handleSelectStudent(String(info.row.original.student.id), !!checked)}
            disabled={hasInternship}
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
        const internshipArray = info.row.original.student.studentCompanies
        const hasInternship = internshipArray && internshipArray.length > 0
        const companyName = hasInternship && internshipArray[0]?.company?.name

        return hasInternship ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">{companyName || "ไม่ระบุชื่อบริษัท"}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">ยังไม่มีข้อมูล</span>
        )
      },
    }),
  ]

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
  })

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

  const studentsWithoutInternship = filteredStudents.filter(
    (s) => !s.student.studentCompanies || s.student.studentCompanies.length === 0,
  ).length

  return (
    <>
      <div className="mb-4">
        <Button color="gray" onClick={() => router.back()} className="flex items-center gap-2">
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
                <Button size="sm" color="gray" onClick={() => setSelectedStudents(new Set())}>
                  ยกเลิกทั้งหมด
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <IconPlus size={16} className="mr-2" />
                      เพิ่มสถานประกอบการ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <IconBuilding size={20} />
                        เพิ่มข้อมูลสถานประกอบการใหม่
                      </DialogTitle>
                      <DialogDescription>กรอกข้อมูลสถานประกอบการใหม่ให้ครบถ้วน</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Company Information */}
                      <div className="space-y-2">
                        <Label htmlFor="name">ชื่อสถานประกอบการ *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="ชื่อสถานประกอบการ"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">ที่อยู่ *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="ที่อยู่สถานประกอบการ"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            วันที่เริ่มฝึกงาน
                          </label>
                          <ThaiDatePicker
                            value={formData.startDate}
                            onChange={(v) => handleInputChange("startDate", v)}
                            placeholder="เลือกวัน/เดือน/ปี"
                            className="bg-gray-50 border border-gray-300 rounded-lg p-2.5"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            วันที่สิ้นสุดฝึกงาน
                          </label>
                          <ThaiDatePicker
                            value={formData.endDate}
                            onChange={(v) => handleInputChange("endDate", v)}
                            placeholder="เลือกวัน/เดือน/ปี"
                            className="bg-gray-50 border border-gray-300 rounded-lg p-2.5"
                          />
                        </div>
                      </div>

                      {/* Contact Person Information */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">ข้อมูลผู้ติดต่อ</h3>

                        <div className="space-y-2 mb-3">
                          <Label htmlFor="citizenId">เลขบัตรประจำตัวประชาชน *</Label>
                          <Input
                            id="citizenId"
                            value={formData.citizenId}
                            onChange={(e) => handleInputChange("citizenId", e.target.value)}
                            placeholder="เลขบัตรประจำตัวประชาชน"
                            inputMode="numeric"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstname">ชื่อ *</Label>
                            <Input
                              id="firstname"
                              value={formData.firstname}
                              onChange={(e) => handleInputChange("firstname", e.target.value)}
                              placeholder="ชื่อ"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastname">นามสกุล *</Label>
                            <Input
                              id="lastname"
                              value={formData.lastname}
                              onChange={(e) => handleInputChange("lastname", e.target.value)}
                              placeholder="นามสกุล"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mt-3">
                          <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="เบอร์โทรศัพท์"
                          />
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button type="button" onClick={handleDialogClose} disabled={loading}>
                          ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? "กำลังเพิ่มข้อมูล..." : "เพิ่มข้อมูล"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
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
            <span className="font-semibold text-green-600">
              {filteredStudents.length - studentsWithoutInternship} คน
            </span>
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
                      <tr
                        key={row.id}
                        className={
                          row.original.student.studentCompanies && row.original.student.studentCompanies.length > 0
                            ? "bg-gray-50 dark:bg-gray-800/50"
                            : ""
                        }
                      >
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
export default BulkInternshipManagement
