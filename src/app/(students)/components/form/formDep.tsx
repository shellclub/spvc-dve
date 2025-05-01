'use client'
import React, { FormEvent, useEffect, useState } from "react";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { Alert } from "flowbite-react";
import { useRouter } from "next/navigation";
import { PaginationTableType } from "../table/tableDepartment";
type depProps = {
  depname: string;
  id: string
}
const FormDep = ({data}:{data: depProps}) => {
  const [depName, setDepName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const isEditMode = !!data?.id;

  const router = useRouter();
  useEffect(() => {
    if(data) {
      setDepName(data.depname);
    }
    
  },[data])
  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!depName) {
      setMessage("กรุณากรอกข้อมูลแผนกวิชาให้ครบถ้วน");
      return false;
    }
    const res = await fetch(`/api/departments${data.id ? `/${data.id}` : ""}`,{
      method: `${data.id ? "PUT" : "POST"}`,
      body: JSON.stringify({depname: depName}),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if(!res.ok) {
      const err = await res.json();
      showToast(err.message, err.type)
    }
    if(res.ok) {
      const response = await res.json();
    showToast(response.message, response.type)
    setDepName("");
    if (isEditMode) {
      router.push("/admin/mng-department"); // หรือ path ที่เหมาะสม
    } else {
      router.refresh();
    }

    }
  }
  return (
    <CardBox>
    <div className="flex items-center justify-between">
      <h4 className="text-lg font-semibold">จัดการข้อมูลแผนกวิชา</h4>
    </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5 mt-6">
          { message && ( 
            <Alert color="lighterror" rounded>
            <span className="font-medium">Error:</span> { message}
          </Alert>

          )}
        <div>
          <Label htmlFor="name">แผนกวิชา</Label>
          <Input type="text" value={depName} onChange={(e) => setDepName(e.target.value)} name="depname" placeholder="กรอกชื่อแผนกวิชา" />
        </div>
    
        <div className="flex gap-3 justify-end">
          <Button type="submit">Submit</Button>
          <Button variant={"error"} type="reset" onClick={() => {
  setDepName("");
  router.push("/admin/mng-department"); // หรือทำให้กลับไปโหมดเพิ่ม
}}>Cancel</Button>
        </div>
      </div>
      </form>
  </CardBox>
  );
};

export default FormDep;
