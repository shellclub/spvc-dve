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

const fetcher = async(url: string) => await fetch(url).then(res => res.json());

const SidebarLayout = () => {
  const { isCollapse } = useContext(CustomizerContext);
  const { data: session, status } = useSession();

  const swrKey = session?.user?.id ? `/api/users/${session.user.id}` : null;
  const { data, isLoading, error } = useSWR(swrKey, fetcher);

  const isSessionLoading = status === "loading";

  return (
    <>
      <div className="xl:block hidden">
        <div className="flex">
          <Sidebar
            className={`${isLoading || isSessionLoading ? 'animate-pulse pointer-events-none opacity-60' : ''} fixed menu-sidebar z-[6]`}
            aria-label="Sidebar navigation"
            style={{
              background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 40%, #388E3C 100%)',
              borderRight: 'none',
              boxShadow: '4px 0 20px rgba(27, 94, 32, 0.15)',
            }}
          >
            {/* Logo area */}
            <div className={`${isCollapse==="full-sidebar"?"px-6":"px-5"} flex items-center brand-logo overflow-hidden`}>
              <div className="py-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Icon icon="tabler:report-analytics" height={24} className="text-white" />
                  </div>
                  <span className="hide-menu text-white font-bold text-lg tracking-wide">E-REPORT</span>
                </div>
              </div>
            </div>

            <SimpleBar className="h-[calc(100vh_-_170px)]">
              <Sidebar.Items className={`${isCollapse === "full-sidebar" ? "px-4" : "px-3"} mt-2`}>
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
             
            {/* Sidebar Profile */}
            <div className={`my-4 ${isCollapse === "full-sidebar" ? "mx-4" : "mx-2"}`}>
              <div className={`py-3 ${isCollapse === "full-sidebar" ? "px-4" : "px-2"} bg-white/15 backdrop-blur-sm rounded-xl overflow-hidden`}>
                {isLoading || isSessionLoading ? (
                  <Spinner aria-label="Loading" color="success" />
                ) : (
                  data && session?.user && (
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                        <Image 
                          src={`/uploads/${data.user_img ?? 'avatar.jpg'}`} 
                            alt="profile" 
                          width={40} 
                          height={40} 
                            className="rounded-full ring-2 ring-white/30" 
                          unoptimized={true}
                        />
                        <div>
                            <h3 className="text-sm font-semibold text-white">{data.firstname}</h3>
                            <p className="text-xs text-white/60">
                            {userRole(Number(session?.user.role))}
                          </p>
                        </div>
                      </div>
                        <Tooltip content="ออกจากระบบ">
                          <div className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <Icon 
                            icon="tabler:power" 
                            onClick={() => signOut({redirectTo: "/signin"})}  
                              className="text-white/80 hover:text-white text-xl" 
                          />
                        </div>
                      </Tooltip>
                    </div>
                  )
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