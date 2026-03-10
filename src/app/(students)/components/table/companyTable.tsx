'use client';
import useSWR from 'swr';
import { Icon } from '@iconify/react/dist/iconify.js';
import Image from 'next/image';
import AddCompanyForm from './AddCompanyForm';

interface InternshipDetails {
    companyName: string;
    companyAddress: string;
    companyTel: string;
    mentorName: string;
    mentorPosition: string;
    startDate: string;
    endDate: string;
    duration: string;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch');
    }
    return res.json();
};

export default function CompanyTable() {
    const { data, isLoading, error, mutate } = useSWR<InternshipDetails>('/api/internship/me', fetcher);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">กำลังโหลดข้อมูลการฝึกงาน...</span>
            </div>
        );
    }

    if (error) {
        if (error.message === 'No internship found') {
            return (
                <div className="space-y-6 max-w-5xl mx-auto pb-12">
                    <div className="flex flex-col items-center justify-center pt-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Icon icon="tabler:briefcase" className="text-blue-500" width={32} />
                        </div>
                        <p className="text-2xl text-gray-800 font-bold mb-2">ยังไม่มีข้อมูลสถานประกอบการ</p>
                        <p className="text-gray-500 max-w-md">
                            คุณสามารถเลือกสถานประกอบการที่มีอยู่ในระบบ หรือเพิ่มสถานประกอบการใหม่ได้จากแบบฟอร์มด้านล่าง
                        </p>
                    </div>
                    <AddCompanyForm onComplete={() => mutate()} />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                    <Icon icon="tabler:alert-triangle" className="text-red-400" width={40} />
                </div>
                <p className="text-lg text-gray-600 font-bold mb-1">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                <p className="text-sm text-gray-400">{error.message}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* ──── Header ──── */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon icon="tabler:building" className="text-white" width={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">รายละเอียดการฝึกงาน</h1>
                    <p className="text-sm text-gray-500">ข้อมูลสถานประกอบการและพี่เลี้ยง</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ──── Company Info ──── */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <Icon icon="tabler:building" className="text-[#2E7D32]" width={20} />
                        ข้อมูลสถานประกอบการ
                    </h3>
                    <div className="space-y-4">
                        <InfoField label="ชื่อสถานประกอบการ" value={data.companyName} icon="tabler:building" />
                        <InfoField label="ที่อยู่" value={data.companyAddress} icon="tabler:map-pin" />
                        <InfoField label="เบอร์โทรศัพท์" value={data.companyTel} icon="tabler:phone" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* ──── Mentor Info ──── */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <Icon icon="tabler:user-check" className="text-[#2E7D32]" width={20} />
                            ข้อมูลพี่เลี้ยง
                        </h3>
                        <div className="space-y-4">
                            <InfoField label="ชื่อ-นามสกุล" value={data.mentorName} icon="tabler:user" />
                            <InfoField label="ตำแหน่ง" value={data.mentorPosition} icon="tabler:briefcase" />
                        </div>
                    </div>

                    {/* ──── Duration ──── */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <Icon icon="tabler:clock" className="text-[#2E7D32]" width={20} />
                            ระยะเวลาการฝึกงาน
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">ระยะเวลา</p>
                                    <p className="text-lg font-bold text-[#2E7D32]">{data.duration}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 mb-1">เริ่ม - สิ้นสุด</p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {new Date(data.startDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        ถึง {new Date(data.endDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: string }) {
    return (
        <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
            <p className="text-base font-medium text-gray-800 flex items-center gap-2">
                {icon && <Icon icon={icon} width={16} className="text-gray-400" />}
                {value || '-'}
            </p>
        </div>
    );
}
