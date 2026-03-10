"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import useSWR from "swr";
import { showToast } from "@/app/components/sweetalert/sweetalert";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ClassroomAssignProps {
  teacherId: number;
  teacherName: string;
  onClose: () => void;
}

interface StudentItem {
  id: number;
  studentId: string;
  userId: number;
  room: string;
  gradeLevel: string;
  department: { id: number; depname: string } | null;
  major: { id: number; major_name: string } | null;
  education: { id: number; name: string } | null;
  user: { id: number; prefix: string; firstname: string; lastname: string } | null;
}

interface ClassroomGroup {
  key: string;
  label: string;
  department: string;
  major: string;
  education: string;
  gradeLevel: string;
  room: string;
  students: StudentItem[];
}

// Group students by classroom
function groupStudentsByClassroom(students: StudentItem[]): ClassroomGroup[] {
  const map = new Map<string, ClassroomGroup>();

  for (const s of students) {
    const key = `${s.department?.id ?? 0}-${s.major?.id ?? 0}-${s.education?.id ?? 0}-${s.gradeLevel ?? ""}-${s.room ?? ""}`;
    if (!map.has(key)) {
      const dep = s.department?.depname ?? "ไม่ระบุแผนก";
      const maj = s.major?.major_name ?? "";
      const edu = s.education?.name ?? "";
      const grade = s.gradeLevel ?? "";
      const room = s.room ?? "";
      const label = `${dep}${maj ? ` • ${maj}` : ""}${edu ? ` • ${edu}` : ""}${grade ? ` ปี ${grade}` : ""}${room ? ` ห้อง ${room}` : ""}`;
      map.set(key, {
        key,
        label,
        department: dep,
        major: maj,
        education: edu,
        gradeLevel: grade,
        room,
        students: [],
      });
    }
    map.get(key)!.students.push(s);
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, "th"));
}

