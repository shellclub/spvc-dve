

import { Sidebar } from "flowbite-react";
import React from "react";
import { ChildItem } from "../Sidebaritems";
import NavItems from "../NavItems";
import { Icon } from "@iconify/react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

interface NavCollapseProps {
  item: ChildItem;
}

const NavCollapse: React.FC<NavCollapseProps> = ({ item }: any) => {
  const pathname = usePathname();
  const activeDD = item.children.find((t: { url: string; }) => t.url === pathname)
  const { t } = useTranslation();
  return (
    <>
      <Sidebar.Collapse
        label={t(`${item.name}`)} 
        open={activeDD ? true : false}
        icon={() => <Icon icon={item.icon} height={20} stroke="1" className="my-0.5" />}
        className={`${activeDD ? '!text-[#1B5E20] !bg-white !shadow-md active-dropdown' : '!text-white/80 hover:!bg-white/10'} collapse-menu !rounded-xl`}
        renderChevronIcon={(theme, open) => {
          const IconComponent = open
            ? HiOutlineChevronDown
            : HiOutlineChevronDown;
          return (
            <IconComponent
              aria-hidden
              className={`${twMerge(theme.label.icon.open[open ? "on" : "off"])} drop-icon`}
            />
          );
        }}
      >
        {/* Render child items */}
        {item.children && (
          <Sidebar.ItemGroup className={`sidebar-dropdown ${activeDD ? 'active-dropdown' : ''}`}>
            {item.children.map((child: any) => (
              <React.Fragment key={child.id}>
                {/* Render NavItems for child items */}
                {child.children ? (
                  <NavCollapse item={child}  /> // Recursive call for nested collapse
                ) : (
                    <NavItems item={child} isMenuItem={true} isParentActive={!!activeDD} />
                )}
              </React.Fragment>
            ))}
          </Sidebar.ItemGroup>
        )}
      </Sidebar.Collapse>
    </>
  );
};

export default NavCollapse;
