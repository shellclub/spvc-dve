"use client";
import React, { useContext } from "react";
import { Sidebar, Tooltip } from "flowbite-react";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import SimpleBar from "simplebar-react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { userRole } from "@/lib/utils";

const fetcher = async (url: string) => await fetch(url).then(res => res.json());

const MobileSidebar = () => {
  const { data: session, status } = useSession();
  const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;
  const { data, isLoading } = useSWR(swrKey, fetcher);

  return (
    <>
     <div className="flex">
          <Sidebar
          className="fixed menu-sidebar pt-0 z-[10]"
          aria-label="Mobile sidebar"
          style={{
            background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 40%, #388E3C 100%)',
            borderRight: 'none',
          }}
          >
          {/* Logo */}
            <div className="px-6 flex items-center brand-logo overflow-hidden">
            <div className="py-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="tabler:report-analytics" height={24} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg tracking-wide">E-REPORT</span>
              </div>
            </div>
          </div>

            <SimpleBar className="h-[calc(100vh_-_170px)]">
            <Sidebar.Items className="px-4">
                <Sidebar.ItemGroup className="sidebar-nav">
                  {SidebarContent.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-white/60 font-bold text-xs caption">
                        <span className="hide-menu leading-21 uppercase tracking-wider">{item.heading}</span>
                        <Icon
                          icon="tabler:dots"
                          className="text-white/40 block mx-auto leading-6 hide-icon"
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

          {/* Profile */}
          <div className="my-4 mx-4">
            <div className="py-3 px-4 bg-white/15 backdrop-blur-sm rounded-xl overflow-hidden">
              {data && session?.user ? (
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Image
                      src={`/uploads/${data?.user_img ?? 'avatar.jpg'}`}
                      alt="profile"
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-white/30"
                      unoptimized={true}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{data?.firstname}</h3>
                      <p className="text-xs text-white/60">
                        {userRole(Number(session?.user.role))}
                      </p>
                    </div>
                  </div>
                  <Tooltip content="ออกจากระบบ">
                    <div className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Icon
                        icon="tabler:power"
                        onClick={() => signOut({ redirectTo: "/signin" })}
                        className="text-white/80 hover:text-white text-xl"
                      />
                    </div>
                  </Tooltip>
                </div>
              ) : (
                <div className="text-white/50 text-sm text-center">กำลังโหลด...</div>
              )}
            </div>
          </div>
          </Sidebar>
        </div>
    </>
  );
};

export default MobileSidebar;
