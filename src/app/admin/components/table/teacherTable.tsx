"use client";
import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import useSWR from "swr";
import Image from "next/image";
import ClassroomAssignModal from "../ClassroomAssignModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ──── Role definitions (configurable) ────
const DEFAULT_ROLES = [
  { id: 2, name: "ผู้บริหาร", icon: "tabler:crown", color: "#E65100" },
  { id: 3, name: "รองผู้อำนวยการฝ่ายฯ", icon: "tabler:star", color: "#1565C0" },
  { id: 4, name: "ครูผู้สอน", icon: "tabler:chalkboard", color: "#2E7D32" },
  { id: 5, name: "หัวหน้างานทวิภาคี", icon: "tabler:briefcase", color: "#6A1B9A" },
  { id: 6, name: "เจ้าหน้าที่", icon: "tabler:user-shield", color: "#00695C" },
];

// ──── Utility ────
function maskCitizenId(id: string) {
  if (!id || id.length < 13) return id || "-";
  return id.substring(0, 3) + "-xxxx-xxxxx-" + id.substring(11);
}
function getRoleName(roleId: number, roles: typeof DEFAULT_ROLES) {
  return roles.find((r) => r.id === roleId)?.name ?? "ไม่ระบุ";
}
function getRoleInfo(roleId: number, roles: typeof DEFAULT_ROLES) {
  return roles.find((r) => r.id === roleId) ?? { id: 0, name: "ไม่ระบุ", icon: "tabler:user", color: "#9E9E9E" };
}

// ──── Form validation ────
interface FormData {
  citizenId: string;
  prefix: string;
  prefixCustom: string;
  firstname: string;
  lastname: string;
  phone: string;
  role: number | null;
  departmentId: number | null;
  majorId: number | null;
  room: string;
  educationId: number | null;
  years: string;
  term: string | null;
  grade: string | null;
  user_img: File | null;
}
interface Errors { [key: string]: string; }

function validateField(name: string, value: any, formData: FormData): string {
  switch (name) {
    case "firstname": return !value?.trim() ? "กรุณากรอกชื่อ" : "";
    case "lastname": return !value?.trim() ? "กรุณากรอกนามสกุล" : "";
    case "citizenId":
      if (!value) return "กรุณากรอกเลขบัตรประชาชน";
      if (!/^\d{13}$/.test(value)) return "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
      return "";
    case "phone":
      if (!value) return "กรุณากรอกเบอร์โทร";
      if (!/^0\d{9}$/.test(value)) return "เบอร์โทรต้องเริ่มด้วย 0 ตามด้วยตัวเลข 9 หลัก";
      return "";
    case "prefix": return !value ? "กรุณาเลือกคำนำหน้า" : "";
    case "role": return !value ? "กรุณาเลือกตำแหน่ง" : "";
    case "departmentId":
      if (formData.role && formData.role !== 2 && !value) return "กรุณาเลือกแผนกวิชา";
      return "";
    default: return "";
  }
}

const emptyForm: FormData = {
  citizenId: "", prefix: "", prefixCustom: "", firstname: "", lastname: "",
  phone: "", role: null, departmentId: null, majorId: null, room: "",
  educationId: null, years: "", term: null, grade: null, user_img: null,
};

// ═════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════
const TeacherTable = () => {
  // ─ Data fetching ─
  const { data: teachers, isLoading, error, mutate } = useSWR("/api/teachers", fetcher);
  const { data: deptData } = useSWR("/api/departments", fetcher);
  const { data: majorsData, isLoading: isMajorLoading } = useSWR("/api/major", fetcher);
  const { data: educationsData } = useSWR("/api/education", fetcher);

  // ─ State ─
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [showRolePanel, setShowRolePanel] = useState(false);
  const [filterRole, setFilterRole] = useState<number | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [classroomTeacher, setClassroomTeacher] = useState<{ id: number; name: string } | null>(null);

  const departments = deptData ?? [];
  const educations = educationsData?.data ?? educationsData ?? [];

  // Filtered majors by selected department
  const filteredMajors = useMemo(() => {
    if (!majorsData) return [];
    if (!formData.departmentId) return majorsData;
    return majorsData.filter((m: any) => String(m.departmentId) === String(formData.departmentId));
  }, [majorsData, formData.departmentId]);

  // Search + role filter
  const filtered = useMemo(() => {
    if (!teachers || !Array.isArray(teachers)) return [];
    let result = teachers;
    if (filterRole) {
      result = result.filter((t: any) => Number(t.user?.role) === filterRole);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t: any) => {
        const name = `${t.user?.firstname ?? ""} ${t.user?.lastname ?? ""}`.toLowerCase();
        const cid = t.user?.citizenId?.toLowerCase() ?? "";
        const dep = t.department?.depname?.toLowerCase() ?? "";
        return name.includes(q) || cid.includes(q) || dep.includes(q);
      });
    }
    return result;
  }, [teachers, search, filterRole]);

  // ─ Handlers ─
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newVal = type === "number" || ["role", "departmentId", "majorId", "educationId", "grade", "term"].includes(name)
      ? (value === "" ? null : Number(value))
      : value;
    const newForm = { ...formData, [name]: newVal };
    setFormData(newForm);
    // Real-time validation
    const err = validateField(name, newVal, newForm);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFormData(prev => ({ ...prev, user_img: file }));
    setImgPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, user_img: null }));
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateAll = (): boolean => {
    const fields = ["citizenId", "prefix", "firstname", "lastname", "phone", "role"];
    if (formData.role && formData.role !== 2) fields.push("departmentId");
    const newErrors: Errors = {};
    let valid = true;
    fields.forEach(f => {
      const err = validateField(f, (formData as any)[f], formData);
      if (err) { newErrors[f] = err; valid = false; }
    });
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("citizenId", formData.citizenId);
      fd.append("firstname", formData.firstname);
      fd.append("lastname", formData.lastname);
      const prefix = formData.prefix === "อื่นๆ" ? formData.prefixCustom : formData.prefix;
      fd.append("prefix", prefix);
      fd.append("departmentId", String(formData.departmentId ?? ""));
      fd.append("phone", formData.phone);
      fd.append("role", String(formData.role ?? ""));
      fd.append("majorId", String(formData.majorId ?? ""));
      fd.append("room", formData.room);
      fd.append("educationId", String(formData.educationId ?? ""));
      fd.append("years", formData.years);
      fd.append("term", String(formData.term ?? ""));
      fd.append("grade", String(formData.grade ?? ""));
      if (formData.user_img) fd.append("user_img", formData.user_img);

      const url = editId ? `/api/teachers/${editId}` : "/api/teachers";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      showToast(data.message, data.type);

      if (res.ok) {
        setFormData({ ...emptyForm });
        setErrors({});
        setImgPreview(null);
        setEditId(null);
        setShowForm(false);
        mutate();
      }
    } finally { setIsSubmitting(false); }
  };

  const handleEdit = async (userId: string) => {
    setIsLoadingEdit(true);
    try {
      const res = await fetch(`/api/teachers/${userId}`, { cache: "no-store" });
      const data = await res.json();
      const prefixVal = data.prefix || "";
      const isCustomPrefix = !["นาย", "นาง", "นางสาว"].includes(prefixVal);
      setFormData({
        citizenId: data.citizenId || "",
        prefix: isCustomPrefix && prefixVal ? "อื่นๆ" : prefixVal,
        prefixCustom: isCustomPrefix ? prefixVal : "",
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        phone: data.phone || "",
        role: data.role ?? null,
        departmentId: data.teacher?.departmentId ?? null,
        majorId: data.teacher?.majorId ?? null,
        room: data.teacher?.room ?? "",
        educationId: data.teacher?.educationId ?? null,
        years: data.teacher?.years ?? "",
        term: data.teacher?.term ?? null,
        grade: data.teacher?.grade ?? null,
        user_img: null,
      });
      setImgPreview(data.user_img ? `/uploads/${data.user_img}` : null);
      setEditId(userId);
      setShowForm(true);
      setErrors({});
    } finally { setIsLoadingEdit(false); }
  };

  const handleDelete = async (userId: string, name: string) => {
    Swal.fire({
      title: "ยืนยันการลบ?",
      html: `<p style="font-size:16px">ลบบุคลากร <strong>"${name}"</strong> ?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/teachers/${userId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        showToast(data.message, data.type);
        if (res.ok) mutate();
      }
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ ...emptyForm });
    setErrors({});
    setImgPreview(null);
  };

  // Count by role
  const roleCounts = useMemo(() => {
    if (!teachers || !Array.isArray(teachers)) return {};
    const counts: Record<number, number> = {};
    teachers.forEach((t: any) => {
      const r = Number(t.user?.role);
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [teachers]);

  return (
    <div className="space-y-6">
      {/* ═══ Page Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1565C0] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Icon icon="tabler:users-group" height={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลบุคลากร</h1>
            <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ และค้นหาข้อมูลบุคลากร</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-xl shadow-sm">
            <Icon icon="tabler:users" height={16} className="text-[#1565C0]" />
            <span><strong className="text-gray-800">{teachers?.length ?? 0}</strong> คน</span>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) cancelForm(); }}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-2 transition-all duration-200 shadow-lg ${showForm ? "bg-gray-500 hover:bg-gray-600 shadow-gray-200" : "bg-[#2E7D32] hover:bg-[#1B5E20] shadow-green-200"}`}>
            <Icon icon={showForm ? "tabler:x" : "tabler:plus"} height={18} />
            {showForm ? "ปิดฟอร์ม" : "เพิ่มบุคลากร"}
          </button>
        </div>
      </div>

      {/* ═══ Role Filter Chips ═══ */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterRole(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!filterRole ? "bg-[#1565C0] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
          ทั้งหมด ({teachers?.length ?? 0})
        </button>
        {roles.map((role) => (
          <button key={role.id} onClick={() => setFilterRole(filterRole === role.id ? null : role.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${filterRole === role.id ? "text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
            style={filterRole === role.id ? { backgroundColor: role.color } : {}}>
            <Icon icon={role.icon} height={16} />
            {role.name} ({roleCounts[role.id] ?? 0})
          </button>
        ))}
      </div>

      {/* ═══ Inline Add/Edit Form ═══ */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in">
          <div className={`px-6 py-4 border-b flex items-center gap-2 ${editId ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100"}`}>
            <Icon icon={editId ? "tabler:edit" : "tabler:user-plus"} height={22} className={editId ? "text-[#E65100]" : "text-[#2E7D32]"} />
            <h2 className="text-xl font-bold text-gray-800">{editId ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มข้อมูลบุคลากรใหม่"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {isLoadingEdit ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-[#1565C0] rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* citizenId */}
                  <FormField label="เลขบัตรประชาชน" required error={errors.citizenId}>
                    <input type="text" name="citizenId" value={formData.citizenId} onChange={handleChange} maxLength={13}
                      placeholder="เช่น 1103702589654" className={inputClass(errors.citizenId)} />
                  </FormField>
                  {/* phone */}
                  <FormField label="เบอร์โทรศัพท์" required error={errors.phone}>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} maxLength={10}
                      placeholder="เช่น 0987654321" className={inputClass(errors.phone)} />
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
                      placeholder="กรอกชื่อบุคลากร" className={inputClass(errors.firstname)} />
                  </FormField>
                  {/* lastname */}
                  <FormField label="นามสกุล" required error={errors.lastname}>
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleChange}
                      placeholder="กรอกนามสกุลบุคลากร" className={inputClass(errors.lastname)} />
                  </FormField>
                  {/* role */}
                  <FormField label="ตำแหน่ง" required error={errors.role}>
                    <select name="role" value={formData.role ?? ""} onChange={handleChange} className={inputClass(errors.role)}>
                      <option value="" hidden>เลือกตำแหน่ง</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </FormField>
                  {/* department */}
                  {formData.role !== 2 && (
                    <FormField label="แผนกวิชา" required={formData.role !== 2} error={errors.departmentId}>
                      <select name="departmentId" value={formData.departmentId ?? ""} onChange={handleChange} className={inputClass(errors.departmentId)}>
                        <option value="" hidden>เลือกแผนกวิชา</option>
                        {departments.map((d: any) => <option key={d.id} value={d.id}>{d.depname}</option>)}
                      </select>
                    </FormField>
                  )}

                    {/* Conditional fields for ครูผู้สอน and หัวหน้างานทวิภาคี */}
                    {(formData.role === 4 || formData.role === 5) && (
                      <>
                        {/* major */}
                        <FormField label="สาขาวิชา" error={errors.majorId}>
                          <select name="majorId" value={formData.majorId ?? ""} onChange={handleChange} className={inputClass(errors.majorId)}>
                            <option value="" hidden>เลือกสาขาวิชา</option>
                            {filteredMajors.length > 0
                              ? filteredMajors.map((m: any) => <option key={m.id} value={m.id}>{m.major_name}</option>)
                              : <option disabled>ไม่มีสาขาวิชาในแผนกนี้</option>
                            }
                          </select>
                        </FormField>
                        {/* education */}
                        <FormField label="ระดับการศึกษา (ที่รับผิดชอบ)" error={errors.educationId}>
                          <select name="educationId" value={formData.educationId ?? ""} onChange={handleChange} className={inputClass(errors.educationId)}>
                            <option value="" hidden>เลือกระดับการศึกษา</option>
                            {Array.isArray(educations) && educations.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </FormField>
                        {/* grade */}
                        <FormField label="ชั้นปี (ที่รับผิดชอบ)" error={errors.grade}>
                          <select name="grade" value={formData.grade ?? ""} onChange={handleChange} className={inputClass(errors.grade)}>
                            <option value="" hidden>เลือกชั้นปี</option>
                            <option value="1">ปี 1</option>
                            <option value="2">ปี 2</option>
                            <option value="3">ปี 3</option>
                          </select>
                        </FormField>
                        {/* room */}
                        <FormField label="ห้อง / กลุ่ม" error={errors.room}>
                          <input type="text" name="room" value={formData.room} onChange={handleChange}
                            placeholder="ห้องหรือกลุ่มที่รับผิดชอบ" className={inputClass(errors.room)} />
                        </FormField>
                        {/* term */}
                        <FormField label="ภาคเรียน" error={errors.term}>
                          <select name="term" value={formData.term ?? ""} onChange={handleChange} className={inputClass(errors.term)}>
                            <option value="" hidden>เลือกภาคเรียน</option>
                            <option value="1">ภาคเรียนที่ 1</option>
                            <option value="2">ภาคเรียนที่ 2</option>
                            <option value="3">ภาคเรียนที่ 3</option>
                          </select>
                        </FormField>
                        {/* years */}
                        <FormField label="ปีการศึกษา" error={errors.years}>
                          <input type="text" name="years" value={formData.years} onChange={handleChange}
                            placeholder="เช่น 2569" className={inputClass(errors.years)} />
                        </FormField>
                      </>
                    )}

                    {/* profile image — drag & drop zone */}
                    <div className="md:col-span-2">
                      <FormField label="รูปโปรไฟล์" error={errors.user_img}>
                        {imgPreview ? (
                          /* ── File selected: show preview ── */
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                              <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-gray-800 truncate">
                                {formData.user_img?.name ?? "รูปปัจจุบัน"}
                              </p>
                              {formData.user_img && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {(formData.user_img.size / 1024).toFixed(1)} KB
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                  className="text-sm font-semibold text-[#1565C0] hover:text-[#0D47A1] transition-colors flex items-center gap-1">
                                  <Icon icon="tabler:refresh" height={14} />เปลี่ยนรูป
                                </button>
                                <button type="button" onClick={removeFile}
                                  className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                                  <Icon icon="tabler:trash" height={14} />ลบรูป
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── No file: drag & drop zone ── */
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
                              ? "border-[#1565C0] bg-blue-50 scale-[1.01]"
                              : "border-gray-300 bg-gray-50 hover:border-[#1565C0] hover:bg-blue-50/50"
                              }`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-[#1565C0] text-white" : "bg-gray-200 text-gray-500"
                              }`}>
                              <Icon icon="tabler:cloud-upload" height={28} />
                            </div>
                            <p className="text-base font-semibold text-gray-700">
                              เลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              รองรับไฟล์ JPEG, PNG ขนาดไม่เกิน 5MB
                            </p>
                            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                              className="mt-4 px-5 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1565C0] hover:text-[#1565C0] transition-all">
                              Browse File
                            </button>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" name="user_img" accept="image/jpeg,image/png"
                          onChange={handleFileChange} className="hidden" />
                      </FormField>
                    </div>
                  </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSubmitting}
                    className={`px-8 py-3 rounded-xl font-bold text-lg text-white flex items-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-lg ${editId ? "bg-[#E65100] hover:bg-[#BF360C] shadow-orange-200" : "bg-[#2E7D32] hover:bg-[#1B5E20] shadow-green-200"}`}>
                    {isSubmitting
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Icon icon={editId ? "tabler:device-floppy" : "tabler:user-plus"} height={22} />}
                    {editId ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
                  </button>
                  <button type="button" onClick={cancelForm}
                    className="px-8 py-3 rounded-xl font-bold text-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2">
                    <Icon icon="tabler:x" height={20} />ยกเลิก
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* ═══ Search + Personnel Table ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="relative max-w-md">
            <Icon icon="tabler:search" height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาบุคลากร (ชื่อ, เลขบัตร, แผนก)..."
              className="w-full pl-10 pr-10 py-2.5 text-base border-2 border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C040] focus:bg-white transition-all duration-200" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Icon icon="tabler:x" height={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-[#1565C0] rounded-full animate-spin" />
              <span className="text-gray-500 text-base">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-500">
            <Icon icon="tabler:alert-circle" height={48} className="mx-auto mb-3 text-red-400" />
            <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon icon="tabler:users-minus" height={48} className="mx-auto mb-3" />
            <p className="text-lg font-medium">{search || filterRole ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลบุคลากร"}</p>
            <p className="text-sm mt-1">{search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : "กดปุ่ม + เพิ่มบุคลากร ด้านบนเพื่อเริ่มต้น"}</p>
          </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-sm font-semibold text-gray-500 px-6 py-3 w-12">#</th>
                        <th className="text-left text-sm font-semibold text-gray-500 px-4 py-3">บุคลากร</th>
                        <th className="text-left text-sm font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">เลขบัตรประชาชน</th>
                        <th className="text-left text-sm font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">ตำแหน่ง</th>
                        <th className="text-left text-sm font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">แผนก</th>
                        <th className="text-right text-sm font-semibold text-gray-500 px-6 py-3">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((t: any, i: number) => {
                        const roleInfo = getRoleInfo(Number(t.user?.role), roles);
                        const fullName = `${t.user?.prefix ?? ""} ${t.user?.firstname ?? ""} ${t.user?.lastname ?? ""}`.trim();
                        return (
                          <tr key={t.id} className="hover:bg-[#F5F5F5] transition-colors group">
                            <td className="px-6 py-3">
                              <span className="text-sm text-gray-400 font-mono">{i + 1}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                  <Image src={`/uploads/${t.user?.user_img || "avatar.jpg"}`} width={40} height={40}
                                    alt="avatar" className="w-full h-full object-cover" unoptimized />
                                </div>
                                <div>
                                  <p className="text-base font-semibold text-gray-800 leading-tight">{fullName}</p>
                                  <p className="text-xs text-gray-400 mt-0.5 md:hidden">{maskCitizenId(t.user?.citizenId)}</p>
                                  <p className="text-xs mt-0.5 lg:hidden inline-flex items-center gap-1 font-medium" style={{ color: roleInfo.color }}>
                                    <Icon icon={roleInfo.icon} height={12} />{roleInfo.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-sm text-gray-600 font-mono">{maskCitizenId(t.user?.citizenId)}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: roleInfo.color }}>
                                <Icon icon={roleInfo.icon} height={14} />{roleInfo.name}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-sm text-gray-600">{t.department?.depname ?? "-"}</span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {(Number(t.user?.role) === 4 || Number(t.user?.role) === 5) && (
                                  <button
                                    onClick={() => setClassroomTeacher({ id: t.id, name: fullName })}
                                    title="จัดการห้องเรียน"
                                    className="p-2 rounded-xl text-gray-400 hover:text-[#2E7D32] hover:bg-green-50 transition-all"
                                  >
                                    <Icon icon="tabler:school" height={18} />
                                  </button>
                                )}
                                <button onClick={() => handleEdit(t.user?.id as string)} title="แก้ไข"
                                  className="p-2 rounded-xl text-gray-400 hover:text-[#E65100] hover:bg-orange-50 transition-all">
                                  <Icon icon="tabler:edit" height={18} />
                                </button>
                                <button onClick={() => handleDelete(t.user?.id as string, fullName)} title="ลบ"
                                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                  <Icon icon="tabler:trash" height={18} />
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

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <span>
              แสดง <strong className="text-gray-700">{filtered.length}</strong> จาก <strong className="text-gray-700">{teachers?.length ?? 0}</strong> คน
            </span>
          </div>
        )}
      </div>
      {/* Classroom Assign Modal */}
      {classroomTeacher && (
        <ClassroomAssignModal
          teacherId={classroomTeacher.id}
          teacherName={classroomTeacher.name}
          onClose={() => setClassroomTeacher(null)}
        />
      )}
    </div>
  );
};

// ──── Form Field Sub-component ────
function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-base font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-500 text-sm animate-in">
          <Icon icon="tabler:alert-circle" height={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-3 text-base border-2 rounded-xl bg-gray-50 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:bg-white ${error
    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200"
    : "border-gray-200 focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C040]"
    }`;
}

export default TeacherTable;
