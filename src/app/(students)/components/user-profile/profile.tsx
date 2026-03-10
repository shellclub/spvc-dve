'use client'

import { showToast } from '@/app/components/sweetalert/sweetalert';
import { userRole } from '@/lib/utils';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useRef } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { compressImage } from '@/lib/imageUtils';
import { Modal, ModalHeader, ModalBody, Label, TextInput, Button } from 'flowbite-react';
import { IconPassword } from '@tabler/icons-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EditProfilePage() {
  const [editing, setEditing] = useState<'profile' | 'student' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status, update } = useSession();
  const [openChangePassword, setOpenChangePassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const validatePassword = (password: string): string => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    if (!/[A-Z]/.test(password)) return 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว';
    if (!/[a-z]/.test(password)) return 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว';
    if (!/[0-9]/.test(password)) return 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว';
    return '';
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    const error = validatePassword(value);
    setPasswordErrors(prev => ({ ...prev, newPassword: error }));
    if (confirmPassword) {
      if (value !== confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && newPassword !== value) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
    } else {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setPasswordErrors(prev => ({ ...prev, newPassword: newPasswordError }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
      return;
    }
    if (!oldPassword || !newPassword) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    const formdata = new FormData();
    formdata.append('oldPassword', oldPassword);
    formdata.append('newPassword', newPassword);

    const res = await fetch(`/api/users/${session?.user.id}/change-password`, {
      method: "PUT",
      body: formdata
    });
    const dataRes = await res.json();
    showToast(dataRes.message, dataRes.type);

    if (res.ok) {
      setOpenChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({ newPassword: '', confirmPassword: '' });
      await update({
        ...session,
        user: { ...session?.user, is_first_login: false, skip_password_change: null }
      });
    }
  };
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;
  const { data, isLoading, mutate } = useSWR(swrKey, fetcher);
  const { data: depdata, isLoading: depLoading } = useSWR('/api/departments', fetcher);

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1);
      const url = URL.createObjectURL(compressed);
      setImagePreview(url);
    } catch {
      showToast('ไม่สามารถประมวลผลรูปภาพ', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const url = editing === 'profile'
      ? `/api/users/${session?.user.id}`
      : editing === 'student'
        ? '/api/students/profile'
        : '';

    try {
      const res = await fetch(url, { method: 'PUT', body: formData });
      const data = await res.json();
      showToast(data.message, data.type);
      if (res.ok) {
        mutate();
        setEditing(null);
        setImagePreview(null);
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || depLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  const dayOrder = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  const selectedDays = data?.student?.inturnship?.selectedDays || [];
  const sortedDays = Array.isArray(selectedDays)
    ? [...selectedDays].sort((a: string, b: string) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ──── Header ──── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
          <Icon icon="tabler:user" className="text-white" width={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว</h1>
          <p className="text-sm text-gray-500">จัดการโปรไฟล์และข้อมูลนักศึกษา</p>
        </div>
      </div>

      {/* ──── Profile Card ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                <Image
                  src={`/uploads/${data?.user_img ?? "avatar.jpg"}`}
                  alt="avatar"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left pb-1">
              <h2 className="text-xl font-bold text-gray-800">{`${data?.firstname} ${data?.lastname}`}</h2>
              <p className="text-sm text-gray-500">{userRole(Number(session?.user?.role))}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 items-center justify-center sm:justify-end w-full sm:w-auto">
              <Button
                outline
                size="sm"
                className="rounded-xl border-blue-500 hover:bg-blue-500 hover:text-white"
                onClick={() => setOpenChangePassword(true)}
              >
                <IconPassword className="mr-1 mt-0.5" size={16} /> เปลี่ยนรหัสผ่าน
              </Button>
              <button
                onClick={() => setEditing('profile')}
                className="flex items-center justify-center gap-2 px-4 py-2 text-[#2E7D32] bg-green-50 hover:bg-green-100 rounded-xl font-medium text-sm transition-all"
              >
                <Icon icon="tabler:edit" width={16} /> แก้ไขข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal เปลี่ยนรหัสผ่าน */}
      <Modal show={openChangePassword} size="md" onClose={() => setOpenChangePassword(false)} popup>
        <ModalHeader />
        <ModalBody>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">เปลี่ยนรหัสผ่าน</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <Label>รหัสผ่านปัจจุบัน</Label>
                <TextInput
                  type="password"
                  name="oldPassword"
                  placeholder="กรุณากรอกรหัสผ่านปัจจุบันของคุณ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div className="mb-4">
                <Label>รหัสผ่านใหม่</Label>
                <TextInput
                  type="password"
                  name="newPassword"
                  placeholder="กรุณากรอกรหัสผ่านใหม่ของคุณ"
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  color={passwordErrors.newPassword ? 'failure' : undefined}
                  className="mt-1"
                  required
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข
                </p>
              </div>
              <div className="mb-4">
                <Label>ยืนยันรหัสผ่านใหม่อีกครั้ง</Label>
                <TextInput
                  type="password"
                  name="confirmPassword"
                  placeholder="กรุณายืนยันรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  color={passwordErrors.confirmPassword ? 'failure' : undefined}
                  className="mt-1"
                  required
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              <div className="w-full flex justify-end gap-2 mt-6">
                <Button color="gray" onClick={() => setOpenChangePassword(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" color="success">
                  บันทึก
                </Button>
              </div>
            </form>
          </div>
        </ModalBody>
      </Modal>

      {/* ──── Edit Profile Form ──── */}
      {editing === 'profile' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Icon icon="tabler:edit" className="text-[#2E7D32]" width={20} />
            แก้ไขข้อมูลส่วนตัว
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="ชื่อ" name="firstname" defaultValue={data?.firstname} required />
              <InputField label="นามสกุล" name="lastname" defaultValue={data?.lastname} required />
              <InputField label="เบอร์โทรศัพท์" name="phone" defaultValue={data?.phone} type="tel" pattern="[0-9]{10}" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">รูปประจำตัว</label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="user_img"
                  accept="image/jpeg,image/png"
                  onChange={handleImageSelect}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-green-50 file:text-[#2E7D32] hover:file:bg-green-100 file:cursor-pointer"
                />
                {imagePreview && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200">
                    <Image src={imagePreview} alt="preview" width={64} height={64} className="object-cover w-full h-full" unoptimized />
                  </div>
                )}
              </div>
            </div>
            <FormActions onCancel={() => { setEditing(null); setImagePreview(null); }} isSubmitting={isSubmitting} />
          </form>
        </div>
      )}

      {/* ──── Personal Info ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Icon icon="tabler:id" className="text-[#2E7D32]" width={20} />
            ข้อมูลส่วนตัว
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="ชื่อ" value={data?.firstname} />
          <InfoField label="นามสกุล" value={data?.lastname} />
          <InfoField label="เบอร์โทรศัพท์" value={data?.phone} icon="tabler:phone" />
        </div>
      </div>

      {/* ──── Student Info ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Icon icon="tabler:school" className="text-[#2E7D32]" width={20} />
            ข้อมูลนักศึกษา
          </h3>
          <button
            onClick={() => setEditing('student')}
            className="flex items-center gap-2 px-4 py-2 text-[#2E7D32] bg-green-50 hover:bg-green-100 rounded-xl font-medium text-sm transition-all"
          >
            <Icon icon="tabler:edit" width={16} /> แก้ไข
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="รหัสนักศึกษา" value={data?.student?.studentId || '-'} />
          <InfoField label="แผนกวิชา" value={data?.student?.department?.depname || '-'} />
          <InfoField label="สาขาวิชา" value={data?.student?.major?.major_name || '-'} />
          <InfoField label="กลุ่ม" value={data?.student?.room || '-'} />
          <InfoField label="ระดับชั้น" value={`${data?.student?.education?.name || ''}/${data?.student?.gradeLevel || ''}`} />
          <InfoField label="วันที่ฝึกงาน" value={sortedDays.length > 0 ? sortedDays.join(', ') : '-'} icon="tabler:calendar" />
        </div>
      </div>

      {/* ──── Edit Student Form ──── */}
      {editing === 'student' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Icon icon="tabler:school" className="text-[#2E7D32]" width={20} />
            แก้ไขข้อมูลนักศึกษา
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">รหัสนักศึกษา</label>
                <input
                  name="studentId"
                  defaultValue={data?.student?.studentId || ''}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">แผนกวิชา</label>
                <select
                  name="departmentId"
                  defaultValue={data?.student?.departmentId || ''}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-[#2E7D32] outline-none text-sm"
                >
                  {depdata?.map((dep: any) => (
                    <option key={dep.id} value={dep.id}>{dep.depname}</option>
                  ))}
                </select>
              </div>
              <InputField label="สาขาวิชา" name="major" defaultValue={data?.student?.major?.major_name || ''} />
              <InputField label="กลุ่ม" name="room" defaultValue={data?.student?.room || ''} />
            </div>
            <FormActions onCancel={() => setEditing(null)} isSubmitting={isSubmitting} />
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

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

function InputField({ label, name, defaultValue, type = 'text', required = false, pattern }: {
  label: string; name: string; defaultValue?: string; type?: string; required?: boolean; pattern?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        pattern={pattern}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-[#2E7D32] outline-none transition-all text-sm"
      />
    </div>
  );
}

function FormActions({ onCancel, isSubmitting }: { onCancel: () => void; isSubmitting: boolean }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all">
        ยกเลิก
      </button>
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all text-sm">
        {isSubmitting ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</>
        ) : (
          <><Icon icon="tabler:device-floppy" width={18} /> บันทึก</>
        )}
      </button>
    </div>
  );
}
