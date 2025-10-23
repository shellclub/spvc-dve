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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/dialog";
import { Badge, Datepicker, Dropdown, Spinner } from "flowbite-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDots,
  IconPlus,
  IconUpload,
  IconUser,
  IconEdit,
} from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
import { userRole, userSex } from "@/lib/utils";
import Image from "next/image";
import useSWR from "swr";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn-ui/Default-Ui/select";
import { validateThaiID } from "@/lib/thaiIdVaildate";

import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";

export interface PaginationTableType {
  id: number;
  studentId: string;
    term: string;
    education: {
      id: number;
      name: string;
    };
    major: {
      id: number;
      major_name: string;
    };
    academicYear: string;
    gradeLevel: string;
    room: string;
    department: {
      id: number;
      depname: string;
    };
  user: {
  id?: string;
  citizenId: string;
  user_img: string;
  phone?: string;
  birthday?: string;
    
  
  firstname?: string;
  lastname?: string;
  role?: string;
  sex?: string;
};
  actions?: any;
}

interface AddStudentDialogProps {
  onSuccess?: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const columnHelper = createColumnHelper<PaginationTableType>();

const StudentTable = ({ onSuccess }: AddStudentDialogProps) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const router = useRouter();  
  const { data: majorData, isLoading: ismajorsLoading } = useSWR(
    "/api/major",
    fetcher
  );

  const { data: deptData, isLoading: isDeptLoading } = useSWR( 
    "/api/departments",
    fetcher
  );
  const { data: edctData, isLoading: isEdctLoading } = useSWR(
    "/api/education",
    fetcher
  );


  const majors = majorData ?? [];
  const departments = deptData ?? [];
  const educations = edctData?.data ?? [];

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [editingStudent, setEditingStudent] = React.useState<PaginationTableType | null>(null);
  const [filteredMajors, setFilteredMajors] = useState(majors);
  const [formData, setFormData] = React.useState({
    firstname: "",
    lastname: "",
    citizenId: "",
    sex: "",
    phone: "",
    department: "",
    studentId: "",
    major_id: "",
    educationLevel: "", // เปลี่ยนจาก education เป็น educationLevel
    gradeLevel: "",
    room: "",
    term: "",
    academicYear: "",
  });

  // Fetch departments and education data


  const { data, isLoading, error, mutate } = useSWR(
    "/api/students",
    fetcher
  );

