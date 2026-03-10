"use client";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { ThaiDatePicker } from "@/app/components/ThaiDatePicker";
import useSWR from "swr";
import Image from "next/image";
import * as XLSX from "xlsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ──── Utility ────
function maskCitizenId(id: string) {
  if (!id || id.length < 13) return id || "-";
  return id.substring(0, 3) + "-xxxx-xxxxx-" + id.substring(11);
}

// Generate academic year options (current BE year going back 10 years)
function getAcademicYears(): string[] {
  const currentYear = new Date().getFullYear() + 543; // พ.ศ.
  const years: string[] = [];
  for (let i = 0; i <= 10; i++) {
    years.push(String(currentYear - i));
  }
  return years;
}

const ACADEMIC_YEARS = getAcademicYears();
const LAST_ACADEMIC_YEAR_KEY = "lastAcademicYear";

// ──── Sub-components ────
function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ──── Types ────
interface FormData {
  studentId: string;
  prefix: string;
  prefixCustom: string;
  firstname: string;
  lastname: string;
  birthday: string;
  phone: string;
  departmentId: number | null;
  majorId: number | null;
  educationLevel: number | null;
  curriculum: string;
  gradeLevel: string;
  room: string;
  term: string;
  academicYear: string;
  user_img: File | null;
}
interface Errors { [key: string]: string; }

function validateField(name: string, value: any): string {
  switch (name) {
    case "studentId": return !value?.trim() ? "กรุณากรอกรหัสนักศึกษา" : "";
    case "prefix": return !value ? "กรุณาเลือกคำนำหน้า" : "";
    case "firstname": return !value?.trim() ? "กรุณากรอกชื่อ" : "";
    case "lastname": return !value?.trim() ? "กรุณากรอกนามสกุล" : "";
    case "birthday": return !value ? "กรุณาเลือกวันเกิด" : "";
    case "phone":
      if (!value) return "กรุณากรอกเบอร์โทร";
      if (!/^0\d{9}$/.test(value)) return "เบอร์โทรต้องเริ่มด้วย 0 ตามด้วยตัวเลข 9 หลัก";
      return "";
    case "educationLevel": return !value ? "กรุณาเลือกระดับชั้น" : "";
    case "departmentId": return !value ? "กรุณาเลือกแผนกวิชา" : "";
    case "term": return !value ? "กรุณาเลือกเทอม" : "";
    case "academicYear": return !value?.trim() ? "กรุณาเลือกปีการศึกษา" : "";
    default: return "";
  }
}

function getEmptyForm(): FormData {
  // Retrieve last used academic year from localStorage
  let lastYear = "";
  if (typeof window !== "undefined") {
    lastYear = localStorage.getItem(LAST_ACADEMIC_YEAR_KEY) || "";
  }
  return {
    studentId: "", prefix: "", prefixCustom: "", firstname: "", lastname: "",
    birthday: "", phone: "", departmentId: null, majorId: null,
    educationLevel: null, curriculum: "", gradeLevel: "", room: "", term: "",
    academicYear: lastYear, user_img: null,
  };
}

