

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
    url: "/board/profile",
  },

];

export {
  profileDD,
};
