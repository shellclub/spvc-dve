'use client';
import { Button, Label, TextInput, Select, Spinner } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Icon } from '@iconify/react/dist/iconify.js';
import { showToast } from '@/app/components/sweetalert/sweetalert';
import { m } from 'framer-motion';


interface Company {
    id?: number;
    name: string;
    address: string;
    tel: string;
    trainer: string;
    position: string;
    week: string;

}
const fetcher = async (url: string) => fetch(url).then(res => res.json());
export default function CompanyTable() {

    const [formData, setFormData] = useState<Company>({
        name: '',
        address: '',
        trainer: '',
        tel: '',
        position: '',
        week: ''
    });
    const { data, isLoading, error, mutate} = useSWR<Company>(`/api/company/`, fetcher);

if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <Icon icon="tabler:alert-circle" className="inline-block mr-2" />
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <Button color="gray" onClick={() => mutate()} className="mt-4">
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/company';
            const method = 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const res = await response.json();
                showToast(res.message, 'success');
                mutate(); // Refresh data after successful submission
            }else {
                const res = await response.json();
                showToast(res.error, 'error');
            }
        } catch (error) {
            console.error('Error saving company:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-lg font-bold mb-4">
                {'เพิ่มสถานประกอบการ'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <Label htmlFor="name" value="ชื่อสถานประกอบการ" />
                    <TextInput
                        id="name"
                        name="name"
                        value={formData.name || data?.name}
                        onChange={handleChange}
                        placeholder='กรอกชื่อสถานประกอบการที่นักศึกษาฝึกงาน'
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="address" value="ที่อยู่สถานประกอบการ" />
                    <TextInput
                        id="address"
                        name="address"
                        value={formData.address || data?.address}
                        onChange={handleChange}
                        placeholder='กรอกที่อยู่สถานประกอบการที่นักศึกษาฝึกงาน'
                        required
                    />
                </div>

            

                <div>
                    <Label htmlFor="tel" value="เบอร์โทรสถานประกอบการ" />
                    <TextInput
                        id="tel"
                        name="tel"
                        value={formData.tel || data?.tel}
                        onChange={handleChange}
                        placeholder='กรอกเบอร์โทรศัพท์สถานประกอบการที่นักศึกษาฝึกงาน'
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="trainer" value="ชื่อครูฝึก (หัวหน้าฝึกงาน)" />
                    <TextInput
                        id="trainer"
                        name="trainer"
                        type="text"
                        value={formData.trainer || data?.trainer}
                        onChange={handleChange}
                        placeholder='กรอก ชื่อ-นามสกุล ครูฝึกที่รับผิดชอบดูแลนักศึกษาในสถานประกอบการ'
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="position" value="ตำแหน่งครูฝึก (หัวหน้าฝึกงาน)" />
                    <TextInput
                        id="position"
                        name="position"
                        type="text"
                        value={formData.position || data?.position}
                        onChange={handleChange}
                        placeholder='กรอกตำแหน่งของครูฝึก เช่น ผู้จัดการ'
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="week" value="จำนวนวันที่ฝึก / สัปดาห์" />
                    <TextInput
                        id="week"
                        name="week"
                        type="text"
                        placeholder='กรอกจำนวนสัปดาห์ที่นักศึกษาเข้าฝึกงาน'
                        value={formData.week || data?.week}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <Button type="submit">
                        {'บันทึกข้อมูล'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
