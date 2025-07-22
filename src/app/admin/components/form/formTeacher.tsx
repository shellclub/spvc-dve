"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Label,
  TextInput,
  Select,
  Button,
  Datepicker,
} from "flowbite-react";
import TitleCard from "@/app/components/shared/TitleBorderCard";
import { showToast } from "@/app/components/sweetalert/sweetalert";
import { useRouter } from "next/navigation";
type Education = {
  id: number;
    name: string;
    createAt: Date;
}
type Department = {
  id: number;
    depname: string;
    createAt: Date;
    updateAt: Date;
}

type Teacher = {
  citizenId: string | null;
  firstname: string | null;
  lastname: string | null;
  sex: number | null;
  birthday: Date | null;
  departmentId: number | null;
  phone: string | null;
  role?: number
  user_img ?: File | null
}

type ErrorrMessage = {
  citizenId: string;
  firstname: string;
  lastname: string;
  sex: string;
  birthdate: string;
  departmentId: string;
  phone: string;
  user_img: string;
}

interface FormStudnetProps {
  id?: string; // prop นี้ไม่ส่งมาก็ได้
}

const FormTeacher: React.FC<FormStudnetProps> = ({id}) => {
  const [rows, setRows] = useState<Education[] | null>([]);
  const [departments, setDepartments] = useState<Department[] | null>([])
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState<Teacher>({
    firstname: "",
    lastname: "",
    sex: null,
    birthday: null,
    citizenId: "",
    phone: '',
    departmentId: null,
    role: 2,
    user_img: null
  });
  const createEmptyErrors = (): ErrorrMessage => ({
    citizenId: "",
    firstname: "",
    lastname: "",
    sex: "",
    birthdate: "",
    departmentId: "",
    phone: "",
    user_img: ""
  });
  const [errors, setErrors] = useState<ErrorrMessage>(createEmptyErrors());
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eduRes, depRes] = await Promise.all([
          fetch("/api/education"),
          fetch("/api/departments")
        ]);
        
        const [eduData, depData] = await Promise.all([
          eduRes.json(),
          depRes.json()
        ]);
        
        setRows(eduData.data);
        setDepartments(depData);
  
        if(id) {
          const userRes = await fetch(`/api/users/${id}`, {cache: "no-store"});
          const userData = await userRes.json();
          setFormData({
            citizenId: userData.citizenId || null,
            firstname: userData.firstname || null,
            lastname: userData.lastname || null,
            sex: userData.sex || null,
            birthday: userData.birthday ? new Date(userData.birthday) : null,
            departmentId: userData.departmentId || null,
            phone: userData.phone || null,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [id]);




  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value === "" ? null : Number(value), // ถ้าค่าเป็น number
    }));
  };
  

  const validate = () => {
    // สร้าง error messages ใหม่เริ่มจากค่าว่างทุกครั้ง
    const newErrors = createEmptyErrors();
    let isValid = true;
  
  
    if (!formData.firstname) {
      newErrors.firstname = "กรุณากรอกชื่อ";
      isValid = false;
    }

    if (!formData.lastname) {
      newErrors.lastname = "กรุณากรอกนามสกุล";
      isValid = false;
    }
    if (!formData.citizenId || !/^\d{13}$/.test(formData.citizenId)) {
      newErrors.citizenId = "กรุณากรอกเลขบัตร 13 หลักให้ถูกต้อง";
      isValid = false;
    }
    if (!formData.phone || !/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 0987654321";
      isValid = false;
    }
    if (!formData.sex) {
      newErrors.sex = "กรุณาเลือกเพศ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, user_img: file }));
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!validate()) {
      return false;
    }
    const form = new FormData();
    form.append("citizenId", formData.citizenId ?? "");
    form.append("firstname", formData.firstname ?? "");
    form.append("lastname", formData.lastname ?? "");
    form.append("sex", formData.sex?.toString() ?? "");
    form.append("birthday", formData.birthday?.toISOString() ?? "");
    form.append("departmentId", formData.departmentId?.toString() ?? "");
    form.append("phone", formData.phone ?? "");
    if (formData.user_img) {
      form.append("user_img", formData.user_img);
    }
 
    const res = await fetch(`/api/teachers${ id ? `/${id}` : ``}`,{
      method: id ? "PUT" : "POST",
      body: form
    })

    if(!res.ok) {
      const err = await res.json();
      showToast(err.message, err.type)
    }else{
      const response = await res.json();
      showToast(response.message, response.type)
      setFormData({
        firstname: "",
        lastname: "",
        sex: null,
        birthday: null,
        citizenId: "",
        phone: "",
        departmentId: null,
        user_img: null
  
      });
      router.refresh();
    }
    
  };
  const handleReset = () => {
    setFormData({
      firstname: "",
      lastname: "",
      sex: null,
      birthday: null,
      citizenId: "",
      phone: "",
      departmentId: null,
      user_img: null
    });
    setErrors(createEmptyErrors());
    
    
  };


  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <TitleCard title={`${id ? `แก้ไขข้อมูลอาจารย์ประจำแผนกวิชา` : 'เพิ่มข้อมูลอาจารย์ประจำแผนกวิชา'}`}>
        {/* <div className="overflow-x-auto"> */}
       
            <form onSubmit={handleSubmit} onReset={handleReset}>
                  

                 

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.875rem] mt-[1.875rem]">
                
                {/* Left */}
                <div className="flex flex-col gap-[1.875rem]">
               
               <FormRow label="เลขบัตรประชาชน" htmlFor="citizenId">
                  <TextInput
                        id="citizenId"
                        name="citizenId"
                        value={formData.citizenId as string}
                        onChange={handleChange}
                        placeholder="เช่น 1723200000000"
                        className="xxl:ms-12"
                    
                      />
                    <span className="text-red-500">{errors.citizenId}</span>
  
                  </FormRow>
                  <FormRow label="ชื่อ" htmlFor="firstname">
                    <TextInput
                      id="firstname"
                      value={formData.firstname as string}
                      onChange={handleChange}
                      placeholder="กรอกชื่ออาจารย์ผู้ดูแลแผนกวิชา"
                    />
                    <span className="text-red-500">{errors.firstname}</span>
                  </FormRow>
                  <FormRow label="นามสกุล" htmlFor="lastname">
                    <TextInput
                      id="lastname"
                      value={formData.lastname as string}
                      onChange={handleChange}
                      placeholder="กรอกนามสกุลอาจารย์ผู้ดูแลแผนกวิชา"
                    />
                    <span className="text-red-500">{errors.lastname}</span>
                  </FormRow>
                 
                  <FormRow label="วันเกิด" htmlFor="birthdate">
                    <Datepicker
                      language="th"
                        onSelectedDateChanged={(date) => setFormData({...formData, birthday: date})}
                    />
                    <span className="text-red-500">{errors.birthdate}</span>

                  </FormRow>
                  
                </div>

                {/* Right */}
                <div className="flex flex-col gap-[1.875rem]">
                 
                  <FormRow label="เบอร์โทร" htmlFor="phone" >
                    <TextInput
                      id="phone"
                      value={formData.phone as string}
                      onChange={handleChange}
                      placeholder="เช่น 0987654321"
                    />
                    <span className="text-red-500">{errors.phone}</span>
                  </FormRow>
                  
                  <FormRow label="แผนกวิชา" htmlFor="department">
                    <Select id="departmentId" value={formData.departmentId !== null ? String(formData.departmentId) : ""} onChange={handleSelectChange}>
                      <option hidden value="">เลือกแผนกวิชา</option>
                      {departments?.map((dep) => (
                        <option value={dep.id} key={dep.id}>{dep.depname}</option>
                      ))}
                    </Select>
                    <span className="text-red-500">{errors.departmentId}</span>
                  </FormRow>
                  <FormRow label="เพศ" htmlFor="sex" >
                    <Select id="sex" value={formData.sex !== null ? String(formData.sex) : ""} onChange={handleSelectChange}>
                      <option hidden value="">เลือกเพศของนักศึกษา</option>
                      <option value="1">ชาย</option>
                      <option value="2">หญิง</option>
                    </Select>
                    <span className="text-red-500">{errors.sex}</span>

                  </FormRow>
                  <FormRow label="รูปโปรไฟล์" htmlFor="user_img">
                  <input
                    type="file"
                    name="user_img"
                    id="user_img"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                  />

                    <span className="text-red-500">{errors.user_img}</span>

                  </FormRow>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-5 mt-[1.875rem]">
                <Button type="submit" color="primary">
                  บันทึกข้อมูล
                </Button>
                <Button type="reset" color="failure">
                  ยกเลิก
                </Button>
              </div>
            </form>
        {/* </div> */}
      </TitleCard>
    </div>
  );
};

// Sub-component to reuse form rows
const FormRow = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-12 gap-7 items-center">
    <div className="col-span-3">
      <Label htmlFor={htmlFor} value={label} />
    </div>
    <div className="col-span-9">{children}</div>
  </div>
);

export default FormTeacher;
