"use client";
import Image from "next/image";
import React from "react";
import authbg from "/public/images/backgrounds/logo-login.svg";

const LeftSidebarPart = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full p-10 relative">
      {/* Decorative circles */}
      <div className="absolute top-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full bg-[#C8E6C9] opacity-40" />
      <div className="absolute bottom-[-80px] right-[-40px] w-[250px] h-[250px] rounded-full bg-[#A5D6A7] opacity-30" />
      <div className="absolute top-[30%] right-[5%] w-[100px] h-[100px] rounded-full bg-[#81C784] opacity-20" />

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        <div className="w-[280px] xl:w-[340px] mx-auto mb-8">
          <Image src={authbg} alt="auth-bg" className="w-full drop-shadow-lg" />
        </div>
        <h2 className="text-[#1B5E20] text-2xl xl:text-3xl font-bold leading-relaxed">
          โปรแกรมรายงาน
          <br />
          <span className="text-3xl xl:text-4xl">ฝึกงาน</span>
        </h2>
        <p className="text-[#2E7D32] text-lg xl:text-xl font-medium mt-3 opacity-80">
          วิทยาลัยอาชีวศึกษาสุพรรณบุรี
        </p>
      </div>
    </div>
  );
};

export default LeftSidebarPart;
