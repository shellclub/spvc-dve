"use client";
import React, { useState } from "react";
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
import { Dropdown, Spinner } from "flowbite-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDots,
  IconPlus,
  IconEdit,
  IconBuilding,
} from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
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
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";
import { validateThaiID } from "@/lib/thaiIdVaildate";

export interface CompanyType {
  id: number;
  name: string;
  address: string;
  userId: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    citizenId: string;
  };
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const columnHelper = createColumnHelper<CompanyType>();

const CompaniesTable = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyType | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    firstname: "",
    lastname: "",
    phone: "",
    citizenId: "",
  });

  // Fetch companies data
  const { data, isLoading, error, mutate } = useSWR("/api/company", fetcher);

  // Fetch students data for dropdown
  const { data: studentsData, isLoading: isStudentsLoading } = useSWR(
    "/api/students",
    fetcher
  );

  const students = studentsData || [];

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      firstname: "",
      lastname: "",
      phone: "",
      citizenId: "",
    });
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
      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }

      showToast("เพิ่มข้อมูลสถานประกอบการเรียบร้อยแล้ว", "success");
      setOpenAdd(false);
      resetForm();
      mutate();
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

    if (!editingCompany?.id) {
      showToast("ไม่พบข้อมูลสถานประกอบการที่ต้องการแก้ไข", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/company/${editingCompany.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }

      showToast("แก้ไขข้อมูลสถานประกอบการเรียบร้อยแล้ว", "success");
      setOpenEdit(false);
      resetForm();
      setEditingCompany(null);
      mutate();
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

  const handleEdit = (company: CompanyType) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address,
      firstname: company.user.firstname,
      lastname: company.user.lastname,
      phone: company.user.phone || "",
      citizenId: company.user.citizenId,
    });
    setOpenEdit(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "แจ้งเตือน!",
      text: "คุณต้องการลบข้อมูลสถานประกอบการนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการ",
      cancelButtonText: "ไม่ต้องการ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/company/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          showToast(data.message, "error");
        } else {
          showToast(data.message, "success");
          mutate();
          router.refresh();
        }
      }
    });
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
      setEditingCompany(null);
    }
  };

  const rerender = () => {
    setColumnFilters([]);
    mutate();
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <div className="text-base">{info.row.index + 1}</div>,
    }),
    columnHelper.accessor("name", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base font-semibold">{info.getValue()}</h6>
        </div>
      ),
      header: () => <span>ชื่อสถานประกอบการ</span>,
    }),
    columnHelper.accessor("address", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-72">
          <p className="text-sm">{info.getValue()}</p>
        </div>
      ),
      header: () => <span>ที่อยู่</span>,
    }),
    columnHelper.accessor("user", {
      cell: (info) => (
        <div className="truncate line-clamp-2 max-w-56">
          <h6 className="text-base">{`${info.getValue().firstname} ${info.getValue().lastname}`}</h6>
          <p className="text-sm text-darklink dark:text-bodytext">
            {info.getValue().phone || "-"}
          </p>
        </div>
      ),
      header: () => <span>ผู้ติดต่อ</span>,
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
              icon: "tabler:edit",
              listtitle: "แก้ไขข้อมูล",
              onclick: () => handleEdit(info.row.original),
            },
            {
              icon: "tabler:trash",
              listtitle: "ลบข้อมูล",
              onclick: () => handleDelete(info.row.original.user.id),
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
        <Spinner
          size="xl"
          color="primary"
          aria-label="Loading..."
          className="text-blue-600 dark:text-blue-500"
        />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          กำลังโหลดข้อมูลสถานประกอบการ โปรดรอสักครู่...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
        <p className="text-lg font-medium text-red-600 dark:text-red-500">
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <TitleIconCard title="ข้อมูลสถานประกอบการ">
        <div className="flex justify-end items-center my-6">
          {/* Add Company Dialog */}
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
                <DialogDescription>
                  กรอกข้อมูลสถานประกอบการใหม่ให้ครบถ้วน
                </DialogDescription>
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
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="ที่อยู่สถานประกอบการ"
                    required
                  />
                </div>

            
                {/* Contact Person Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">ข้อมูลผู้ติดต่อ</h3>
                  
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="citizenId">เลขบัตรประจำตัวประชาชน *</Label>
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

                  <div className="space-y-2 mt-3">
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

          {/* Edit Company Dialog */}
          <Dialog
            open={openEdit}
            onOpenChange={(open) => {
              if (!open) {
                handleEditDialogClose();
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconEdit size={20} />
                  แก้ไขข้อมูลสถานประกอบการ
                </DialogTitle>
                <DialogDescription>
                  แก้ไขข้อมูลสถานประกอบการ {editingCompany?.name}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Company Information */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">ชื่อสถานประกอบการ *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="ชื่อสถานประกอบการ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">ที่อยู่ *</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="ที่อยู่สถานประกอบการ"
                    required
                  />
                </div>

                {/* Contact Person Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">ข้อมูลผู้ติดต่อ</h3>
                  
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

                  <div className="space-y-2 mt-3">
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

        {/* Table */}
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

export default CompaniesTable