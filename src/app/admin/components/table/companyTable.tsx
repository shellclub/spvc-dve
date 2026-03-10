"use client";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

// ──── Autocomplete Component ────
function Autocomplete({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect: (item: any) => void;
  suggestions: any[];
  placeholder: string;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onSelect(s); setOpen(false); }}
              className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <p className="font-semibold text-sm text-gray-800">{s.name}</p>
              {s.address && <p className="text-xs text-gray-400 truncate">{s.address}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ──── Types ────
interface FormData {
  name: string;
  address: string;
  firstname: string;
  lastname: string;
  phone: string;
  position: string;
}
interface Errors { [key: string]: string; }

function validateField(name: string, value: any): string {
  switch (name) {
    case "name": return !value?.trim() ? "กรุณากรอกชื่อสถานประกอบการ" : "";
    case "firstname": return !value?.trim() ? "กรุณากรอกชื่อ" : "";
    case "lastname": return !value?.trim() ? "กรุณากรอกนามสกุล" : "";
    case "phone":
      if (value && !/^0\d{8,9}$/.test(value)) return "เบอร์โทรไม่ถูกต้อง";
      return "";
    default: return "";
  }
}

const emptyForm: FormData = {
  name: "", address: "", firstname: "", lastname: "", phone: "", position: "",
};

// ═══════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════
const CompaniesTable = () => {
  // ─ Data ─
  const { data: companies, isLoading, mutate } = useSWR("/api/company", fetcher);

  // ─ State ─
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─ CSS helper ─
  const inputClass = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border-2 text-base transition-all duration-200 outline-none bg-white
     ${err ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-green-100"}`;

  // ─ Company name autocomplete ─
  const companySuggestions = useMemo(() => {
    if (!companies || !formData.name.trim() || editId) return [];
    const q = formData.name.toLowerCase();
    return companies.filter((c: any) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [companies, formData.name, editId]);

  // ─ Filtered companies ─
  const filtered = useMemo(() => {
    if (!companies) return [];
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter((c: any) => {
      const companyName = (c.name || "").toLowerCase();
      const contactName = `${c.user?.firstname ?? ""} ${c.user?.lastname ?? ""}`.toLowerCase();
      const address = (c.address || "").toLowerCase();
      const phone = (c.user?.phone || "").toLowerCase();
      return companyName.includes(q) || contactName.includes(q) || address.includes(q) || phone.includes(q);
    });
  }, [companies, search]);

  // ─ Handlers ─
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleCompanyNameChange = (val: string) => {
    setFormData((prev) => ({ ...prev, name: val }));
    setSelectedCompanyId(null);
    if (errors.name) {
      const err = validateField("name", val);
      setErrors((prev) => ({ ...prev, name: err }));
    }
  };

  const handleCompanySelect = (company: any) => {
    setFormData((prev) => ({
      ...prev,
      name: company.name,
      address: company.address || "",
    }));
    setSelectedCompanyId(company.id);
  };

  const validateAll = (): boolean => {
    const fields = ["name", "firstname", "lastname"];
    const newErrors: Errors = {};
    let valid = true;
    for (const f of fields) {
      const err = validateField(f, (formData as any)[f]);
      if (err) { newErrors[f] = err; valid = false; }
    }
    const phoneErr = validateField("phone", formData.phone);
    if (phoneErr) { newErrors.phone = phoneErr; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      const url = editId ? `/api/company/${editId}` : "/api/company";
      const method = editId ? "PUT" : "POST";
      const payload: any = {
        ...formData,
        selectedCompanyId: selectedCompanyId,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "เกิดข้อผิดพลาด");
      showToast(result.message || (editId ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มข้อมูลสถานประกอบการเรียบร้อย"), "success");
      setShowForm(false);
      setEditId(null);
      setSelectedCompanyId(null);
      setFormData({ ...emptyForm });
      setErrors({});
      mutate();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาด", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (company: any) => {
    setShowForm(true);
    setEditId(company.id);
    setSelectedCompanyId(null);
    setFormData({
      name: company.name || "",
      address: company.address || "",
      firstname: company.user?.firstname || "",
      lastname: company.user?.lastname || "",
      phone: company.user?.phone || "",
      position: company.user?.prefix || "",
    });
    setErrors({});
  };

  const handleDelete = (companyId: number, userId: number) => {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "ข้อมูลสถานประกอบการจะถูกลบออกจากระบบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/company/${companyId}`, { method: "DELETE" });
        const data = await res.json();
        showToast(data.message, res.ok ? "success" : "error");
        if (res.ok) mutate();
      }
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setSelectedCompanyId(null);
    setFormData({ ...emptyForm });
    setErrors({});
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

  return (
    <div className="space-y-6">
      {/* ──── Header ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
            <Icon icon="tabler:building" className="text-white" width={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลสถานประกอบการ</h1>
            <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ และค้นหาข้อมูลสถานประกอบการ</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
            <Icon icon="tabler:building" width={18} /> {(companies ?? []).length} แห่ง
          </span>
          {showForm ? (
            <button onClick={closeForm}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors shadow">
              <Icon icon="tabler:x" width={18} /> ปิดฟอร์ม
            </button>
          ) : (
            <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ ...emptyForm }); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
              <Icon icon="tabler:plus" width={18} /> เพิ่มสถานประกอบการ
            </button>
          )}
        </div>
      </div>

      {/* ──── Form ──── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Icon icon={editId ? "tabler:edit" : "tabler:building-plus"} width={24} className="text-[#2E7D32]" />
            <h2 className="text-xl font-bold text-gray-800">{editId ? "แก้ไขข้อมูลสถานประกอบการ" : "เพิ่มสถานประกอบการใหม่"}</h2>
          </div>

          {/* Company info section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#2E7D32] rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-700">ข้อมูลสถานประกอบการ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <FormField label="ชื่อสถานประกอบการ" required error={errors.name}>
                <Autocomplete
                  value={formData.name}
                  onChange={handleCompanyNameChange}
                  onSelect={handleCompanySelect}
                  suggestions={companySuggestions}
                  placeholder="พิมพ์เพื่อค้นหา หรือเพิ่มชื่อใหม่"
                  className={inputClass(errors.name)}
                />
                {selectedCompanyId && (
                  <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <Icon icon="tabler:check" width={14} /> เลือกจากสถานประกอบการที่มีอยู่
                  </span>
                )}
              </FormField>
              <FormField label="ที่อยู่">
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  placeholder="ที่อยู่สถานประกอบการ" className={inputClass()} />
              </FormField>
            </div>
          </div>

          {/* Contact person section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#2E7D32] rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-700">ข้อมูลผู้ติดต่อ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <FormField label="ชื่อ" required error={errors.firstname}>
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange}
                  placeholder="ชื่อผู้ติดต่อ" className={inputClass(errors.firstname)} />
              </FormField>
              <FormField label="นามสกุล" required error={errors.lastname}>
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange}
                  placeholder="นามสกุลผู้ติดต่อ" className={inputClass(errors.lastname)} />
              </FormField>
              <FormField label="เบอร์โทรศัพท์" error={errors.phone}>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  maxLength={10} placeholder="เช่น 0891234567" className={inputClass(errors.phone)} />
              </FormField>
              <FormField label="ตำแหน่ง">
                <input type="text" name="position" value={formData.position} onChange={handleChange}
                  placeholder="เช่น ผู้จัดการ, หัวหน้างาน" className={inputClass()} />
              </FormField>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button onClick={closeForm}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
              ยกเลิก
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
              {isSubmitting ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</span>
              ) : editId ? "บันทึกการแก้ไข" : "เพิ่มสถานประกอบการ"}
            </button>
          </div>
        </div>
      )}

      {/* ──── Search ──── */}
      <div className="relative">
        <Icon icon="tabler:search" width={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาด้วยชื่อสถานประกอบการ, ที่อยู่ หรือผู้ติดต่อ..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-green-100 text-base outline-none transition-all bg-white" />
      </div>

      {/* ──── Table ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Icon icon="tabler:building-off" width={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">ไม่พบข้อมูลสถานประกอบการ</p>
            <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มสถานประกอบการใหม่</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อสถานประกอบการ</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">ที่อยู่</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ผู้ติดต่อ</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-24">จัดการ</th>
                  </tr>
              </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c: any, i: number) => (
                    <tr key={c.id} className="hover:bg-[#F5F5F5] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 font-medium">{i + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Icon icon="tabler:building" width={20} className="text-[#2E7D32]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px]">{c.name || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 truncate max-w-[250px]">{c.address || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {c.user ? `${c.user.firstname} ${c.user.lastname}` : "-"}
                          </p>
                          {c.user?.prefix && (
                            <p className="text-xs text-green-600">{c.user.prefix}</p>
                          )}
                          {c.user?.phone && (
                            <p className="text-xs text-gray-400">{c.user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(c)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                          <Icon icon="tabler:edit" width={18} className="text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.user?.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                          <Icon icon="tabler:trash" width={18} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesTable;