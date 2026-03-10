
import React from "react";
import AuthLogin from "../../authforms/AuthLogin";
import LeftSidebarPart from "../LeftSidebarPart";
import type { Metadata } from "next";
import Image from "next/image";
import Logo from "/public/images/logos/logo-spvc.svg";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ — ระบบรายงานการฝึกงาน",
  description: "ระบบรายงานการฝึกงาน วิทยาลัยอาชีวศึกษาสุพรรณบุรี",
};

const Login = () => {
  return (
    <div className="min-h-screen bg-white lg:bg-[#E8F5E9]">
      {/* Mobile Logo - visible only on mobile */}
      <div className="lg:hidden flex items-center gap-3 p-5 pb-0">
        <Image src={Logo} alt="logo" width={44} height={44} />
        <span className="text-[#2E7D32] font-bold text-lg tracking-wide">E-REPORT DVE</span>
      </div>

      <div className="flex min-h-screen">
        {/* Left Panel — Desktop only */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-[#E8F5E9] items-center justify-center relative overflow-hidden">
          <LeftSidebarPart />
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center bg-white px-6 sm:px-12 py-10">
          <div className="w-full max-w-[480px]">
            {/* Desktop logo */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <Image src={Logo} alt="logo" width={48} height={48} />
              <span className="text-[#2E7D32] font-bold text-xl tracking-wide">E-REPORT DVE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-snug">
              ยินดีต้อนรับสู่
              <br />
              <span className="text-[#2E7D32]">ระบบรายงานการฝึกงาน</span>
            </h1>
            <p className="text-[#66BB6A] text-base sm:text-lg font-medium mt-2 mb-8">
              วิทยาลัยอาชีวศึกษาสุพรรณบุรี
            </p>

            <AuthLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
