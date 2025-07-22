import { Icon } from "@iconify/react";
import { Button, Dropdown } from "flowbite-react";
import React from "react";
import * as profileData from "./Data";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import unlimitedbg from "/public/images/backgrounds/unlimited-bg.png"
import { auth } from "@/auth";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { userRole } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const Profile =  () => {
  const {data: session} = useSession(); 
  const {data, isLoading, mutate, error} = useSWR(`/api/users/${session?.user.id}`,fetcher);
  if(isLoading) {
    return <p>Loading....</p>
  }
  return (
    <div className="relative group/menu ps-15">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] py-6  rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className=" hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src={`/uploads/${data.user_img}`}
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <div className="px-6">
          <h3 className="text-lg font-semibold text-ld">ข้อมูลส่วนตัว</h3>
          <div className="flex items-center gap-6 pb-5 border-b dark:border-darkborder mt-5 mb-3">
            <Image
              src={`/uploads/${data.user_img}`}
              alt="logo"
              height="80"
              width="80"
              className="rounded-full"
            />
            <div>
              <h5 className="card-title text-sm  mb-0.5 font-medium">{`${data.firstname} ${data.lastname}`}</h5>
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
            onClick={() => signOut({ redirectTo: "/signin"})}
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
