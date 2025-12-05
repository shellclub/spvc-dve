'use client';
import { Card, Spinner, Badge } from 'flowbite-react';
import useSWR from 'swr';
import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';

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
    const { data, isLoading, error } = useSWR<InternshipDetails>('/api/internship/me', fetcher);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="xl" />
                <span className="ml-3">กำลังโหลดข้อมูลการฝึกงาน...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <Icon icon="bxs:error-alt" className="text-red-500 text-6xl mb-4" />
                <p className="text-xl text-gray-600 font-semibold mb-2">ไม่พบข้อมูลการฝึกงาน</p>
                <p className="text-gray-500">{error.message === 'No internship found' ? 'คุณยังไม่มีข้อมูลการฝึกงานในระบบ' : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Icon icon="mdi:office-building-marker" className="text-blue-600" />
                    รายละเอียดการฝึกงาน
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ข้อมูลสถานประกอบการ */}
                    <Card className="shadow-lg border-t-4 border-t-blue-500">
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <Icon icon="mdi:domain" />
                                ข้อมูลสถานประกอบการ
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">ชื่อสถานประกอบการ</p>
                                    <p className="font-medium text-lg text-gray-900">{data.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ที่อยู่</p>
                                    <p className="text-gray-700">{data.companyAddress}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:phone" className="text-gray-400" />
                                        <span className="text-gray-700">{data.companyTel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ข้อมูลพี่เลี้ยง & ระยะเวลา */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-t-4 border-t-green-500">
                            <div className="flex flex-col space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    <Icon icon="mdi:account-tie" />
                                    ข้อมูลพี่เลี้ยง (Mentor)
                                </h3>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                                            <p className="font-medium text-gray-900">{data.mentorName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">ตำแหน่ง</p>
                                            <p className="text-gray-700">{data.mentorPosition}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="shadow-lg border-t-4 border-t-purple-500">
                            <div className="flex flex-col space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    <Icon icon="mdi:calendar-clock" />
                                    ระยะเวลาการฝึกงาน
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">ระยะเวลา</p>
                                            <Badge color="purple" size="lg" className="text-base px-3 py-1">
                                                {data.duration}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">เริ่ม - สิ้นสุด</p>
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
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
