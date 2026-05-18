"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import {
  AlertCircleIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/shadcn-ui/Default-Ui/table";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn-ui/Default-Ui/select";
import { IconDots, IconEye, IconTrash } from "@tabler/icons-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/shadcn-ui/Default-Ui/avatar";
import useSWR from "swr";
import { Skeleton } from "@/app/components/shadcn-ui/Default-Ui/skeleton";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import type { FilterFn } from "@tanstack/react-table";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/app/components/shadcn-ui/Default-Ui/alert";
import { useRouter } from "next/navigation";
type PaginationTableType = {
  id: string;
  studentId: string;
  gradeLevel: string;
  room: string;
  term: string;
  academicYear: string;
  user: {
    firstname: string;
    lastname: string;
    citizenId: string;
    sex: string;
    phone: string;
    user_img: string;
    birthday: string;
  };
  department: { id: string } | null;
  major: { id: string } | null;
  education: { id: string } | null;
};
import { validateThaiID } from "@/lib/thaiIdVaildate";

export type Student = {
  id: string;
  studentId: string;
  major: {
    id: string;
    major_name: string;
  } | null;
  room: string;
  term: string;
  academicYear: string;
  education: {
    name: string;
  } | null;
  gradeLevel: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    sex: number;
    role: number;
    user_img: string;
  };
  department: {
    depname: string;
  } | null;
};

export type Department = {
  id: string;
  depname: string;
};
type Education = {
  id: number;
  name: string;
};



const userSex = (sex: number) => {
  switch (sex) {
    case 1:
      return "ชาย";
    case 2:
      return "หญิง";
    default:
      return "ไม่ระบุ";
  }
};

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
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RMS_STUDENT_PIC_BASE =
  "https://rms.spvc.ac.th/files/importpicstd/01";
const RMS_PIC_EXTENSIONS = ["jpg", "png"] as const;
const PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500] as const;

