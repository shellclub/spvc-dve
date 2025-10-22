'use client'

import { showToast } from '@/app/components/sweetalert/sweetalert';
import { userRole } from '@/lib/utils';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button, Avatar, Spinner, Modal, ModalHeader, ModalBody, Label, TextInput, FileInput } from 'flowbite-react'
import { useSession } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { FaPen } from 'react-icons/fa6'
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(res => res.json());
export default function EditProfilePage() {
    const [openProfile, setOpenProfile] = useState<boolean>(false);
    const { data: session, status} = useSession();
    const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;
  
    const { data: userData, isLoading, error, mutate } = useSWR(swrKey, fetcher,{
      revalidateOnFocus: false,
      fallbackData: null,
    });
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

      if (!userData) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] 2xl:min-h-[600px] gap-4 p-8">
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              No data available
            </p>
          </div>
        );
    }
    const data = {
      firstname: userData.firstname ?? '',
      lastname: userData.lastname ?? '',
      phone: userData.phone ?? '',
      citizenId: userData.citizenId ?? '',
      user_img: userData.user_img ?? 'avatar.jpg',
    }
  return (
    <div className=" p-4  sm:p-6">
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
                 <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{`${data.firstname} ${data.lastname}`}</h2>
                 <p className="text-sm sm:text-base text-gray-500">{userRole(Number(session?.user.role))}</p>
                  <div className="flex mt-3">
                    <Icon icon={'tabler:phone'}  className="text-base me-1 relative top-0.5"/> 
                    {data.phone}
                  </div>
               </div>
              
              </div>
            </div>

            {/* Personal Info - ปรับให้เต็มความกว้าง */}
            <div className=" border border-lg  rounded-2xl p-4 sm:p-6 shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">ข้อมูลส่วนตัว</h3>
                <Button 
                  outline 
                  size="sm" 
                  className="rounded-full w-full sm:w-auto"
                  onClick={() => setOpenProfile(true)}
                >
                  <FaPen className="mr-2" /> แก้ไขข้อมูล
                </Button>
                <Modal show={openProfile} size="3xl" onClose={() => setOpenProfile(false)} popup>
                              <ModalHeader />
                              <ModalBody>
                              <div className="space-y-6">
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white">จัดการข้อมูลแผนกวิชา</h3>
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
                                        accept='image/jpeg, image/png'
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