// ═══════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════
export default function StudentTable() {
  // ─ Data ─
  const { data: students, isLoading, mutate } = useSWR("/api/students", fetcher);
  const { data: deptData } = useSWR("/api/departments", fetcher);
  const { data: majorData } = useSWR("/api/major", fetcher);
  const { data: edctData } = useSWR("/api/education", fetcher);

  const departments = deptData ?? [];
  const allMajors = majorData ?? [];
  const educations = edctData?.data ?? edctData ?? [];

  // ─ State ─
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(getEmptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Import state
  const [formMode, setFormMode] = useState<"single" | "import">("single");
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // ─ Filtered majors ─
  const filteredMajors = useMemo(() => {
    if (!formData.departmentId) return allMajors;
    return allMajors.filter((m: any) => m.departmentId === formData.departmentId);
  }, [formData.departmentId, allMajors]);

  // ─ Filtered students ─
  const filtered = useMemo(() => {
    if (!students) return [];
    let list = students;
    if (filterDept) list = list.filter((s: any) => s.departmentId === filterDept);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s: any) => {
        const name = `${s.user?.prefix ?? ""} ${s.user?.firstname ?? ""} ${s.user?.lastname ?? ""}`.toLowerCase();
        return name.includes(q) || s.studentId?.toLowerCase().includes(q);
      });
    }
    return list;
  }, [students, filterDept, search]);

  // ─ CSS helper ─
  const inputClass = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border-2 text-base transition-all duration-200 outline-none bg-white
     ${err ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-green-100"}`;

  // ─ Handlers ─
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newVal = ["departmentId", "majorId", "educationLevel"].includes(name)
      ? (value === "" ? null : Number(value))
      : value;
    const newForm = { ...formData, [name]: newVal };
    // Reset major when department changes
    if (name === "departmentId") newForm.majorId = null;
    // Save academicYear to localStorage
    if (name === "academicYear" && value) {
      localStorage.setItem(LAST_ACADEMIC_YEAR_KEY, value);
    }
    setFormData(newForm);
    if (errors[name]) {
      const err = validateField(name, newVal);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, user_img: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setFormData((prev) => ({ ...prev, user_img: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateAll = (): boolean => {
    const fields = ["studentId", "prefix", "firstname", "lastname", "birthday", "phone", "educationLevel", "departmentId", "term", "academicYear"];
    const newErrors: Errors = {};
    let valid = true;
    for (const f of fields) {
      const err = validateField(f, (formData as any)[f]);
      if (err) { newErrors[f] = err; valid = false; }
    }
    if (formData.prefix === "อื่นๆ" && !formData.prefixCustom?.trim()) {
      newErrors.prefixCustom = "กรุณาระบุคำนำหน้า";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      const fd = new window.FormData();
      fd.append("studentId", formData.studentId);
      const prefix = formData.prefix === "อื่นๆ" ? formData.prefixCustom : formData.prefix;
      fd.append("prefix", prefix);
      fd.append("firstname", formData.firstname);
      fd.append("lastname", formData.lastname);
      fd.append("birthday", formData.birthday ? new Date(formData.birthday).toISOString() : "");
      fd.append("phone", formData.phone);
      fd.append("department", String(formData.departmentId ?? ""));
      fd.append("major_id", String(formData.majorId ?? ""));
      fd.append("educationLevel", String(formData.educationLevel ?? ""));
      fd.append("curriculum", formData.curriculum);
      fd.append("gradeLevel", formData.gradeLevel);
      fd.append("room", formData.room);
      fd.append("term", formData.term);
      fd.append("academicYear", formData.academicYear);
      if (formData.user_img) fd.append("user_img", formData.user_img);

      const url = editId ? `/api/students/${editId}` : "/api/students";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "เกิดข้อผิดพลาด");
      showToast(result.message || (editId ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มข้อมูลสำเร็จ"), "success");
      setShowForm(false);
      setEditId(null);
      setFormData(getEmptyForm());
      setErrors({});
      setImagePreview(null);
      mutate();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาด", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (userId: number) => {
    setShowForm(true);
    setFormMode("single");
    setEditId(userId);
    setIsLoadingEdit(true);
    try {
      const res = await fetch(`/api/students/${userId}`, { cache: "no-store" });
      const data = await res.json();
      const prefixVal = data.prefix || "";
      const isCustomPrefix = !["นาย", "นาง", "นางสาว"].includes(prefixVal);
      setFormData({
        studentId: data.student?.studentId || "",
        prefix: isCustomPrefix && prefixVal ? "อื่นๆ" : prefixVal,
        prefixCustom: isCustomPrefix ? prefixVal : "",
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        birthday: data.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "",
        phone: data.phone || "",
        departmentId: data.student?.departmentId ?? null,
        majorId: data.student?.major_id ?? null,
        educationLevel: data.student?.educationLevel ?? null,
        curriculum: data.student?.curriculum || "",
        gradeLevel: data.student?.gradeLevel || "",
        room: data.student?.room || "",
        term: data.student?.term || "",
        academicYear: data.student?.academicYear || "",
        user_img: null,
      });
      if (data.user_img) setImagePreview(`/uploads/${data.user_img}`);
    } catch { showToast("โหลดข้อมูลไม่สำเร็จ", "error"); }
    finally { setIsLoadingEdit(false); }
  };

  const handleResetPassword = (userId: number) => {
    Swal.fire({
      title: 'ยืนยันการรีเซ็ตรหัสผ่าน?',
      text: "รหัสผ่านจะถูกตั้งเป็นวันเดือนปีเกิด (DDMMYYYY) หรือ รหัสบัตรประชาชน หากไม่มีวันเกิดและบังคับเปลี่ยนเมื่อเข้าระบบครั้งแรก",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/users/${userId}/reset-password`, { method: "PUT" });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
          } else {
            showToast(data.message, 'error');
          }
        } catch (e) {
          console.error(e);
          showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
      }
    });
  };

  const handleDelete = (userId: string) => {
    Swal.fire({
      title: "ยืนยันการลบ", text: "ข้อมูลนักศึกษาจะถูกลบออกจากระบบ",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", cancelButtonColor: "#aaa",
      confirmButtonText: "ลบข้อมูล", cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
        const data = await res.json();
        showToast(data.message, data.type || (res.ok ? "success" : "error"));
        if (res.ok) mutate();
      }
    });
  };

  // ─ Import functions ─
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["รหัสนักศึกษา", "คำนำหน้า", "ชื่อ", "นามสกุล", "เบอร์โทร"],
      ["65001", "นาย", "สมชาย", "ใจดี", "0812345678"],
    ]);
    ws["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "นักศึกษา");
    XLSX.writeFile(wb, "template_import_students.xlsx");
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws);

        const errs: string[] = [];
        const parsed = json.map((row, i) => {
          const studentId = String(row["รหัสนักศึกษา"] || "").trim();
          const prefix = String(row["คำนำหน้า"] || "").trim();
          const firstname = String(row["ชื่อ"] || "").trim();
          const lastname = String(row["นามสกุล"] || "").trim();
          const phone = String(row["เบอร์โทร"] || "").trim();
          if (!studentId) errs.push(`แถว ${i + 2}: ไม่มีรหัสนักศึกษา`);
          if (!firstname) errs.push(`แถว ${i + 2}: ไม่มีชื่อ`);
          if (!lastname) errs.push(`แถว ${i + 2}: ไม่มีนามสกุล`);
          return { studentId, prefix, firstname, lastname, phone };
        });

        setImportErrors(errs);
        setImportData(parsed);
      } catch {
        showToast("ไม่สามารถอ่านไฟล์ Excel ได้", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImportFile(file);
  };

  const handleImportSubmit = async () => {
    if (importErrors.length > 0) {
      showToast("กรุณาแก้ไขข้อผิดพลาดก่อนนำเข้า", "error");
      return;
    }
    if (importData.length === 0) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: importData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "เกิดข้อผิดพลาด");
      showToast(result.message || `นำเข้าข้อมูลสำเร็จ ${importData.length} รายการ`, "success");
      setShowForm(false);
      setImportData([]);
      setImportErrors([]);
      mutate();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาด", "error");
    } finally {
      setIsImporting(false);
    }
  };

  // ─ Loading ─
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  const deptCounts = departments.reduce((acc: any, d: any) => {
    acc[d.id] = (students ?? []).filter((s: any) => s.departmentId === d.id).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* ──── Header ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
            <Icon icon="tabler:school" className="text-white" width={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลนักศึกษา</h1>
            <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ และค้นหาข้อมูลนักศึกษา</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
            <Icon icon="tabler:users" width={18} /> {(students ?? []).length} คน
          </span>
          {showForm ? (
            <button onClick={() => { setShowForm(false); setEditId(null); setFormData(getEmptyForm()); setErrors({}); setImagePreview(null); setImportData([]); setImportErrors([]); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors shadow">
              <Icon icon="tabler:x" width={18} /> ปิดฟอร์ม
            </button>
          ) : (
            <button onClick={() => { setShowForm(true); setEditId(null); setFormData(getEmptyForm()); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
              <Icon icon="tabler:plus" width={18} /> เพิ่มนักศึกษา
            </button>
          )}
        </div>
      </div>

      {/* ──── Department filter ──── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterDept(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!filterDept ? "bg-[#2E7D32] text-white shadow" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
          ทั้งหมด ({(students ?? []).length})
        </button>
        {departments.map((d: any) => (
          <button key={d.id} onClick={() => setFilterDept(filterDept === d.id ? null : d.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterDept === d.id ? "bg-[#2E7D32] text-white shadow" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
            {d.depname} ({deptCounts[d.id] || 0})
          </button>
        ))}
      </div>

      {/* ──── Form ──── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
          {/* Mode tabs */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setFormMode("single")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${formMode === "single" ? "bg-[#2E7D32] text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              <Icon icon="tabler:user-plus" width={18} />
              {editId ? "แก้ไขข้อมูล" : "เพิ่มรายคน"}
            </button>
            {!editId && (
              <button onClick={() => setFormMode("import")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${formMode === "import" ? "bg-[#2E7D32] text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                <Icon icon="tabler:file-import" width={18} /> นำเข้าจาก Excel
              </button>
            )}
          </div>

          {formMode === "single" ? (
            /* ──── Single add/edit form ──── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <Icon icon={editId ? "tabler:edit" : "tabler:user-plus"} width={24} className="text-[#2E7D32]" />
                <h2 className="text-xl font-bold text-gray-800">{editId ? "แก้ไขข้อมูลนักศึกษา" : "เพิ่มข้อมูลนักศึกษาใหม่"}</h2>
              </div>

              {isLoadingEdit ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
                </div>
              ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      {/* studentId */}
                      <FormField label="รหัสนักศึกษา" required error={errors.studentId}>
                        <input type="text" name="studentId" value={formData.studentId} onChange={handleChange}
                          placeholder="เช่น 65001" className={inputClass(errors.studentId)} />
                      </FormField>
                      {/* prefix */}
                      <FormField label="คำนำหน้า" required error={errors.prefix}>
                        <select name="prefix" value={formData.prefix} onChange={handleChange} className={inputClass(errors.prefix)}>
                          <option value="" hidden>เลือกคำนำหน้า</option>
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                          <option value="อื่นๆ">อื่นๆ (ระบุ)</option>
                        </select>
                      </FormField>
                      {/* custom prefix */}
                      {formData.prefix === "อื่นๆ" && (
                        <FormField label="ระบุคำนำหน้า" required error={errors.prefixCustom}>
                          <input type="text" name="prefixCustom" value={formData.prefixCustom} onChange={handleChange}
                            placeholder="กรอกคำนำหน้า" className={inputClass(errors.prefixCustom)} />
                        </FormField>
                      )}
                      {/* firstname */}
                      <FormField label="ชื่อ" required error={errors.firstname}>
                        <input type="text" name="firstname" value={formData.firstname} onChange={handleChange}
                          placeholder="กรอกชื่อนักศึกษา" className={inputClass(errors.firstname)} />
                      </FormField>
                      {/* lastname */}
                      <FormField label="นามสกุล" required error={errors.lastname}>
                        <input type="text" name="lastname" value={formData.lastname} onChange={handleChange}
                          placeholder="กรอกนามสกุลนักศึกษา" className={inputClass(errors.lastname)} />
                      </FormField>
                      {/* birthday */}
                      <FormField label="วันเกิด" required error={errors.birthday}>
                        <ThaiDatePicker
                          value={formData.birthday}
                          onChange={(v) => setFormData((prev) => ({ ...prev, birthday: v }))}
                          placeholder="เลือกวัน/เดือน/ปี"
                          required
                          name="birthday"
                          className={inputClass(errors.birthday)}
                        />
                      </FormField>
                      {/* phone */}
                      <FormField label="เบอร์โทรศัพท์" required error={errors.phone}>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} maxLength={10}
                          placeholder="เช่น 0987654321" className={inputClass(errors.phone)} />
                      </FormField>
                      {/* department */}
                      <FormField label="แผนกวิชา" required error={errors.departmentId}>
                        <select name="departmentId" value={formData.departmentId ?? ""} onChange={handleChange} className={inputClass(errors.departmentId)}>
                          <option value="" hidden>เลือกแผนกวิชา</option>
                          {departments.map((d: any) => <option key={d.id} value={d.id}>{d.depname}</option>)}
                        </select>
                      </FormField>
                      {/* major */}
                      <FormField label="สาขาวิชา" error={errors.majorId}>
                        <select name="majorId" value={formData.majorId ?? ""} onChange={handleChange} className={inputClass(errors.majorId)}>
                          <option value="" hidden>เลือกสาขาวิชา</option>
                          {filteredMajors.map((m: any) => <option key={m.id} value={m.id}>{m.major_name}</option>)}
                        </select>
                      </FormField>
                      {/* educationLevel */}
                      <FormField label="ระดับชั้น" required error={errors.educationLevel}>
                        <select name="educationLevel" value={formData.educationLevel ?? ""} onChange={handleChange} className={inputClass(errors.educationLevel)}>
                          <option value="" hidden>เลือกระดับชั้น</option>
                          {educations.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </FormField>
                      {/* curriculum */}
                      <FormField label="หลักสูตร">
                        <select name="curriculum" value={formData.curriculum} onChange={handleChange} className={inputClass()}>
                          <option value="">เลือกหลักสูตร</option>
                          <option value="ปกติ">ปกติ</option>
                          <option value="ทวิภาคี">ทวิภาคี</option>
                        </select>
                      </FormField>
                      {/* gradeLevel */}
                      <FormField label="ชั้นปี">
                        <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className={inputClass()}>
                          <option value="">เลือกชั้นปี</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </FormField>
                      {/* room */}
                      <FormField label="ห้อง">
                        <input type="text" name="room" value={formData.room} onChange={handleChange}
                          placeholder="เช่น 1" className={inputClass()} />
                      </FormField>
                      {/* term */}
                      <FormField label="เทอม" required error={errors.term}>
                        <select name="term" value={formData.term} onChange={handleChange} className={inputClass(errors.term)}>
                          <option value="" hidden>เลือกเทอม</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </FormField>
                      {/* academicYear — dropdown with 10-year range */}
                      <FormField label="ปีการศึกษา" required error={errors.academicYear}>
                        <select name="academicYear" value={formData.academicYear} onChange={handleChange} className={inputClass(errors.academicYear)}>
                          <option value="" hidden>เลือกปีการศึกษา</option>
                          {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </FormField>
                    </div>

                    {/* Image upload */}
                    <div className="mt-6">
                      <FormField label="รูปโปรไฟล์">
                        <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}
                          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#2E7D32] transition-colors cursor-pointer">
                          {imagePreview ? (
                            <div className="flex items-center gap-4">
                              <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-700">{formData.user_img?.name || "รูปปัจจุบัน"}</p>
                                <button type="button" onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, user_img: null })); }}
                                  className="text-xs text-red-500 hover:underline mt-1">ลบรูป</button>
                              </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                              <Icon icon="tabler:cloud-upload" width={40} className="text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">ลากไฟล์มาวางหรือ <span className="text-[#2E7D32] font-medium">เลือกไฟล์</span></p>
                              <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG</p>
                              <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
                            </label>
                          )}
                        </div>
                      </FormField>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                      <button onClick={() => { setShowForm(false); setEditId(null); setFormData(getEmptyForm()); setErrors({}); setImagePreview(null); }}
                        className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                        ยกเลิก
                      </button>
                      <button onClick={handleSubmit} disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
                        {isSubmitting ? (
                          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</span>
                        ) : editId ? "บันทึกการแก้ไข" : "เพิ่มนักศึกษา"}
                      </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* ──── Import form ──── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <Icon icon="tabler:file-import" width={24} className="text-[#2E7D32]" />
                <h2 className="text-xl font-bold text-gray-800">นำเข้าข้อมูลจาก Excel</h2>
              </div>

                {/* Step 1: Download template */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon icon="tabler:download" className="text-white" width={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">ขั้นตอนที่ 1: ดาวน์โหลด Template</h3>
                      <p className="text-sm text-gray-600 mb-3">ดาวน์โหลด template Excel แล้วกรอกข้อมูลนักศึกษาตามรูปแบบที่กำหนด</p>
                      <button onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#2E7D32] text-[#2E7D32] rounded-xl text-sm font-medium hover:bg-green-50 transition-colors">
                        <Icon icon="tabler:file-spreadsheet" width={18} /> ดาวน์โหลด Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Upload file */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#2E7D32] rounded-full text-white text-xs flex items-center justify-center">2</span>
                    อัปโหลดไฟล์ Excel
                  </h3>
                  <div onDragOver={(e) => e.preventDefault()} onDrop={handleImportDropFile}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-[#2E7D32] transition-colors">
                    <Icon icon="tabler:file-upload" width={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">ลากไฟล์ .xlsx มาวางที่นี่ หรือ</p>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#1B5E20] transition-colors">
                      <Icon icon="tabler:upload" width={16} /> เลือกไฟล์
                      <input type="file" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Preview */}
                {importData.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#2E7D32] rounded-full text-white text-xs flex items-center justify-center">3</span>
                      ตรวจสอบข้อมูล ({importData.length} รายการ)
                    </h3>

                    {importErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <p className="text-red-700 font-medium mb-2 flex items-center gap-2">
                          <Icon icon="tabler:alert-circle" width={18} /> พบข้อผิดพลาด {importErrors.length} รายการ
                        </p>
                        <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                          {importErrors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                          {importErrors.length > 10 && <li>...และอีก {importErrors.length - 10} รายการ</li>}
                        </ul>
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">รหัส</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">ชื่อ-นามสกุล</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">เบอร์โทร</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importData.slice(0, 50).map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                              <td className="px-4 py-2.5">{row.studentId}</td>
                              <td className="px-4 py-2.5">{row.prefix}{row.firstname} {row.lastname}</td>
                              <td className="px-4 py-2.5">{row.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importData.length > 50 && (
                        <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                          แสดง 50 รายการแรกจากทั้งหมด {importData.length} รายการ
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => { setImportData([]); setImportErrors([]); }}
                        className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                        ยกเลิก
                      </button>
                      <button onClick={handleImportSubmit} disabled={isImporting || importErrors.length > 0}
                        className="px-8 py-3 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50">
                        {isImporting ? (
                          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังนำเข้า...</span>
                        ) : `นำเข้า ${importData.length} รายการ`}
                      </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ──── Search ──── */}
      <div className="relative">
        <Icon icon="tabler:search" width={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาด้วยชื่อ หรือ รหัสนักศึกษา..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-green-100 text-base outline-none transition-all bg-white" />
      </div>

      {/* ──── Table ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Icon icon="tabler:users-group" width={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">ไม่พบข้อมูลนักศึกษา</p>
            <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รหัส</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">แผนก / สาขา</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">ระดับชั้น</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">หลักสูตร</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
              </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((s: any, i: number) => {
                    const fullName = `${s.user?.prefix ?? ""} ${s.user?.firstname ?? ""} ${s.user?.lastname ?? ""}`.trim();
                    return (
                      <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors group">
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-400 font-medium">{i + 1}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm bg-gray-100 px-2.5 py-1 rounded-lg">{s.studentId}</span>
                      </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image src={`/uploads/${s.user?.user_img || "avatar.jpg"}`} width={40} height={40} alt=""
                                className="w-full h-full object-cover" unoptimized />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{fullName || "-"}</p>
                              <p className="text-xs text-gray-400">{s.user?.phone || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-700">{s.department?.depname || "-"}</p>
                          <p className="text-xs text-gray-400">{s.major?.major_name || ""}</p>
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          <p className="text-sm text-gray-700">{s.education?.name || "-"}</p>
                          <p className="text-xs text-gray-400">เทอม {s.term}/{s.academicYear}</p>
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          {s.curriculum ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.curriculum === "ทวิภาคี" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                              {s.curriculum}
                            </span>
                          ) : <span className="text-gray-400 text-sm">-</span>}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleResetPassword(Number(s.user?.id))}
                              className="p-2 hover:bg-yellow-50 rounded-lg transition-colors" title="รีเซ็ตรหัสผ่าน">
                              <Icon icon="tabler:key" width={18} className="text-yellow-500" />
                            </button>
                            <button onClick={() => handleEdit(Number(s.user?.id))}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                              <Icon icon="tabler:edit" width={18} className="text-blue-500" />
                            </button>
                            <button onClick={() => handleDelete(String(s.user?.id))}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                              <Icon icon="tabler:trash" width={18} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
}