export default function ClassroomAssignModal({ teacherId, teacherName, onClose }: ClassroomAssignProps) {
  // Fetch all students
  const { data: allStudents, isLoading: isLoadingStudents } = useSWR<StudentItem[]>("/api/classrooms", fetcher);
  // Fetch currently assigned
  const { data: assigned, isLoading: isLoadingAssigned } = useSWR(
    `/api/teachers/${teacherId}/classrooms`,
    fetcher
  );

  const [selectedLeftGroups, setSelectedLeftGroups] = useState<Set<string>>(new Set());
  const [selectedRightGroups, setSelectedRightGroups] = useState<Set<string>>(new Set());
  const [assignedStudentIds, setAssignedStudentIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  // Init assigned student IDs 
  useEffect(() => {
    if (assigned && Array.isArray(assigned)) {
      const ids = new Set(assigned.map((a: any) => a.studentId as number));
      setAssignedStudentIds(ids);
    }
  }, [assigned]);

  // Available classrooms (not assigned)
  const availableGroups = useMemo(() => {
    if (!allStudents) return [];
    const available = allStudents.filter((s) => !assignedStudentIds.has(s.id));
    return groupStudentsByClassroom(available);
  }, [allStudents, assignedStudentIds]);

  // Assigned classrooms
  const assignedGroups = useMemo(() => {
    if (!allStudents) return [];
    const assignedList = allStudents.filter((s) => assignedStudentIds.has(s.id));
    return groupStudentsByClassroom(assignedList);
  }, [allStudents, assignedStudentIds]);

  // Filtered by search
  const filteredAvailable = useMemo(() => {
    if (!searchLeft.trim()) return availableGroups;
    const q = searchLeft.toLowerCase();
    return availableGroups.filter((g) => g.label.toLowerCase().includes(q));
  }, [availableGroups, searchLeft]);

  const filteredAssigned = useMemo(() => {
    if (!searchRight.trim()) return assignedGroups;
    const q = searchRight.toLowerCase();
    return assignedGroups.filter((g) => g.label.toLowerCase().includes(q));
  }, [assignedGroups, searchRight]);

  // Move selected available to assigned
  const moveRight = useCallback(() => {
    const newIds = new Set(assignedStudentIds);
    for (const groupKey of selectedLeftGroups) {
      const group = availableGroups.find((g) => g.key === groupKey);
      if (group) {
        group.students.forEach((s) => newIds.add(s.id));
      }
    }
    setAssignedStudentIds(newIds);
    setSelectedLeftGroups(new Set());
  }, [selectedLeftGroups, availableGroups, assignedStudentIds]);

  // Move all available to assigned
  const moveAllRight = useCallback(() => {
    const newIds = new Set(assignedStudentIds);
    availableGroups.forEach((g) => g.students.forEach((s) => newIds.add(s.id)));
    setAssignedStudentIds(newIds);
    setSelectedLeftGroups(new Set());
  }, [availableGroups, assignedStudentIds]);

  // Move selected assigned back to available
  const moveLeft = useCallback(() => {
    const newIds = new Set(assignedStudentIds);
    for (const groupKey of selectedRightGroups) {
      const group = assignedGroups.find((g) => g.key === groupKey);
      if (group) {
        group.students.forEach((s) => newIds.delete(s.id));
      }
    }
    setAssignedStudentIds(newIds);
    setSelectedRightGroups(new Set());
  }, [selectedRightGroups, assignedGroups, assignedStudentIds]);

  // Move all assigned back to available
  const moveAllLeft = useCallback(() => {
    setAssignedStudentIds(new Set());
    setSelectedRightGroups(new Set());
  }, []);

  // Toggle group selection
  const toggleLeftGroup = (key: string) => {
    setSelectedLeftGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const toggleRightGroup = (key: string) => {
    setSelectedRightGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  // Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/teachers/${teacherId}/classrooms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(assignedStudentIds) }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        onClose();
      } else {
        showToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch (error) {
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingStudents || isLoadingAssigned;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#388E3C] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon icon="tabler:school" height={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">จัดการห้องเรียนที่รับผิดชอบ</h2>
              <p className="text-green-100 text-sm mt-0.5">{teacherName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <Icon icon="tabler:x" height={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
            <span className="ml-3 text-gray-500 text-lg">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden p-6">
            <div className="flex flex-col lg:flex-row gap-4 h-full">
              {/* LEFT: Available Classrooms */}
              <div className="flex-1 flex flex-col min-h-0 border-2 border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Icon icon="tabler:list" height={18} className="text-gray-500" />
                      ห้องเรียนที่มีอยู่
                    </h3>
                    <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                      {availableGroups.length} ห้อง
                    </span>
                  </div>
                  <div className="relative">
                    <Icon icon="tabler:search" height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchLeft}
                      onChange={(e) => setSearchLeft(e.target.value)}
                      placeholder="ค้นหาห้องเรียน..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-green-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px] max-h-[400px]">
                  {filteredAvailable.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Icon icon="tabler:folder-off" height={40} className="mb-2 opacity-50" />
                      <p className="text-sm">ไม่มีห้องเรียนเพิ่มเติม</p>
                    </div>
                  ) : (
                    filteredAvailable.map((group) => (
                      <button
                        key={group.key}
                        onClick={() => toggleLeftGroup(group.key)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                          selectedLeftGroups.has(group.key)
                            ? "border-[#2E7D32] bg-green-50 shadow-sm"
                            : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedLeftGroups.has(group.key) ? "bg-[#2E7D32] border-[#2E7D32]" : "border-gray-300"
                          }`}>
                            {selectedLeftGroups.has(group.key) && (
                              <Icon icon="tabler:check" height={14} className="text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">{group.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{group.students.length} คน</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* CENTER: Transfer Buttons */}
              <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0 lg:px-2 flex-shrink-0">
                <button
                  onClick={moveAllRight}
                  disabled={availableGroups.length === 0}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-[#2E7D32] hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
                  title="เพิ่มทั้งหมด"
                >
                  <Icon icon="tabler:chevrons-right" height={20} className="lg:block hidden" />
                  <Icon icon="tabler:chevrons-down" height={20} className="lg:hidden" />
                </button>
                <button
                  onClick={moveRight}
                  disabled={selectedLeftGroups.size === 0}
                  className="w-12 h-12 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white flex items-center justify-center shadow-lg shadow-green-200 transition-all duration-200 disabled:opacity-30 disabled:shadow-none disabled:bg-gray-300"
                  title="เพิ่มที่เลือก"
                >
                  <Icon icon="tabler:chevron-right" height={22} className="lg:block hidden" />
                  <Icon icon="tabler:chevron-down" height={22} className="lg:hidden" />
                </button>
                <button
                  onClick={moveLeft}
                  disabled={selectedRightGroups.size === 0}
                  className="w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200 transition-all duration-200 disabled:opacity-30 disabled:shadow-none disabled:bg-gray-300"
                  title="นำออกที่เลือก"
                >
                  <Icon icon="tabler:chevron-left" height={22} className="lg:block hidden" />
                  <Icon icon="tabler:chevron-up" height={22} className="lg:hidden" />
                </button>
                <button
                  onClick={moveAllLeft}
                  disabled={assignedGroups.length === 0}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
                  title="นำออกทั้งหมด"
                >
                  <Icon icon="tabler:chevrons-left" height={20} className="lg:block hidden" />
                  <Icon icon="tabler:chevrons-up" height={20} className="lg:hidden" />
                </button>
              </div>

              {/* RIGHT: Assigned Classrooms */}
              <div className="flex-1 flex flex-col min-h-0 border-2 border-[#2E7D32] rounded-2xl overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-green-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#1B5E20] flex items-center gap-2">
                      <Icon icon="tabler:check-list" height={18} className="text-[#2E7D32]" />
                      ห้องเรียนที่รับผิดชอบ
                    </h3>
                    <span className="text-xs font-medium bg-[#2E7D32] text-white px-2.5 py-1 rounded-full">
                      {assignedGroups.length} ห้อง • {assignedStudentIds.size} คน
                    </span>
                  </div>
                  <div className="relative">
                    <Icon icon="tabler:search" height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                    <input
                      type="text"
                      value={searchRight}
                      onChange={(e) => setSearchRight(e.target.value)}
                      placeholder="ค้นหาห้องเรียน..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-green-200 rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-green-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px] max-h-[400px]">
                  {filteredAssigned.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-green-300">
                      <Icon icon="tabler:circles" height={40} className="mb-2 opacity-50" />
                      <p className="text-sm text-gray-400">ยังไม่ได้เลือกห้องเรียน</p>
                      <p className="text-xs text-gray-400 mt-1">เลือกจากรายการทางซ้ายแล้วกดลูกศร →</p>
                    </div>
                  ) : (
                    filteredAssigned.map((group) => (
                      <button
                        key={group.key}
                        onClick={() => toggleRightGroup(group.key)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                          selectedRightGroups.has(group.key)
                            ? "border-red-400 bg-red-50 shadow-sm"
                            : "border-transparent hover:bg-green-50 hover:border-green-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedRightGroups.has(group.key) ? "bg-red-500 border-red-500" : "border-green-300 bg-green-100"
                          }`}>
                            {selectedRightGroups.has(group.key) ? (
                              <Icon icon="tabler:x" height={14} className="text-white" />
                            ) : (
                              <Icon icon="tabler:check" height={14} className="text-[#2E7D32]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">{group.label}</p>
                            <p className="text-xs text-[#2E7D32] mt-0.5">{group.students.length} คน</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-500">
            <Icon icon="tabler:info-circle" height={16} className="inline mr-1" />
            เลือกห้องเรียนทางซ้ายแล้วกดลูกศรเพื่อเพิ่ม
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] hover:from-[#1B5E20] hover:to-[#388E3C] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Icon icon="tabler:device-floppy" height={18} />
                  บันทึก
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
