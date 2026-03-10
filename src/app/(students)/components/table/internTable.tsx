"use client";
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { compressImage } from "@/lib/imageUtils";
import { ThaiDatePicker } from "@/app/components/ThaiDatePicker";
import Image from "next/image";
import dayjs from "dayjs";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Report {
  id: string;
  title: string;
  description: string;
  reportDate: string;
  image: string;
}

export default function InternReport() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Report | null>(null);
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  // Pre-fill date from query param (from calendar click)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      setFormDate(dateParam);
      setShowForm(true);
    }
  }, [searchParams]);

  const swrKey = session?.user?.id ? `/api/report/getBystudent/${session.user.id}` : null;
  const { data: reports, isLoading, mutate } = useSWR<Report[]>(swrKey, fetcher);

  // ─ Handle image selection with compression ─
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      showToast("กรุณาเลือกไฟล์ PNG หรือ JPG เท่านั้น", "error");
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file, 1);
      setImageFile(compressed);
      const url = URL.createObjectURL(compressed);
      setImagePreview(url);
      showToast(
        `ย่อรูปสำเร็จ (${(file.size / 1024 / 1024).toFixed(2)} MB → ${(compressed.size / 1024 / 1024).toFixed(2)} MB)`,
        "success"
      );
    } catch {
      showToast("ไม่สามารถย่อรูปได้", "error");
    } finally {
      setCompressing(false);
    }
  };

  // ─ Reset form ─
  const resetForm = () => {
    setShowForm(false);
    setEditData(null);
    setFormDate("");
    setFormTitle("");
    setFormDesc("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─ Open edit form ─
  const openEdit = (report: Report) => {
    setEditData(report);
    setFormDate(dayjs(report.reportDate).format("YYYY-MM-DD"));
    setFormTitle(report.title);
    setFormDesc(report.description || "");
    setImagePreview(report.image ? `/report/${report.image}` : null);
    setImageFile(null);
    setShowForm(true);
  };

  // ─ Submit ─
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) {
      showToast("กรุณากรอกข้อมูลให้ครบ", "error");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("reportDate", formDate);
    formData.append("title", formTitle);
    formData.append("description", formDesc);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(
        editData ? `/api/report/${editData.id}` : "/api/report",
        { method: editData ? "PUT" : "POST", body: formData }
      );
      const data = await res.json();
      showToast(data.message || data.error, data.type || (res.ok ? "success" : "error"));
      if (res.ok) {
        mutate();
        resetForm();
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─ Delete ─
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "แจ้งเตือน!",
      text: "คุณต้องการลบรายงานนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E7D32",
      cancelButtonColor: "#d33",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/report/${id}`, { method: "DELETE" });
    const data = await res.json();
    showToast(data.message, data.type);
    if (res.ok) mutate();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ──── Header ──── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
            <Icon icon="tabler:file-text" className="text-white" width={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">รายงานการปฏิบัติงานแต่ละวัน</h1>
            <p className="text-sm text-gray-500">บันทึกผลการปฏิบัติงานในแต่ละวัน</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); setFormDate(dayjs().format("YYYY-MM-DD")); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <Icon icon="tabler:plus" width={18} />
            เพิ่มรายงาน
          </button>
        )}
      </div>

      {/* ──── Inline Form ──── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">
              {editData ? "แก้ไขรายงาน" : "เพิ่มรายงานใหม่"}
            </h3>
            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Icon icon="tabler:x" width={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Icon icon="tabler:calendar" className="inline mr-1" width={16} />
                  วัน/เดือน/ปี <span className="text-red-400">*</span>
                </label>
                <ThaiDatePicker
                  value={formDate}
                  onChange={setFormDate}
                  placeholder="เลือกวัน/เดือน/ปี"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Icon icon="tabler:pencil" className="inline mr-1" width={16} />
                  งานที่ทำ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น ลงข้อมูลในระบบ, ตรวจเช็คสินค้า"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-[#2E7D32] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Icon icon="tabler:file-description" className="inline mr-1" width={16} />
                รายละเอียดงาน
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="อธิบายรายละเอียดของงานที่ทำ..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-[#2E7D32] outline-none transition-all text-sm resize-none"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Icon icon="tabler:camera" className="inline mr-1" width={16} />
                แนบรูปภาพ <span className="text-xs text-gray-400">(PNG / JPG, ย่ออัตโนมัติ ≤ 1MB)</span>
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-green-50 file:text-[#2E7D32] hover:file:bg-green-100 file:cursor-pointer file:transition-all"
                  />
                  {compressing && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                      กำลังย่อรูป...
                    </p>
                  )}
                </div>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <Image src={imagePreview} alt="preview" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
                    >
                      <Icon icon="tabler:x" width={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all text-sm"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</>
                ) : (
                  <><Icon icon="tabler:device-floppy" width={18} /> {editData ? "อัปเดต" : "บันทึก"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ──── Report Cards ──── */}
      {Array.isArray(reports) && reports.length > 0 ? (
        <div className="space-y-3">
          {reports
            .slice()
            .sort((a: Report, b: Report) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
            .map((report: Report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-stretch">
                  {/* Image thumbnail */}
                  {report.image && (
                    <div className="relative w-28 sm:w-36 flex-shrink-0 rounded-l-2xl overflow-hidden">
                      <Image
                        src={`/report/${report.image}`}
                        alt={report.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <Icon icon="tabler:calendar" width={12} />
                          {dayjs(report.reportDate).locale("th").format("DD/MM/YYYY")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-800 truncate">{report.title}</h3>
                      {report.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-1 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(report)}
                      className="p-2 hover:bg-green-50 rounded-xl transition-colors"
                      title="แก้ไข"
                    >
                      <Icon icon="tabler:edit" width={18} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="ลบ"
                    >
                      <Icon icon="tabler:trash" width={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center">
          <Icon icon="tabler:clipboard-off" width={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">ยังไม่มีรายงานการปฏิบัติงาน</p>
          <p className="text-xs text-gray-300 mt-1">คลิก &quot;เพิ่มรายงาน&quot; เพื่อบันทึกงานแต่ละวัน</p>
        </div>
      )}
    </div>
  );
}
