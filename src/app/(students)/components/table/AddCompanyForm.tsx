"use client";
import React, { FormEvent, useState } from "react";
import { Button, Select, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import useSWR from "swr";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label";
import { ThaiDatePicker } from "@/app/components/ThaiDatePicker";
import { showToast } from "@/app/components/sweetalert/sweetalert";

const fetcher = async (url: string) => await fetch(url).then(res => res.json());

interface Company {
    id: string;
    name: string;
    address: string;
}

export default function AddCompanyForm({ onComplete }: { onComplete: () => void }) {
    const [mode, setMode] = useState<'select' | 'new'>('select');
    const [loading, setLoading] = useState(false);

    const { data: companyData, isLoading: companyLoading } = useSWR<Company[]>('/api/company', fetcher);

    const [formData, setFormData] = useState({
        selectedCompanyId: "",
        name: "",
        address: "",
        firstname: "",
        lastname: "",
        phone: "",
        startDate: "",
        endDate: ""
    });

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!formData.startDate || !formData.endDate) {
            showToast('กรุณาระบุวันที่เริ่มและสิ้นสุดการฝึกงาน', 'warning');
            return;
        }

        if (mode === 'select' && !formData.selectedCompanyId) {
            showToast('กรุณาเลือกสถานประกอบการ', 'warning');
            return;
        }

        if (mode === 'new' && (!formData.name || !formData.firstname || !formData.lastname)) {
            showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
            return;
        }

        setLoading(true);

        try {
            const payload = mode === 'select' 
                ? { 
                    selectedCompanyId: formData.selectedCompanyId,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                } 
                : { 
                    name: formData.name,
                    address: formData.address,
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    phone: formData.phone,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                };

            const response = await fetch('/api/internship/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "เกิดข้อผิดพลาด");
            }

            showToast(result.message || "บันทึกข้อมูลสำเร็จ", "success");
            onComplete();
        } catch (error) {
            showToast(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-2xl mx-auto mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Icon icon="tabler:briefcase" className="text-[#2E7D32]" width={24} />
                เพิ่มข้อมูลสถานประกอบการ
            </h3>
            
            <div className="flex gap-4 mb-6 relative">
                <button
                    type="button"
                    onClick={() => setMode('select')}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors border ${mode === 'select' ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                    เลือกที่มีในระบบ
                </button>
                <button
                    type="button"
                    onClick={() => setMode('new')}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors border ${mode === 'new' ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                    เพิ่มสถานประกอบการใหม่
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'select' ? (
                    <div className="space-y-2">
                        <Label>เลือกสถานประกอบการ *</Label>
                        {companyLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Spinner size="sm" /> กำลังโหลดรายชื่อ...
                            </div>
                        ) : (
                            <Select
                                value={formData.selectedCompanyId}
                                onChange={(e) => handleInputChange("selectedCompanyId", e.target.value)}
                                required={mode === 'select'}
                            >
                                <option value="" hidden>เลือกสถานประกอบการ</option>
                                {companyData?.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name} {company.address ? `(${company.address.substring(0, 30)}...)` : ''}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>ชื่อสถานประกอบการ *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="ชื่อสถานประกอบการ"
                                required={mode === 'new'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ที่อยู่</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="ที่อยู่สถานประกอบการ"
                            />
                        </div>
                        <div className="border-t pt-4 space-y-4 mt-2">
                            <h4 className="font-semibold text-gray-700">ข้อมูลผู้ติดต่อ (พี่เลี้ยง)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>ชื่อ *</Label>
                                    <Input
                                        value={formData.firstname}
                                        onChange={(e) => handleInputChange("firstname", e.target.value)}
                                        placeholder="ชื่อจริง"
                                        required={mode === 'new'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>นามสกุล *</Label>
                                    <Input
                                        value={formData.lastname}
                                        onChange={(e) => handleInputChange("lastname", e.target.value)}
                                        placeholder="นามสกุล"
                                        required={mode === 'new'}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>เบอร์โทรศัพท์ (เป็นชื่อผู้ใช้เข้าระบบ)</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="เบอร์โทรศัพท์"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t pt-6"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>วันที่เริ่มฝึกงาน *</Label>
                        <ThaiDatePicker
                            value={formData.startDate}
                            onChange={(v) => handleInputChange("startDate", v)}
                            placeholder="เลือกวัน/เดือน/ปี"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>วันที่สิ้นสุดฝึกงาน *</Label>
                        <ThaiDatePicker
                            value={formData.endDate}
                            onChange={(v) => handleInputChange("endDate", v)}
                            placeholder="เลือกวัน/เดือน/ปี"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" color="success" disabled={loading} className="w-full sm:w-auto px-8">
                        {loading ? <><Spinner size="sm" className="mr-2" /> กำลังบันทึก...</> : 'บันทึกข้อมูล'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