function StudentRmsAvatar({
  studentId,
  firstname,
  lastname,
}: {
  studentId: string;
  firstname: string;
  lastname: string;
}) {
  const [extIndex, setExtIndex] = React.useState(0);
  const [useFallback, setUseFallback] = React.useState(false);

  const initials =
    `${firstname?.charAt(0) ?? ""}${lastname?.charAt(0) ?? ""}`.toUpperCase() ||
    "?";

  const handleImageError = () => {
    if (extIndex < RMS_PIC_EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
    } else {
      setUseFallback(true);
    }
  };

  const rmsSrc = studentId
    ? `${RMS_STUDENT_PIC_BASE}/${studentId}.${RMS_PIC_EXTENSIONS[extIndex]}`
    : null;

  return (
    <Avatar className="h-10 w-10 shrink-0 rounded-xl">
      {!useFallback && rmsSrc ? (
        <AvatarImage
          key={rmsSrc}
          src={rmsSrc}
          alt={`${firstname} ${lastname}`}
          className="rounded-xl object-cover"
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback className="rounded-xl bg-gray-100 text-gray-600 text-xs font-medium dark:bg-gray-800 dark:text-gray-300">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function StudentsAllTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");

  const [majorFileter, setMajorFileter] = React.useState<string>("all");
  const [gradeFilter, setGradeFilter] = React.useState<string>("all"); // เปลี่ยนชื่อจาก yearFiler เป็น gradeFilter
  const [groupFilter, setGroupFilter] = React.useState<string>("all");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [date, setDate] = React.useState<Date | null>(null);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [editingStudent, setEditingStudent] = React.useState<PaginationTableType | null>(null);
  const [formData, setFormData] = React.useState({
    firstname: "",
    lastname: "",
    citizenId: "",
    sex: "",
    phone: "",
    department: "",
    studentId: "",
    major: "",
    educationLevel: "", // เปลี่ยนจาก education เป็น educationLevel
    gradeLevel: "",
    room: "",
    term: "",
    academicYear: "",
  });
  const router = useRouter();
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "แจ้งเตือน!",
      text: "คุณต้องการลบข้อมูลนักศึกษารายนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการ",
      cancelButtonText: "ไม่ต้องการ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/users/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.message, err.type);
        } else {
          const data = await res.json();
          showToast(data.message, data.type);
          await mutate();
        }
      }
    });
  };

  const handleView = (id: string) => {
    router.push(`/admin/students/${id}`)
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!editingStudent?.id) {
      showToast("ไม่พบข้อมูลนักศึกษาที่ต้องการแก้ไข", "error");
      setLoading(false);
      return;
    }

    if (!validateThaiID(formData.citizenId)) {
      showToast("เลขบัตรประจำตัวประชาชนไม่ถูกต้อง", "warning");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add form fields
      submitData.append("firstname", formData.firstname);
      submitData.append("lastname", formData.lastname);
      submitData.append("citizenId", formData.citizenId);
      submitData.append("sex", formData.sex);
      submitData.append("phone", formData.phone);
      submitData.append("department", formData.department);
      submitData.append("birthday", String(date?.toISOString()));
      submitData.append("studentId", formData.studentId);
      submitData.append("major", formData.major);
      submitData.append("educationLevel", formData.educationLevel);
      submitData.append("gradeLevel", formData.gradeLevel);
      submitData.append("room", formData.room);
      submitData.append("term", formData.term);
      submitData.append("academicYear", formData.academicYear);

      // Add image file if selected
      if (imageFile) {
        submitData.append("user_img", imageFile);
      }

      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }

      showToast("แก้ไขข้อมูลนักศึกษาเรียบร้อยแล้ว", "success");
      setOpenEdit(false);
      resetForm();
      setEditingStudent(null);
      mutate(); // รีเฟรชข้อมูลนักศึกษา
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      citizenId: "",
      sex: "",
      phone: "",
      department: "",
      studentId: "",
      major: "",
      educationLevel: "", // เปลี่ยนจาก education เป็น educationLevel
      gradeLevel: "",
      room: "",
      term: "",
      academicYear: "",
    });
    setDate(null);
    setImageFile(null);
    setImagePreview("");
  };
  const handleEdit = (student: PaginationTableType) => {
    setEditingStudent(student);

    // เติมข้อมูลเดิมลงในฟอร์ม
    setFormData({
      firstname: student.user.firstname || "",
      lastname: student.user.lastname || "",
      citizenId: student.user.citizenId || "",
      sex: student.user.sex || "",
      phone: student.user.phone || "",
      department: student.department?.id ? String(student.department.id) : "",
      studentId: student?.studentId || "",
      major: student.major?.id ? String(student.major.id) : "",
      educationLevel: student.education?.id ? String(student.education.id) : "",
      gradeLevel: student?.gradeLevel || "",
      room: student?.room || "",
      term: student?.term || "",
      academicYear: student?.academicYear || "",
    });

    // ตั้งค่ารูปภาพเดิม
    if (student.user.user_img) {
      setImagePreview(`/uploads/${student.user.user_img}`);
    }

    // ตั้งค่าวันเกิด
    if (student.user.birthday) {
      setDate(new Date(student.user.birthday));
    }

    setOpenEdit(true);
  };

  const columns: ColumnDef<Student>[] = [
    {
      id: "index",
      header: () => <span>#</span>,
      cell: ({ row }) => <div className="text-base">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "student.studentId",
      header: () => <span>รหัสนักศึกษา</span>,
      cell: ({ row }) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{row.original.studentId}</h6>
        </div>
      ),
    },
    {
      accessorKey: "firstname",
      header: () => <span>ผู้ใช้</span>,
      cell: ({ row }) => (
        <div className="flex gap-3 items-center">
          <StudentRmsAvatar
            studentId={row.original.studentId}
            firstname={row.original.user.firstname}
            lastname={row.original.user.lastname}
          />
          <div className="truncate line-clamp-2 max-w-full">
            <h6 className="text-base">{`${row.original.user.firstname} ${row.original.user.lastname}`}</h6>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "user.sex",
      header: () => <span>เพศ</span>,
      cell: ({ row }) => (
        <div className="text-base">{userSex(Number(row.original.user.sex))}</div>
      ),
    },
    {
      accessorKey: "department.depname",
      header: () => <span>แผนกวิชา</span>,
      cell: ({ row }) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{row.original.department?.depname ?? "-"}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {row.original.major?.major_name ?? "-"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "student.education.name",
      header: () => <span>ระดับชั้น</span>,
      cell: ({ row }) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">
            {row.original.education?.name
              ? `${row.original.education.name}.${row.original.gradeLevel}/${row.original.room}`
              : `${row.original.gradeLevel}/${row.original.room}`}
          </h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            ปีการศึกษา:{" "}
            {`${row.original.term}/${row.original.academicYear}`}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDots size={22} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-900"
            >
              <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
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
                <span>ลบข้อมูล</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const nameFilterFn: FilterFn<Student> = (row, columnId, filterValue) => {
    const searchTerm = filterValue.toLowerCase();
    const firstName = row.original.user.firstname.toLowerCase();
    const lastName = row.original.user.lastname.toLowerCase();
    return firstName.includes(searchTerm) || lastName.includes(searchTerm);
  };

  // Fetch students data
  const {
    data: stdData,
    isLoading,
    error,
    mutate,
  } = useSWR("/api/students", fetcher);

  // Fetch departments data
  const { data: deptData, isLoading: isDeptLoading } = useSWR(
    "/api/departments",
    fetcher
  );
  const { data: edctData, isLoading: isEdctLoading } = useSWR(
    "/api/education",
    fetcher
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const departments: Department[] = deptData ?? [];
  const allStudents: Student[] = stdData ?? [];
  const educations: Education[] = edctData?.data ?? [];

  // สร้างรายการระดับชั้นที่ผสมระหว่าง education และ gradeLevel
  const availableGrades = React.useMemo(() => {
    const gradesSet = new Set<string>();
    allStudents.forEach((student) => {
      if (!student.education?.name || !student.gradeLevel) return;
      gradesSet.add(`${student.education.name}.${student.gradeLevel}`);
    });
    return Array.from(gradesSet).sort();
  }, [allStudents]);

  // Filter students based on selected filters
  const filteredStudents = React.useMemo(() => {
    return allStudents.filter((student) => {
      const matchesDepartment =
        departmentFilter === "all" ||
        student.department?.depname === departmentFilter;
      const matchesMajor =
        majorFileter === "all" || student.major?.major_name === majorFileter;

      const studentGradeCombo = student.education?.name
        ? `${student.education.name}.${student.gradeLevel}`
        : "";
      const matchesGrade =
        gradeFilter === "all" || studentGradeCombo === gradeFilter;

      const matchsGroup =
        groupFilter === "all" || student.room === groupFilter;

      return matchesDepartment && matchesMajor && matchesGrade && matchsGroup;
    });
  }, [allStudents, departmentFilter, majorFileter, gradeFilter, groupFilter]);

  // สร้างรายการ major ตาม department ที่เลือก
  const availableMajors = React.useMemo(() => {
    const majorsSet = new Set<string>();
    allStudents.forEach((student) => {
      if (!student.major?.major_name) return;
      if (
        departmentFilter === "all" ||
        student.department?.depname === departmentFilter
      ) {
        majorsSet.add(student.major.major_name);
      }
    });
    return Array.from(majorsSet);
  }, [allStudents, departmentFilter]);

  const availableGroup = React.useMemo(() => {
    const groupSet = new Set<string>();
    allStudents.forEach((student) => {
      if (majorFileter === "all" || student.major?.major_name === majorFileter) {
        if (student.room) groupSet.add(student.room);
      }
    });
    return Array.from(groupSet);
  }, [allStudents, majorFileter]);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    departmentFilter,
    majorFileter,
    gradeFilter,
    groupFilter,
    globalFilter,
  ]);

  const table = useReactTable({
    data: filteredStudents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
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
      pagination,
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = table.getState().pagination;
  const rangeStart =
    filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, filteredCount);

  if (error) {
    return (
      <div className="grid w-full max-w-xl items-center h-[80vh] my-auto mx-auto">
        <Alert variant="destructive">
          <AlertCircleIcon className="text-red-600" />
          <AlertTitle className="text-red-600">
            เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา
          </AlertTitle>
        </Alert>
      </div>
    );
  }

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
            <SelectItem
              value="all"
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <p className="pb-1">แผนกวิชาทั้งหมด</p>
            </SelectItem>
            {isDeptLoading ? (
              <SelectItem value="loading" disabled>
                กำลังโหลด...
              </SelectItem>
            ) : (
              departments.map((dept) => (
                <SelectItem
                  key={dept.id}
                  value={dept.depname}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {dept.depname}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select value={majorFileter} onValueChange={setMajorFileter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="เลือกสาขาวิชา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <p className="pb-1">สาขาวิชาทั้งหมด</p>
            </SelectItem>
            {isDeptLoading ? (
              <SelectItem value="loading" disabled>
                กำลังโหลด...
              </SelectItem>
            ) : (
              availableMajors.map((major, index) => (
                <SelectItem
                  key={index}
                  value={String(major)}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {String(major)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="เลือกระดับชั้น" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <p className="pb-1">ระดับชั้นทั้งหมด</p>
            </SelectItem>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                กำลังโหลด...
              </SelectItem>
            ) : (
              availableGrades.map((grade, index) => (
                <SelectItem
                  key={index}
                  value={grade}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {grade}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="เลือกกลุ่ม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="bg-white  dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <p className="pb-1">กลุ่มห้องทั้งหมด</p>
            </SelectItem>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                กำลังโหลด...
              </SelectItem>
            ) : (
              availableGroup.map((group, index) => (
                <SelectItem
                  key={index}
                  value={String(group)}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {String(group)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
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
                      className={`text-gray-900 dark:text-gray-100 ${header.id === "select"
                          ? "w-12"
                          : header.id === "index"
                            ? "w-16"
                            : header.id === "student_studentId"
                              ? "w-40"
                              : header.id === "sex"
                                ? "w-20"
                                : header.id === "actions"
                                  ? "w-20"
                                  : header.id === "student_education_name"
                                    ? "w-30"
                                    : header.id === "department_depname"
                                      ? "w-50"
                                      : ""
                        }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {departmentFilter === "all" &&
                    majorFileter === "all" &&
                    gradeFilter === "all"
                    ? "ไม่พบข้อมูลนักศึกษา"
                    : "ไม่พบข้อมูลนักศึกษาตามเงื่อนไขที่เลือก"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          แสดง {rangeStart}-{rangeEnd} จาก {filteredCount} รายการ
          {filteredCount !== allStudents.length && (
            <span> (ทั้งหมด {allStudents.length} รายการ)</span>
          )}
          {departmentFilter !== "all" && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามแผนก: {departmentFilter})
            </span>
          )}
          {majorFileter !== "all" && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามสาขา: {majorFileter})
            </span>
          )}
          {gradeFilter !== "all" && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              (กรองตามระดับชั้น: {gradeFilter})
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            แสดงต่อหน้า
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-[88px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="bg-white dark:bg-gray-900"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            หน้า {pageCount === 0 ? 0 : pageIndex + 1} จาก {pageCount || 1}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="หน้าแรก"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="หน้าก่อน"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="หน้าถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="หน้าสุดท้าย"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
