import { Icon } from "@iconify/react";
import { Button, Dropdown } from "flowbite-react";
import React from "react";
import * as profileData from "./Data";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";

import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { userRole } from "@/lib/utils";

const fetcher = async (url: string) => await fetch(url).then(res => res.json());

// Avatar component: แสดงรูปโปรไฟล์ หรือถ้าไม่มี ใช้วงกลมตัวอักษรแรก (แบบ Google)
function UserAvatar({ userImg, firstname, size = 35 }: { userImg?: string | null; firstname: string; size?: number }) {
  if (userImg) {
    return (
      <Image
        src={`/uploads/${userImg}`}
        alt="profile"
        height={size}
        width={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        unoptimized={true}
      />
    );
  }

  // สร้าง avatar ตัวอักษรแรก (แบบ Google)
  const initial = firstname ? firstname.charAt(0).toUpperCase() : "?";
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-red-500"
  ];
  // เลือกสีจากตัวอักษรแรก
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  const fontSize = size < 50 ? "text-sm" : size < 80 ? "text-xl" : "text-2xl";

  return (
    <div
      className={`${bgColor} ${fontSize} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
}

const Profile = () => {
  const { data: session, status } = useSession();
  const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;
  const { data, isLoading, error } = useSWR(swrKey, fetcher);

  const isSessionLoading = status === "loading";
  if (isLoading || isSessionLoading) {
    return <p>Loading....</p>
  }

  return (
    <div className="relative group/menu ps-15">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] py-6 rounded-sm"
        renderTrigger={() => (
          <span className="hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <UserAvatar userImg={data?.user_img} firstname={data?.firstname ?? ""} size={35} />
          </span>
        )}
      >
        <div className="px-6">
          <h3 className="text-lg font-semibold text-ld">ข้อมูลส่วนตัว</h3>
          <div className="flex items-center gap-6 pb-5 border-b dark:border-darkborder mt-5 mb-3">
            <UserAvatar userImg={data?.user_img} firstname={data?.firstname ?? ""} size={80} />
            <div>
              <h5 className="card-title text-sm mb-0.5 font-medium">{`${data.firstname} ${data.lastname}`}</h5>
              <span className="card-subtitle text-muted font-normal">{userRole(Number(session?.user.role))}</span>
              <p className="card-subtitle font-normal text-muted mb-0 mt-1 flex items-center">
                <Icon
                  icon="tabler:phone"
                  className="text-base me-1 relative top-0.5"
                />
                {data.phone}
              </p>
            </div>
          </div>
        </div>
        <SimpleBar>
          {profileData.profileDD.map((items, index) => (
            <Dropdown.Item
              as={Link}
              href={items.url}
              className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full"
              key={index}
            >
              <div className="flex items-center w-full">
                <div
                  className={`h-11 w-11 flex-shrink-0 rounded-md flex justify-center items-center bg-lightprimary`}
                >
                  <Image src={items.img} alt="icon" />
                </div>
                <div className="ps-4 flex justify-between w-full">
                  <div className="w-3/4 ">
                    <h5 className="mb-1 text-sm  group-hover/link:text-primary">
                      {items.title}
                    </h5>
                    <div className="text-xs  text-darklink">{items.subtitle}</div>
                  </div>
                </div>
              </div>
            </Dropdown.Item>
          ))}
        </SimpleBar>

        <div className="pt-2 px-30">
          <Button
            color={"outlineprimary"}
            onClick={() => signOut({ redirectTo: "/signin" })}
            className="w-full rounded-md"
          >
            ออกจากระบบ
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
