

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
    title: "My Profile",
    subtitle: "Account settings",
    url: "/apps/user-profile/profile",
  },

];

export {
  profileDD,
};
