"use client";
import React, { FormEvent, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface PaginationTableType {
  id?: number | string;
  depname?: string;
}

const TableDepartment = () => {
  const [search, setSearch] = useState("");
  // Department form
  const [depname, setDepname] = useState("");
  const [editingDepId, setEditingDepId] = useState<string | null>(null);
  const [isSubmittingDep, setIsSubmittingDep] = useState(false);
  // Major form
  const [majorName, setMajorName] = useState("");
  const [editingMajorId, setEditingMajorId] = useState<string | null>(null);
  const [isSubmittingMajor, setIsSubmittingMajor] = useState(false);
  // Expanded departments (show majors)
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  // Which department is adding a major
  const [addingMajorForDept, setAddingMajorForDept] = useState<string | null>(null);

  const { data: deptData, isLoading: deptLoading, error: deptError, mutate: mutateDept } = useSWR("/api/departments", fetcher);
  const { data: majorData, mutate: mutateMajor } = useSWR("/api/major", fetcher);

  // Group majors by departmentId
  const majorsByDept = useMemo(() => {
    if (!majorData || !Array.isArray(majorData)) return {};
    const map: Record<string, any[]> = {};
    majorData.forEach((m: any) => {
      const key = String(m.departmentId);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [majorData]);

  // Filter departments
  const filteredDepts = useMemo(() => {
    if (!deptData || !Array.isArray(deptData)) return [];
    if (!search.trim()) return deptData;
    const q = search.toLowerCase();
    return deptData.filter((d: any) => {
      if (d.depname?.toLowerCase().includes(q)) return true;
      // Also search in majors of this department
      const deptMajors = majorsByDept[String(d.id)] || [];
      return deptMajors.some((m: any) => m.major_name?.toLowerCase().includes(q));
    });
  }, [deptData, search, majorsByDept]);

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  // ──── Department CRUD ────
  const handleDeleteDept = async (id: string, name: string) => {
    const deptMajors = majorsByDept[id] || [];
    Swal.fire({
      title: "ยืนยันการลบ?",
      html: `<p style="font-size:16px">ลบแผนกวิชา <strong>"${name}"</strong>${deptMajors.length > 0 ? ` และสาขาวิชาทั้งหมด ${deptMajors.length} สาขา` : ""} ?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/departments/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        showToast(data.message, data.type);
        if (res.ok) { mutateDept(); mutateMajor(); }
      }
    });
  };

  const startEditDept = (id: string, name: string) => {
    setEditingDepId(id);
    setDepname(name);
    setEditingMajorId(null);
    setAddingMajorForDept(null);
  };

  const cancelEditDept = () => { setEditingDepId(null); setDepname(""); };

  const handleSubmitDept = async (e: FormEvent) => {
    e.preventDefault();
    if (!depname.trim()) return;
    setIsSubmittingDep(true);
    try {
      const url = editingDepId ? `/api/departments/${editingDepId}` : "/api/departments";
      const method = editingDepId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ depname: depname.trim() }) });
      const data = await res.json();
      showToast(data.message, data.type);
      if (res.ok) { setDepname(""); setEditingDepId(null); mutateDept(); }
    } finally { setIsSubmittingDep(false); }
  };

  // ──── Major CRUD ────
  const handleDeleteMajor = async (id: string, name: string) => {
    Swal.fire({
      title: "ยืนยันการลบ?",
      html: `<p style="font-size:16px">ลบสาขาวิชา <strong>"${name}"</strong> ?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/major/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        showToast(data.message, data.type);
        if (res.ok) mutateMajor();
      }
    });
  };

  const startEditMajor = (majorId: string, name: string, deptId: string) => {
    setEditingMajorId(majorId);
    setMajorName(name);
    setAddingMajorForDept(deptId);
    setEditingDepId(null);
  };

  const cancelEditMajor = () => { setEditingMajorId(null); setMajorName(""); setAddingMajorForDept(null); };

  const startAddMajor = (deptId: string) => {
    setAddingMajorForDept(deptId);
    setEditingMajorId(null);
    setMajorName("");
    setEditingDepId(null);
    // Auto-expand
    setExpandedDepts(prev => { const next = new Set(prev); next.add(deptId); return next; });
  };

  const handleSubmitMajor = async (e: FormEvent, deptId: string) => {
    e.preventDefault();
    if (!majorName.trim()) return;
    setIsSubmittingMajor(true);
    try {
      const url = editingMajorId ? `/api/major/${editingMajorId}` : "/api/major";
      const method = editingMajorId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major_name: majorName.trim(), department: deptId }),
      });
      const data = await res.json();
      showToast(data.message, data.type);
      if (res.ok) { setMajorName(""); setEditingMajorId(null); setAddingMajorForDept(null); mutateMajor(); }
    } finally { setIsSubmittingMajor(false); }
  };

  // Count total majors
  const totalMajors = majorData?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#E65100] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Icon icon="tabler:building-community" height={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการแผนกวิชาและสาขาวิชา</h1>
            <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ แผนกวิชา พร้อมสาขาวิชาภายใต้แต่ละแผนก</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-xl shadow-sm">
            <Icon icon="tabler:building" height={16} className="text-[#E65100]" />
            <span><strong className="text-gray-800">{deptData?.length ?? 0}</strong> แผนก</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-xl shadow-sm">
            <Icon icon="tabler:bookmark" height={16} className="text-[#1565C0]" />
            <span><strong className="text-gray-800">{totalMajors}</strong> สาขา</span>
          </div>
        </div>
      </div>

      {/* ─── Add / Edit Department Form ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <Icon icon={editingDepId ? "tabler:edit" : "tabler:plus"} height={20} className={editingDepId ? "text-[#E65100]" : "text-[#2E7D32]"} />
          <h2 className="text-lg font-semibold text-gray-700">
            {editingDepId ? "แก้ไขแผนกวิชา" : "เพิ่มแผนกวิชาใหม่"}
          </h2>
        </div>
        <form onSubmit={handleSubmitDept} className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Icon icon="tabler:building" height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={depname}
                onChange={(e) => setDepname(e.target.value)}
                placeholder="กรอกชื่อแผนกวิชา เช่น แผนกช่างยนต์"
                className="w-full pl-10 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D3240] focus:bg-white transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmittingDep || !depname.trim()}
                className={`px-6 py-3 rounded-xl font-semibold text-white text-base flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editingDepId ? "bg-[#E65100] hover:bg-[#BF360C] shadow-lg shadow-orange-200" : "bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg shadow-green-200"}`}>
                {isSubmittingDep ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon icon={editingDepId ? "tabler:check" : "tabler:plus"} height={20} />}
                {editingDepId ? "บันทึก" : "เพิ่มแผนก"}
              </button>
              {editingDepId && (
                <button type="button" onClick={cancelEditDept} className="px-4 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center gap-1">
                  <Icon icon="tabler:x" height={18} />ยกเลิก
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ─── Search + Department List ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="relative max-w-md">
            <Icon icon="tabler:search" height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาแผนกวิชาหรือสาขาวิชา..."
              className="w-full pl-10 pr-10 py-2.5 text-base border-2 border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D3240] focus:bg-white transition-all duration-200" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Icon icon="tabler:x" height={16} />
              </button>
            )}
          </div>
        </div>

        {/* Department list with expandable majors */}
        {deptLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#E8F5E9] border-t-[#2E7D32] rounded-full animate-spin" />
              <span className="text-gray-500 text-base">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        ) : deptError ? (
          <div className="text-center py-16 text-gray-500">
            <Icon icon="tabler:alert-circle" height={48} className="mx-auto mb-3 text-red-400" />
            <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          </div>
          ) : filteredDepts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Icon icon="tabler:building-off" height={48} className="mx-auto mb-3" />
              <p className="text-lg font-medium">{search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีแผนกวิชา"}</p>
              <p className="text-sm mt-1">{search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : "เริ่มต้นเพิ่มแผนกวิชาด้านบน"}</p>
            </div>
        ) : (
                <div className="divide-y divide-gray-100">
                  {filteredDepts.map((dept: any, i: number) => {
                    const deptId = String(dept.id);
                    const isExpanded = expandedDepts.has(deptId);
                    const deptMajors = majorsByDept[deptId] || [];
                    const isAddingMajor = addingMajorForDept === deptId;

                    return (
                      <div key={dept.id}>
                        {/* Department row */}
                        <div className={`flex items-center gap-3 px-6 py-4 group hover:bg-[#F1F8E9] transition-colors cursor-pointer ${editingDepId === deptId ? "bg-orange-50" : ""}`}
                          onClick={() => toggleExpand(deptId)}>
                          {/* Expand arrow */}
                          <Icon icon="tabler:chevron-right" height={18}
                            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                          {/* Number badge */}
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold group-hover:bg-[#E8F5E9] group-hover:text-[#2E7D32] transition-colors flex-shrink-0">
                            {i + 1}
                          </span>
                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                            <Icon icon="tabler:building" height={18} className="text-[#E65100]" />
                          </div>
                          {/* Name & major count */}
                          <div className="flex-1 min-w-0">
                            <span className="text-base font-semibold text-gray-800">{dept.depname}</span>
                            <span className="ml-3 text-xs text-gray-400 font-medium">
                              {deptMajors.length > 0 ? `${deptMajors.length} สาขาวิชา` : "ยังไม่มีสาขาวิชา"}
                            </span>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => startAddMajor(deptId)} title="เพิ่มสาขาวิชา"
                              className="p-2 rounded-xl text-gray-400 hover:text-[#1565C0] hover:bg-blue-50 transition-all duration-200">
                              <Icon icon="tabler:plus" height={18} />
                            </button>
                            <button onClick={() => startEditDept(deptId, dept.depname)} title="แก้ไขแผนก"
                              className="p-2 rounded-xl text-gray-400 hover:text-[#E65100] hover:bg-orange-50 transition-all duration-200">
                              <Icon icon="tabler:edit" height={18} />
                            </button>
                            <button onClick={() => handleDeleteDept(deptId, dept.depname)} title="ลบแผนก"
                              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                              <Icon icon="tabler:trash" height={18} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded: majors section */}
                        {isExpanded && (
                          <div className="bg-[#FAFAFA] border-t border-gray-100">
                            {/* Major add/edit form */}
                            {isAddingMajor && (
                              <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100">
                                <form onSubmit={(e) => handleSubmitMajor(e, deptId)} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                  <div className="flex items-center gap-2 text-sm text-[#1565C0] font-medium flex-shrink-0">
                                    <Icon icon={editingMajorId ? "tabler:edit" : "tabler:plus"} height={16} />
                                    {editingMajorId ? "แก้ไขสาขา:" : "เพิ่มสาขาใหม่:"}
                                  </div>
                                  <div className="flex-1 relative w-full sm:w-auto">
                                    <input type="text" value={majorName} onChange={(e) => setMajorName(e.target.value)}
                                      placeholder="กรอกชื่อสาขาวิชา"
                                      autoFocus
                                      className="w-full pl-4 pr-4 py-2 text-sm border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C040] transition-all duration-200" />
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={isSubmittingMajor || !majorName.trim()}
                                      className="px-4 py-2 rounded-lg font-semibold text-white text-sm bg-[#1565C0] hover:bg-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-sm">
                                      {isSubmittingMajor ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon icon="tabler:check" height={16} />}
                                      {editingMajorId ? "บันทึก" : "เพิ่ม"}
                                    </button>
                                    <button type="button" onClick={cancelEditMajor}
                                      className="px-3 py-2 rounded-lg text-sm text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
                                      ยกเลิก
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Major list */}
                            {deptMajors.length === 0 && !isAddingMajor ? (
                              <div className="px-12 py-6 text-center text-gray-400">
                                <Icon icon="tabler:bookmark-off" height={32} className="mx-auto mb-2" />
                                <p className="text-sm">ยังไม่มีสาขาวิชาในแผนกนี้</p>
                                <button onClick={() => startAddMajor(deptId)}
                                  className="mt-2 text-sm text-[#1565C0] hover:underline font-medium inline-flex items-center gap-1">
                                  <Icon icon="tabler:plus" height={14} />เพิ่มสาขาวิชา
                                </button>
                              </div>
                      ) : (
                        <div className="divide-y divide-gray-100/80">
                          {deptMajors.map((major: any, j: number) => (
                            <div key={major.id}
                              className={`flex items-center gap-3 pl-16 pr-6 py-3 group/major hover:bg-white transition-colors ${editingMajorId === String(major.id) ? "bg-blue-50" : ""}`}>
                              {/* Number */}
                              <span className="text-xs text-gray-400 font-mono w-6 text-right flex-shrink-0">{j + 1}.</span>
                              {/* Icon */}
                              <div className="w-7 h-7 rounded-lg bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                                <Icon icon="tabler:bookmark" height={14} className="text-[#1565C0]" />
                              </div>
                              {/* Name */}
                              <span className="flex-1 text-sm font-medium text-gray-700">{major.major_name}</span>
                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover/major:opacity-100 transition-opacity">
                                <button onClick={() => startEditMajor(String(major.id), major.major_name, deptId)} title="แก้ไขสาขา"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#1565C0] hover:bg-blue-50 transition-all">
                                  <Icon icon="tabler:edit" height={16} />
                                </button>
                                <button onClick={() => handleDeleteMajor(String(major.id), major.major_name)} title="ลบสาขา"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                  <Icon icon="tabler:trash" height={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
                </div>
        )}

        {/* Footer */}
        {filteredDepts.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <span>
              แสดง <strong className="text-gray-700">{filteredDepts.length}</strong> จาก <strong className="text-gray-700">{deptData?.length ?? 0}</strong> แผนก
              {totalMajors > 0 && <> · <strong className="text-gray-700">{totalMajors}</strong> สาขาวิชา</>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableDepartment;
