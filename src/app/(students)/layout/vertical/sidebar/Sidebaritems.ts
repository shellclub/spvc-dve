export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?:boolean,
  subtitle?:string,
  badge?:boolean,
  badgeType?:string,
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?:boolean,
  subtitle?:string,
  badgeType?:string,
  badge?:boolean,
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "เมนู",
    children: [
      {
        name: "หน้าแรก",
        icon: 'tabler:home',
        id: uniqueId(),
        url: "/",
      },
      {
        name: "รายงานการปฏิบัติงานแต่ละวัน",
        icon: 'tabler:file-text',
        id: uniqueId(),
        url: "/reportintern"
      },
      {
        name: "รายละเอียดการฝึกงาน",
        icon: 'tabler:building',
        id: uniqueId(),
        url: "/company"
      },
      {
        name: "ส่งออกรายงาน",
        icon: 'tabler:printer',
        id: uniqueId(),
        url: "/export"
      },
    ],
  },
];
export default SidebarContent;
