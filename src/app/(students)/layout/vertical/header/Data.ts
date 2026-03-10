

//  Profile Data
interface ProfileType {
  title: string;
  img: any;
  subtitle: string;
  url: string;
}

import acccountIcon from "/public/images/svgs/icon-account.svg";

const profileDD: ProfileType[] = [
  {
    img: acccountIcon,
    title: "แก้ไขข้อมูลส่วนตัว",
    subtitle: "จัดการข้อมูลส่วนตัว",
    url: "/profile",
  },
  {
    img: acccountIcon,
    title: "ข้อมูลสถานประกอบการ",
    subtitle: "ดูรายละเอียดการฝึกงาน",
    url: "/company",
  },
  {
    img: acccountIcon,
    title: "เปลี่ยนรหัสผ่าน",
    subtitle: "ตั้งรหัสผ่านใหม่",
    url: "/profile", // Use /profile since the modal is there
  },
];

export {
  profileDD,
};
