"use client";
import React, { FormEvent, useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalHeader, Select, Spinner, Card } from "flowbite-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/app/components/shadcn-ui/Default-Ui/alert";
import { AlertCircleIcon, Building2, Calendar, MapPin, Phone, Mail, User } from "lucide-react";
import { showToast } from "@/app/components/sweetalert/sweetalert";

interface StudentData {
  id: string;
  citizenId: string;
  user_img: string;
  firstname: string;
  lastname: string;
  student: {
    id: string;
    studentId: string;
    term: string;
    academicYear: string;
    education: {
      name: string;
    };
    major: {
      major_name: string;
    };
    department: {
      depname: string;
    };
    gradeLevel: string;
    room: string;
    internship?: {
      id: string;
      company: {
        id: string;
        name: string;
        address: string;
        phone: string;
        email: string;
      };
      selectedDays: string[];
      startDate: string;
      endDate: string;
      status: string;
    };
  };
}

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
}

const fetcher = async (url: string) => await fetch(url).then(res => res.json());

const InternshipManagement = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentInternId: "",
    companyId: "",
    startDate: "",
    endDate: "",
  });

  const { data: studentData, error: studentError, isLoading: studentLoading, mutate } = useSWR<StudentData>(
    studentId ? `/api/students/${studentId}` : null,
    fetcher
  );

  const { data: companyData, error: companyError, isLoading: companyLoading } = useSWR<Company[]>(
    '/api/company',
    fetcher
  );

  useEffect(() => {
    if (studentData?.student?.id) {
      setFormData(prev => ({
        ...prev,
        studentInternId: studentData.student.id
      }));
    }
  }, [studentData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.companyId) {
      showToast('กรุณาเลือกสถานประกอบการ', 'error');
      return;
    }

    try {
      const response = await fetch('/api/internship/addInternshipCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.studentInternId,
          companyId: formData.companyId,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (response.ok) {
        setOpen(false);
        showToast('เพิ่มข้อมูลการฝึกงานสำเร็จ', 'success');
        mutate();
        setFormData({
          studentInternId: studentData?.student?.id || "",
          companyId: "",
          startDate: "",
          endDate: "",
        });
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteInternship = async () => {
    if (!studentData?.student?.internship?.id) return;

    if (confirm('คุณต้องการลบข้อมูลการฝึกงานนี้ใช่หรือไม่?')) {
      try {
        const response = await fetch(`/api/internship/${studentData.student.internship.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showToast('ลบข้อมูลการฝึกงานสำเร็จ', 'success');
          mutate();
        } else {
          showToast('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
      }
    }
  };

  if (studentLoading || companyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (studentError || companyError) {
    return (
      <div className="grid w-full max-w-xl items-center h-[80vh] my-auto mx-auto">
        <Alert variant="destructive">
          <AlertCircleIcon className="text-red-600" />
          <AlertTitle className="text-red-600">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </AlertTitle>
        </Alert>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="grid w-full max-w-xl items-center h-[80vh] my-auto mx-auto">
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>ไม่พบข้อมูลนักศึกษา</AlertTitle>
        </Alert>
      </div>
    );
  }

  const hasInternship = studentData.student.internship;

  return (
    <>
      <div className="mb-4">
        <Button
          color="gray"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <Icon icon="tabler:arrow-left" height={18} />
          ย้อนกลับ
        </Button>
      </div>

      <TitleIconCard title="ข้อมูลการฝึกงาน">
        {/* Student Info Card */}
        <Card className="mb-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden relative flex-shrink-0">
              <Image
                src={studentData.user_img ? `/uploads/${studentData.user_img}` : '/default-user.png'}
                width={80}
                height={80}
                alt="student"
                className="object-cover"
                unoptimized={true}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-user.png';
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {studentData.firstname} {studentData.lastname}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:id" className="text-gray-500" />
                  <span>รหัสนักศึกษา: {studentData.student.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:school" className="text-gray-500" />
                  <span>{studentData.student.department.depname}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:book" className="text-gray-500" />
                  <span>{studentData.student.major.major_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:calendar" className="text-gray-500" />
                  <span>
                    {studentData.student.education.name}.{studentData.student.gradeLevel}/{studentData.student.room}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:calendar-event" className="text-gray-500" />
                  <span>
                    ปีการศึกษา: {studentData.student.term}/{studentData.student.academicYear}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Internship Status */}
        {!hasInternship ? (
          <Alert className="mb-6">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>ยังไม่มีข้อมูลการฝึกงาน</AlertTitle>
            <AlertDescription>
              นักศึกษายังไม่มีข้อมูลการฝึกงาน กรุณาเพิ่มข้อมูลสถานประกอบการ
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                ข้อมูลสถานประกอบการ
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="warning"
                  onClick={() => setOpen(true)}
                >
                  <Icon icon="tabler:edit" height={18} className="mr-2" />
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  color="failure"
                  onClick={handleDeleteInternship}
                >
                  <Icon icon="tabler:trash" height={18} className="mr-2" />
                  ลบ
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">ชื่อสถานประกอบการ</p>
                  <p className="font-medium">{hasInternship.company.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">ที่อยู่</p>
                  <p className="font-medium">{hasInternship.company.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                    <p className="font-medium">{hasInternship.company.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">อีเมล</p>
                    <p className="font-medium">{hasInternship.company.email}</p>
                  </div>
                </div>
              </div>

              {hasInternship.startDate && hasInternship.endDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">ระยะเวลาฝึกงาน</p>
                    <p className="font-medium">
                      {new Date(hasInternship.startDate).toLocaleDateString('th-TH')} - {new Date(hasInternship.endDate).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              )}

              {hasInternship.status && (
                <div className="flex items-start gap-3">
                  <Icon icon="tabler:info-circle" className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">สถานะ</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${hasInternship.status === 'active' ? 'bg-green-100 text-green-800' :
                        hasInternship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {hasInternship.status === 'active' ? 'กำลังฝึกงาน' :
                        hasInternship.status === 'completed' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Add/Edit Button */}
        {!hasInternship && (
          <div className="flex justify-center">
            <Button
              size="lg"
              color="primary"
              onClick={() => setOpen(true)}
            >
              <Icon icon="tabler:plus" height={20} className="mr-2" />
              เพิ่มข้อมูลการฝึกงาน
            </Button>
          </div>
        )}

        {/* Modal for Add/Edit Internship */}
        <Modal show={open} size="2xl" onClose={() => setOpen(false)} popup>
          <ModalHeader />
          <ModalBody>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {hasInternship ? 'แก้ไขข้อมูลการฝึกงาน' : 'เพิ่มข้อมูลการฝึกงาน'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      สถานประกอบการ <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.companyId}
                      onChange={(e) => handleInputChange("companyId", e.target.value)}
                      required
                    >
                      <option value="" hidden>เลือกสถานประกอบการ</option>
                      {companyData?.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        วันที่เริ่มฝึกงาน
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        วันที่สิ้นสุดฝึกงาน
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <Button
                    color="gray"
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" color="primary">
                    บันทึกข้อมูล
                  </Button>
                </div>
              </form>
            </div>
          </ModalBody>
        </Modal>
      </TitleIconCard>
    </>
  );
};

export default InternshipManagement;