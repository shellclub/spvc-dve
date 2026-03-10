"use client";
import React, { useContext } from "react";
import { ChildItem } from "../Sidebaritems";
import { Sidebar } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { CustomizerContext } from "@/app/context/CustomizerContext";

interface NavItemsProps {
  item: ChildItem;
  isMenuItem?: boolean;
  isParentActive?: boolean;
}
const NavItems: React.FC<NavItemsProps> = ({ item, isMenuItem, isParentActive }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setIsMobileSidebar } = useContext(CustomizerContext);
  const handleMobileSidebar = () => {
       setIsMobileSidebar(false)
  }

  const isActive = item.url == pathname;

  return (
    <>
      <Sidebar.Item
        href={item.url}
        as={Link}
        className={`${item.disabled
          ? "opacity-50 cursor-default hover:bg-transparent"
          : isActive
            ? "!text-[#1B5E20] !bg-white !shadow-md mb-0.5 hover:!bg-white hover:!text-[#1B5E20] font-semibold"
            : isParentActive
              ? "!text-[#2E7D32] !bg-transparent hover:!bg-[#1B5E20]/10 hover:!text-[#1B5E20] group/link"
              : "!text-white/80 !bg-transparent hover:!bg-white/10 hover:!text-white group/link"
          }`}
        style={{
          borderRadius: '10px',
          transition: 'all 0.2s ease',
        }}
      >
        <span onClick={handleMobileSidebar} className="flex gap-3.5 align-center items-center leading-normal truncate">
          {item.icon ? (
            <Icon icon={item.icon} className={`${isActive ? 'text-[#2E7D32]' : ''} my-0.5`} height={20} stroke="1" />
          ) : (
              <Icon icon="tabler:circle" className={`text-xs shrink-0 ${isActive ? "text-[#2E7D32]" : ""}`} stroke="1" />
          )}
          {!isMenuItem ? (
            <div className="max-w-36 truncate hide-menu flex-1">{t(`${item.name}`)}</div>
          ) : (
            <div className={`max-w-36 truncate hide-menu flex-1 ${isActive ? "text-[#2E7D32]" : ""}`}>{t(`${item.name}`)}</div>
          )}
        </span>
      </Sidebar.Item>
    </>
  );
};

export default NavItems;
