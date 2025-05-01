import UserProfileApp from "@/app/components/apps/userprofile/profile";
import type { Metadata } from "next";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
export const metadata: Metadata = {
  title: "User Profile App",
};

const UserProfile = () => {
  return (
    <>
      <UserProfileApp />
    </>
  );
};

export default UserProfile;
