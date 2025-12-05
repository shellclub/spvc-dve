"use client";

import React, { useContext } from "react";
import { Sidebar, Spinner, Tooltip } from "flowbite-react";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import SimpleBar from "simplebar-react";
import FullLogo from "../../shared/logo/FullLogo";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { userRole } from "@/lib/utils";
const fetcher = async (url: string) => await fetch(url).then(res => res.json());
const SidebarLayout = () => {
  const { isCollapse } = useContext(CustomizerContext);

  const { data: session, status } = useSession();

  // สร้าง key สำหรับ SWR โดย check ว่า session.user.id มีค่าหรือไม่
  const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;

  const { data, isLoading, error } = useSWR(swrKey, fetcher);

  // แสดง loading หาก session ยังไม่โหลดเสร็จ
  const isSessionLoading = status === "loading";

  return (
    <>
      <div className="xl:block hidden ">
        <div className="flex ">
          <Sidebar
            className={`${isLoading || isSessionLoading ? 'animate-pulse pointer-events-none opacity-60' : ''} fixed menu-sidebar bg-white dark:bg-dark z-[6] border-r rtl:border-l border-border dark:border-darkborder`}
            aria-label="Sidebar with multi-level dropdown example"
          >
            <div className={`${isCollapse === "full-sidebar" ? "px-6" : "px-5"} flex items-center brand-logo overflow-hidden`}>
              <FullLogo />
            </div>

            <SimpleBar className="h-[calc(100vh_-_170px)]">
              <Sidebar.Items className={`${isCollapse === "full-sidebar" ? "px-6" : "px-4"}`}>
                <Sidebar.ItemGroup className="sidebar-nav">
                  {SidebarContent.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-bold text-xs dark:text-darklink caption">
                        <span className="hide-menu leading-21">{item.heading?.toUpperCase()}</span>
                        <Icon
                          icon="tabler:dots"
                          className="text-ld block mx-auto leading-6 dark:text-opacity-60 hide-icon"
                          height={18}
                        />
                      </h5>


                      {item.children?.map((child, index) => (
                        <React.Fragment key={child.id && index}>
                          {child.children ? (
                            <div className="collpase-items">
                              <NavCollapse item={child} />
                            </div>
                          ) : (
                            <NavItems item={child} />
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </Sidebar.ItemGroup>
              </Sidebar.Items>
            </SimpleBar>
            {/* Sidebar Profile */}
            <div className={` my-4 ${isCollapse === "full-sidebar" ? "mx-6" : "mx-2"}`}>
              <div className={` py-4 ${isCollapse === "full-sidebar" ? "px-4" : "px-2"} bg-lightsecondary rounded-md overflow-hidden`}>
                {isLoading ? (<Spinner aria-label="Default status example" />) : (
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <Image src={`/uploads/${data?.user_img || 'avatar.jpg'}`} alt="profile-image" width={40} height={40} className="rounded-full" unoptimized={true} />
                      <div>
                        <h3 className="text-base font-semibold" >{data?.firstname || 'loading'}</h3>
                        <p className="text-xs font-normal text-muted dark:text-darklink" >{userRole(Number(session?.user.role))}</p>
                      </div>
                    </div>
                    <Tooltip content="Logout">
                      <div className="cursor-pointer">
                        <Icon icon="tabler:power" onClick={() => signOut({ redirectTo: "/signin" })} className="text-primary text-2xl" />
                      </div>
                    </Tooltip>

                  </div>
                )}
              </div>
            </div>
          </Sidebar>
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;
