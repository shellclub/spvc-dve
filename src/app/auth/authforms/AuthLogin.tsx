'use client'
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { Icon } from "@iconify/react";

const AuthLogin = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password
      });
      if (res?.error) {
        showToast("Username หรือ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง", 'error');
        router.refresh();
      } else {
        router.push("/protected");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-gray-700 text-lg font-semibold mb-2"
        >
          ชื่อผู้ใช้
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="กรุณากรอกรหัสนักศึกษาของคุณ"
          className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                     bg-gray-50 placeholder-gray-400
                     focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D3240] focus:bg-white
                     transition-all duration-200"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="userpwd"
          className="block text-gray-700 text-lg font-semibold mb-2"
        >
          รหัสผ่าน
        </label>
        <div className="relative">
          <input
            id="userpwd"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน วัน/เดือน/ปีเกิด"
            className="w-full h-14 px-4 pr-14 text-lg border-2 border-gray-200 rounded-xl
                       bg-gray-50 placeholder-gray-400
                       focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D3240] focus:bg-white
                       transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
                       text-gray-400 hover:text-[#2E7D32] hover:bg-[#E8F5E9]
                       transition-all duration-200"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            <Icon
              icon={showPassword ? 'tabler:eye-closed' : 'tabler:eye'}
              height={24}
            />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 mt-3 rounded-xl text-lg font-bold text-white
                   bg-[#2E7D32] hover:bg-[#1B5E20] active:bg-[#145218]
                   disabled:opacity-60 disabled:cursor-not-allowed
                   shadow-lg hover:shadow-xl
                   transform active:scale-[0.98]
                   transition-all duration-200
                   flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Icon icon="tabler:loader-2" height={22} className="animate-spin" />
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </button>
    </form>
  );
};

export default AuthLogin;
