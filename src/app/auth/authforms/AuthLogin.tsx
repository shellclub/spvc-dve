'use client'
import { signIn } from "next-auth/react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { Icon } from "@iconify/react";
const AuthLogin = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password
      });
      if(res.error) {
        showToast("Username หรือ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง", 'error');
        router.refresh();
      }else{
        router.push("/protected");
      }
    } catch (err) {
      console.log(err);
      
      
    }
  }
  return (
    <>
      <form className="mt-6" onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="Username" value="ชื่อผู้ใช้" />
          </div>
          <TextInput
            id="username"
            type="text"
            sizing="md"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="กรุณากรอกรหัสนักศึกษาของคุณ"
          />
        </div>
        <div className="mb-4 relative">
      <div className="mb-2 block">
        <Label htmlFor="userpwd" value="รหัสผ่าน" />
      </div>
      <TextInput
        id="userpwd"
        type={showPassword ? 'text' : 'password'}
        sizing="md"
        className="form-control"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="กรอกรหัสผ่านของคุณเป็น วัน/เดือน/ปีเกิด"
      />
      <span
        className="absolute right-3 top-[40px] cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        <Icon
          icon={showPassword ? 'tabler:eye-closed' : 'tabler:eye'}
          height={20}
        />
      </span>
    </div>

        <Button color={"primary"} type="submit" className="w-full rounded-md mt-6">
          เข้าสู่ระบบ
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