  useEffect(() => {
   if(ismajorsLoading || isDeptLoading) return; 
    if (!formData.department) {
      // ยังไม่ได้เลือก department → แสดงทุก major
      setFilteredMajors(majors);
    } else {
      // กรองตาม department_id
      const filtered = majors.filter(
        (major: any) => String(major.departmentId) === String(formData.department)
      );
      setFilteredMajors(filtered);
    }
   
  }, [formData.department, majors]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateThaiID(formData.citizenId)) {
      showToast("เลขบัตรประจำตัวประชาชนไม่ถูกต้อง", "warning");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add form fields with proper naming and data types
      submitData.append("firstname", formData.firstname);
      submitData.append("lastname", formData.lastname);
      submitData.append("citizenId", formData.citizenId);
      submitData.append("sex", formData.sex);
      submitData.append("phone", formData.phone);
      submitData.append("department", formData.department); // จะส่งเป็น departmentId
      submitData.append("birthday", String(date?.toISOString()))
      submitData.append("studentId", formData.studentId); // จะใช้เป็น username ด้วย
      submitData.append("major_id", formData.major_id);
      submitData.append("educationLevel", formData.educationLevel);
      submitData.append('gradeLevel',formData.gradeLevel)
      submitData.append("room", formData.room);
      submitData.append("term", formData.term);
      submitData.append("academicYear", formData.academicYear);

      // Add image file if selected
      if (imageFile) {
        submitData.append("user_img", imageFile);
      }

      // Set role as student (3)
      submitData.append("role", "3");

      const response = await fetch("/api/students", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }

      showToast("เพิ่มข้อมูลนักศึกษาเรียบร้อยแล้ว", "success");
      setOpenAdd(false); // เปลี่ยนจาก setOpen เป็น setOpenAdd
      resetForm();
      onSuccess?.();
      mutate(); // รีเฟรชข้อมูลนักศึกษา
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการเพิ่มข้อมูล",
        "error"
      );
    } finally {
      setLoading(false);
    }
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
      submitData.append("major_id", String(formData.major_id));
      submitData.append("educationLevel", formData.educationLevel);
      submitData.append("gradeLevel", formData.gradeLevel);
      submitData.append("room", formData.room);
      submitData.append("term", formData.term);
      submitData.append("academicYear", formData.academicYear);

      // Add image file if selected
      if (imageFile) {
        submitData.append("user_img", imageFile);
      }
      
      const response = await fetch(`/api/students/${editingStudent.user.id}`, {
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
      onSuccess?.();
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
      major_id: "",
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

  const handleDialogClose = () => {
    setOpenAdd(false);
    if (!loading) {
      resetForm();
    }
  };

  const handleEditDialogClose = () => {
    setOpenEdit(false);
    if (!loading) {
      resetForm();
      setEditingStudent(null);
    }
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
      department: String(student.department.id), // ต้องดึง department ID
      studentId: student.studentId || "",
      major_id: String(student.major.id) || "",
      educationLevel: String(student.education.id), // ต้องดึง education ID
      gradeLevel: student?.gradeLevel || "",
      room: student.room || "",
      term: student.term || "",
      academicYear: student.academicYear || "",
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

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // old code
  const rerender = () => {
    setColumnFilters([]);
    mutate(); // Refresh data
  }
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "แจ้งเตือน!",
      text: "คุณต้องการลบข้อมูลนักศึกษานี้หรือไม่?",
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
          mutate(); // Refresh data after deletion
          router.refresh();
        }
      }
    });
  };

  async function handleSubmitUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/upload-excel", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setOpen(false);
      setTimeout(() => {
        mutate(); // Refresh data after upload
        showToast("อัปโหลดไฟล์ Excel สำเร็จ", "success");
      }, 1500);
    }
    const data = await res.json();
    showToast(data.message || data.error, data.type || "error"); // Show error message if any
  }

  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <div className="text-base">{info.row.index + 1}</div>,
    }),
    columnHelper.accessor("studentId", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue()}`}</h6>
        </div>
      ),
      header: () => <span>รหัสนักศึกษา</span>,
    }),
    columnHelper.accessor("user", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <Image
            src={`/uploads/${info.getValue().user_img}`}
            width={50}
            height={50}
            alt="icon"
            className="h-10 w-10 rounded-xl"
          />
          <div className="truncate line-clamp-2 max-w-56">
            <h6 className="text-base">{`${info.getValue().firstname} ${
              info.getValue().lastname
            }`}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
              {userRole(Number(info.getValue().role))}
            </p>
          </div>
        </div>
      ),
      header: () => <span>ผู้ใช้</span>,
    }),
    columnHelper.accessor("user.sex", {
      cell: (info) => (
        <div className="text-base">{userSex(Number(info.getValue()))}</div>
      ),
      header: () => <span>เพศ</span>,
    }),
    columnHelper.accessor('department', {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue()?.depname}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {info.row.original.major?.major_name}
          </p>
        </div>
      ),
      header: () => <span>แผนกวิชา</span>,
    }),
    columnHelper.accessor("education", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue().name}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            ปีการศึกษา:{" "}
            {`${info.row.original.term}/${info.row.original.academicYear}`}
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
              icon: "tabler:eye",
              listtitle: "รายละเอียด",
              onclick: () =>
                router.push(`/admin/students/${info.row.original.id}`),
            },
            {
              icon: "tabler:edit",
              listtitle: "แก้ไขข้อมูล",
              onclick: () => handleEdit(info.row.original),
            },
            {
              icon: "tabler:trash",
              listtitle: "ลบข้อมูล",
              onclick: () => handleDelete(String(info.row.original.user.id)),
            },
          ].map((item, index) => (
            <Dropdown.Item
              key={index}
              onClick={item.onclick}
              className="flex gap-3"
            >
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
    data: data || [],
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

  if(isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
        <Spinner 
          size="xl" 
          color="primary" 
          aria-label="Loading..." 
          className="text-blue-600 dark:text-blue-500"
        />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          กำลังโหลดข้อมูลนักศึกษา โปรดรอสักครู่...
        </p>
      </div>
    );
  }
 
  
  if(error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
        <p className="text-lg font-medium text-red-600 dark:text-red-500">
          เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา: {error.message}
        </p>
      </div>
    );  

  }

  return (
    <>
      <TitleIconCard title="ข้อมูลนักศึกษา">
        <div className=" flex justify-end items-center my-6 ">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button color={`success`} className="mx-2">
                Import Excel
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>อัปโหลดไฟล์ Excel</DialogTitle>
                <DialogDescription>
                  กรุณาอัปโหลดไฟล์ .xlsx ที่มีข้อมูลนักศึกษา
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

          {/* Add Student Dialog */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <IconPlus size={16} className="mr-2" />
                เพิ่มนักศึกษา
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconUser size={20} />
                  เพิ่มข้อมูลนักศึกษาใหม่
                </DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลนักศึกษาใหม่ให้ครบถ้วน
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Image */}
                <div className="space-y-2">
                  <Label htmlFor="image">รูปโปรไฟล์</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IconUser size={32} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="image"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                      >
                        <IconUpload size={16} />
                        เลือกรูปภาพ
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="firstname">เลขบัตรประจำตัวประชาชน *</Label>
                  <Input
                    id="citizenId"
                    value={formData.citizenId}
                    onChange={(e) =>
                      handleInputChange("citizenId", e.target.value)
                    }
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
                      onChange={(e) =>
                        handleInputChange("firstname", e.target.value)
                      }
                      placeholder="ชื่อ"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">นามสกุล *</Label>
                    <Input
                      id="lastname"
                      value={formData.lastname}
                      onChange={(e) =>
                        handleInputChange("lastname", e.target.value)
                      }
                      placeholder="นามสกุล"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthday">วันเกิด *</Label>
                    <Datepicker
                        language="th"
                        onSelectedDateChanged={(date) => setDate(date)}
                      />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">รหัสนักศึกษา *</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                      placeholder="รหัสนักศึกษา"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sex">เพศ *</Label>
                    <Select
                      value={formData.sex}
                      onValueChange={(value) => handleInputChange("sex", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ชาย</SelectItem>
                        <SelectItem value="2">หญิง</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">แผนกวิชา *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแผนกวิชา" />
                      </SelectTrigger>
                      <SelectContent>
                        {isDeptLoading ? (
                          <SelectItem value="loading" disabled>
                            กำลังโหลด...
                          </SelectItem>
                        ) : (
                          departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.depname}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">สาขาวิชา *</Label>
                    <Select
                      value={formData.major_id}
                      onValueChange={(value) =>
                        handleInputChange("major_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขาวิชา" />
                      </SelectTrigger>
                      <SelectContent>
                        {ismajorsLoading ? (
                          <SelectItem value="loading" disabled>
                            กำลังโหลด...
                          </SelectItem>
                        ) : filteredMajors.length > 0 ? (
                          majors.map((major: any) => (
                            <SelectItem key={major.id} value={String(major.id)}>
                              {major.major_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            ไม่มีสาขาในแผนกนี้
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">ระดับการศึกษา *</Label>
                    <Select
                      value={formData.educationLevel}
                      onValueChange={(value) =>
                        handleInputChange("educationLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับการศึกษา" />
                      </SelectTrigger>
                      <SelectContent>
                        {isEdctLoading ? (
                          <SelectItem value="loading" disabled>
                            กำลังโหลด...
                          </SelectItem>
                        ) : (
                          educations.map((edu: any) => (
                            <SelectItem key={edu.id} value={String(edu.id)}>
                              {edu.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">ชั้นปี *</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) =>
                        handleInputChange("gradeLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชั้นปี" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">ห้อง *</Label>
                    <Input
                      id="room"
                      value={formData.room}
                      onChange={(e) =>
                        handleInputChange("room", e.target.value)
                      }
                      placeholder="ห้อง"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">เทอม *</Label>
                    <Select
                      value={formData.term}
                      onValueChange={(value) =>
                        handleInputChange("term", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเทอม" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">ปีการศึกษา *</Label>
                    <Input
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) =>
                        handleInputChange("academicYear", e.target.value)
                      }
                      placeholder="2567"
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    onClick={handleDialogClose}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "กำลังเพิ่มข้อมูล..." : "เพิ่มข้อมูล"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Student Dialog */}
          <Dialog open={openEdit} onOpenChange={(open) => {
            if (!open) {
              handleEditDialogClose();

            }
          }}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconEdit size={20} />
                  แก้ไขข้อมูลนักศึกษา
                </DialogTitle>
                <DialogDescription>
                  แก้ไขข้อมูลนักศึกษา {editingStudent?.user.firstname} {editingStudent?.user.lastname}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Profile Image */}
                <div className="space-y-2">
                  <Label htmlFor="edit-image">รูปโปรไฟล์</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IconUser size={32} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="edit-image"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                      >
                        <IconUpload size={16} />
                        เปลี่ยนรูปภาพ
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="edit-citizenId">เลขบัตรประจำตัวประชาชน *</Label>
                  <Input
                    id="edit-citizenId"
                    value={formData.citizenId}
                    onChange={(e) =>
                      handleInputChange("citizenId", e.target.value)
                    }
                    placeholder="เลขบัตรประจำตัวประชาชน"
                    inputMode="numeric"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstname">ชื่อ *</Label>
                    <Input
                      id="edit-firstname"
                      value={formData.firstname}
                      onChange={(e) =>
                        handleInputChange("firstname", e.target.value)
                      }
                      placeholder="ชื่อ"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastname">นามสกุล *</Label>
                    <Input
                      id="edit-lastname"
                      value={formData.lastname}
                      onChange={(e) =>
                        handleInputChange("lastname", e.target.value)
                      }
                      placeholder="นามสกุล"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-birthday">วันเกิด *</Label>
                    <Datepicker
                        language="th"
                        onSelectedDateChanged={(date) => setDate(date)}                      />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-studentId">รหัสนักศึกษา *</Label>
                    <Input
                      id="edit-studentId"
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                      placeholder="รหัสนักศึกษา"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-sex">เพศ *</Label>
                    <Select
                      value={String(formData.sex)}
                      onValueChange={(value) => handleInputChange("sex", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ชาย</SelectItem>
                        <SelectItem value="2">หญิง</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">แผนกวิชา *</Label>
                    <Select
                      value={String(formData.department)}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแผนกวิชา" />
                      </SelectTrigger>
                      <SelectContent>
                        {isDeptLoading ? (
                          <SelectItem value="loading" disabled>
                            กำลังโหลด...
                          </SelectItem>
                        ) : (
                          departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.depname}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">สาขาวิชา *</Label>
                    <Select
                      value={formData.major_id}
                      onValueChange={(value) =>
                        handleInputChange("major_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขาวิชา" />
                      </SelectTrigger>
                      <SelectContent>
                        {ismajorsLoading ? (
                          <SelectItem value="loading" disabled>
                            กำลังโหลด...
                          </SelectItem>
                        ) : filteredMajors.length > 0 ? (
                          majors.map((major: any) => (
                            <SelectItem key={major.id} value={String(major.id)}>
                              {major.major_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            ไม่มีสาขาในแผนกนี้
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-education">ระดับการศึกษา *</Label>
                    <Select
                      value={String(formData.educationLevel)}
                      onValueChange={(value) =>
                        handleInputChange("educationLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับการศึกษา" />
                      </SelectTrigger>
                      <SelectContent>
                        {isEdctLoading ? (
                          <SelectItem value="loading" disabled>
                            กำลังโหลด...
                          </SelectItem>
                        ) : (
                          educations.map((edu: any) => (
                            <SelectItem key={edu.id} value={String(edu.id)}>
                              {edu.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gradeLevel">ชั้นปี *</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) =>
                        handleInputChange("gradeLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชั้นปี" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-room">ห้อง *</Label>
                    <Input
                      id="edit-room"
                      value={formData.room}
                      onChange={(e) =>
                        handleInputChange("room", e.target.value)
                      }
                      placeholder="ห้อง"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-term">เทอม *</Label>
                    <Select
                      value={formData.term}
                      onValueChange={(value) =>
                        handleInputChange("term", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเทอม" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-academicYear">ปีการศึกษา *</Label>
                    <Input
                      id="edit-academicYear"
                      value={formData.academicYear}
                      onChange={(e) =>
                        handleInputChange("academicYear", e.target.value)
                      }
                      placeholder="2567"
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    onClick={handleEditDialogClose}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "กำลังแก้ไขข้อมูล..." : "บันทึกการแก้ไข"}
                  </Button>
                </DialogFooter>
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap border py-3 px-2 xxl:px-4"
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
                  {table.getState().pagination.pageIndex + 1} จาก{" "}
                  {table.getPageCount()}
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
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
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
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                >
                  <IconChevronsLeft className="text-ld" size={20} />
                </Button>
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                >
                  <IconChevronLeft className="text-ld" size={20} />
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                >
                  <IconChevronRight className="text-ld" size={20} />
                </Button>
                <Button
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
