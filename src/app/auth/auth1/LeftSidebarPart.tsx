"use client";
import Image from "next/image";
import React from "react";
import authbg from "/public/images/backgrounds/logo-login.svg"

const LeftSidebarPart = () => {
  return (
    <>
      <div className="flex justify-center h-screen items-center z-10 relative">
        <div className="xl:w-5/12 lg:w-10/12 xl:px-0 px-6">
        <Image src={authbg} alt="auth-bg" className="w-full" />
        </div>
      </div>
    </>
  );
};

export default LeftSidebarPart;
