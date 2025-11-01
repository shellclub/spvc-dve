// app/profile/page.tsx
'use client'

import { showToast } from '@/app/components/sweetalert/sweetalert';
import { userRole } from '@/lib/utils';
import { Icon } from '@iconify/react/dist/iconify.js';
import { IconPassword } from '@tabler/icons-react';
import { Button, Avatar, Spinner, Modal, ModalHeader, ModalBody, Label, TextInput, FileInput } from 'flowbite-react'
import { KeyIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { FaPen } from 'react-icons/fa6'
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(res => res.json());
export default function EditProfilePage() {
    const [openProfile, setOpenProfile] = useState<boolean>(false);
    const [openChangePassword, setOpenChangePassword] = useState<boolean>(false);
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const { data: session, status, update} = useSession();

    // Password validation function
    const validatePassword = (password: string): string => {
        if (password.length === 0) return '';
        if (password.length < 8) {
            return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        }
        if (!/[A-Z]/.test(password)) {
            return 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว';
        }
        if (!/[a-z]/.test(password)) {
            return 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว';
        }
        if (!/[0-9]/.test(password)) {
            return 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว';
        }
        return '';
    };

    // Handle new password change
    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        const error = validatePassword(value);
        setPasswordErrors(prev => ({ ...prev, newPassword: error }));
        
        // Check confirm password match if it's not empty
        if (confirmPassword) {
            if (value !== confirmPassword) {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
            } else {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
        }
    };

    // Handle confirm password change
    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (value && newPassword !== value) {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
        } else {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;
  
    const { data, isLoading, error, mutate } = useSWR(swrKey, fetcher);
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formdata = new FormData(e.currentTarget);
        const res = await fetch(`/api/users/${session?.user.id}`,{
            method: "PUT",
            body: formdata
        })
        if(res.ok) {
            mutate();
            setOpenProfile(false);
        }
        const data = await res.json();
        showToast(data.message, data.type);
    }

    const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate before submit
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

        const data = await res.json();
        showToast(data.message, data.type);

        if (res.ok) {

            setOpenChangePassword(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordErrors({ newPassword: '', confirmPassword: '' });
            // อัพเดท session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    is_first_login: false,
                    skip_password_change: null,
                }
            });
        }
    }

    if (isLoading || status === "loading") {
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
            <Spinner 
              size="xl" 
              color="primary" 
              aria-label="Loading..." 
              className="text-blue-600 dark:text-blue-500"
            />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Loading data, please wait...
            </p>
          </div>
        );
      }
  return (
    <div className=" p-4 sm:p-6">
      <div className="mx-auto w-full max-w-screen-2xl"> {/* เปลี่ยนจาก max-w-4xl เป็น max-w-screen-2xl */}
          <div className="space-y-4 sm:space-y-6">
          
            {/* Profile Header - ปรับให้เต็มความกว้าง */}
            <div className="border border-lg rounded-2xl p-4 sm:p-6 shadow flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 w-full">
               
                 <Avatar 
                 img={`/uploads/${data?.user_img ?? 'avatar.jpg'}`} 
                 rounded 
                 size="xl" // ขนาดใหญ่ขึ้น
                 className="self-center"
               />
               <div className="text-center sm:text-left w-full">
                <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{`${data.firstname} ${data.lastname}`}</h2>
                 <Button 
                  outline 
                  size="sm" 
                  className="rounded-full w-full sm:w-auto border-blue-500 hover:bg-blue-500 hover:text-white"
                  onClick={() => setOpenChangePassword(true)}
                >
                  <IconPassword /> เปลี่ยนรหัสผ่าน
                </Button>
                <Modal show={openChangePassword} size="3xl" onClose={() => setOpenChangePassword(false)} popup>
                              <ModalHeader />
                              <ModalBody>
                              <div className="space-y-6">
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white">เปลี่ยนรหัสผ่าน</h3>
                                <form onSubmit={handlePasswordSubmit}>
                                  <div className="mb-3">
                                    <Label>รหัสผ่านปัจจุบัน</Label>
                                    <TextInput 
                                      type="password"
                                      name="oldPassword"
                                      placeholder="กรุณากรอกรหัสผ่านปัจจุบันของคุณ"
                                      id="oldPassword"
                                      value={oldPassword}
                                      onChange={(e) => setOldPassword(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <Label>รหัสผ่านใหม่</Label>
                                    <TextInput 
                                      type="password"
                                      name="newPassword"
                                      placeholder="กรุณากรอกรหัสผ่านใหม่ของคุณ"
                                      id="newPassword"
                                      value={newPassword}
                                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                                      color={passwordErrors.newPassword ? 'failure' : undefined}
                                      required
                                    />
                                    {passwordErrors.newPassword && (
                                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                      รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข
                                    </p>
                                  </div>
                                  <div className="mb-3">
                                    <Label>ยืนยันรหัสผ่านใหม่อีกครั้ง</Label>
                                    <TextInput 
                                      type="password"
                                      name="confirmPassword"
                                      placeholder="กรุณายืนยันรหัสผ่านใหม่อีกครั้ง"
                                      id="confirmPassword"
                                      value={confirmPassword}
                                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                      color={passwordErrors.confirmPassword ? 'failure' : undefined}
                                      required
                                    />
                                    {passwordErrors.confirmPassword && (
                                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                    )}
                                  </div>
                                
                                  <div className="w-full flex mt-6 text-end justify-end">
                                      <Button 
                                        type="submit"
                                        disabled={!!passwordErrors.newPassword || !!passwordErrors.confirmPassword}
                                      >
                                        ส่งข้อมูล
                                      </Button>
                                  </div>
                                </form>
                              </div>
                              </ModalBody>
                            </Modal>
                </div>
                 <p className="text-sm sm:text-base text-gray-500">{userRole(Number(session?.user.role))}</p>
                  <div className="flex mt-3">
                    <Icon icon={'tabler:phone'}  className="text-base me-1 relative top-0.5"/> 
                    {data.phone}
                  </div>
               </div>
              
              </div>
            </div>

            {/* Personal Info - ปรับให้เต็มความกว้าง */}
            <div className="border border-lg rounded-2xl p-4 sm:p-6 shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">ข้อมูลส่วนตัว</h3>
                <Button 
                  outline 
                  size="sm" 
                  className="rounded-full w-full sm:w-auto border-blue-500 hover:bg-blue-500 hover:text-white"
                  onClick={() => setOpenProfile(true)}
                >
                  <FaPen className="mr-2" /> แก้ไขข้อมูล
                </Button>
             
                <Modal show={openProfile} size="3xl" onClose={() => setOpenProfile(false)} popup>
                              <ModalHeader />
                              <ModalBody>
                              <div className="space-y-6">
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white">จัดการข้อมูลส่วนตัว</h3>
                                <form onSubmit={handleSubmit}>
                                  <div className="mb-3">
                                    <Label>ชื่อ</Label>
                                    <TextInput 
                                      name="firstname"
                                      placeholder="กรอกนามสกุล"
                                      id="firstname"
                                      defaultValue={data.firstname}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <Label>นามสกุล</Label>
                                    <TextInput 
                                      name="lastname"
                                      placeholder="กรอกนามสกุล"
                                      id="lastname"
                                      defaultValue={data.lastname}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <Label>เบอร์โทรศัพท์</Label>
                                    <TextInput
                                        type='tel'
                                        pattern='[0-9]{10}'
                                        name="tel"
                                        placeholder="เบอร์โทรศัพท์"
                                        id="tel"
                                        defaultValue={data.phone}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <Label>รูปประจำตัว</Label>
                                    <FileInput 
                                        name='user_img'
                                        id='user_img'
                                        accept='image/jpeg'
                                    />
                                  </div>
                                  <div className="w-full flex mt-6 text-end justify-end">
                                      <Button type="submit">ส่งข้อมูล</Button>
                                  </div>
                                </form>
                              </div>
                              </ModalBody>
                            </Modal>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
                <Field label="ชื่อ" value={data.firstname} />
                <Field label="นามสกุล" value={data.lastname} />
                <Field label="เลขบัตรประชาชน" value={data.citizenId} />
                <Field label="เบอร์โทรศัพท์" value={data.phone} />

              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 sm:p-4 rounded-lg">
      <p className="text-sm sm:text-base font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-base sm:text-lg">{value}</p>
    </div>
  )
}