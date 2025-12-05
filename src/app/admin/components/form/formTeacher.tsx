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
import useSWR from "swr";
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
  // New fields
  majorId?: number | null;
  room: string | null;
  educationId?: number | null;
  years: string | null;
  term: string | null;
  grade: string | null;
  // New fields end
  birthday: Date | null;
  departmentId: number | null;
  phone: string | null;
  role?: number | null
  user_img ?: File | null
}

type ErrorrMessage = {
  citizenId: string;
  firstname: string;
  lastname: string;
  sex: string;
  majorId: string;
  birthdate: string;
  role: string;
  departmentId: string;
  phone: string;
  user_img: string;
  room: string;
  educationId: string;
  years: string;
  term: string;
  grade: string;
}

interface FormStudnetProps {
  id?: string; // prop นี้ไม่ส่งมาก็ได้
}
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const FormTeacher: React.FC<FormStudnetProps> = ({id}) => {
  const { data: majors, isLoading: isMajorLoading , error} = useSWR(`/api/major`, fetcher);
  const { data: educations, isLoading: isEducationLoading , error: eduError} = useSWR(`/api/education`, fetcher);
  const [rows, setRows] = useState<Education[] | null>([]);
  const [departments, setDepartments] = useState<Department[] | null>([])
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [filteredMajors, setFilteredMajors] = useState(majors);

  const [formData, setFormData] = useState<Teacher>({
    firstname: "",
    lastname: "",
    sex: null,
    birthday: null,
    citizenId: "",
    majorId: null,
    room: "",
    educationId: null,
    years: "",
    term: null,
    grade: null,
    phone: '',
    departmentId: null,
    role: null,
    user_img: null
  });
  const createEmptyErrors = (): ErrorrMessage => ({
    citizenId: "",
    firstname: "",
    room: "",
    educationId: "",
    years: "",
    term: "",
    grade: "",
    lastname: "",
    sex: "",
    majorId: "",
    birthdate: "",
    role: "",
    departmentId: "",
    phone: "",
    user_img: ""
  });
  const [errors, setErrors] = useState<ErrorrMessage>(createEmptyErrors());
  
 useEffect(() => {
   if(isMajorLoading) return; 
    if (!formData.departmentId) {
      // ยังไม่ได้เลือก department → แสดงทุก major
      setFilteredMajors(majors);
    } else {
      // กรองตาม department_id
      const filtered = majors.filter(
        (major: any) => String(major.departmentId) === String(formData.departmentId)
      );
      setFilteredMajors(filtered);
    }
   
  }, [formData.departmentId, majors]);

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
          const userRes = await fetch(`/api/teachers/${id}`, {cache: "no-store"});
          const userData = await userRes.json();
          setFormData({
            citizenId: userData.citizenId || null,
            firstname: userData.firstname || null,
            lastname: userData.lastname || null,
            sex: userData.sex || null,
            role: userData.role || null,
            room: userData.teacher.room || "",
            educationId: userData.teacher.educationId || null,
            years: userData.teacher.years || "",
            term: userData.teacher.term || null,
            grade: userData.teacher.grade || null,
            majorId: userData.role === 4 || userData.role === 5 ? userData.teacher.majorId || null : null,
            birthday: userData.birthday ? new Date(userData.birthday) : null,
            departmentId: userData.teacher.departmentId || null,
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
    if (!formData.role) {
      newErrors.role = "กรุณาเลือกตำแหน่ง";
      isValid = false;
    }
    
    if(formData.role === 4 || formData.role === 5) {
      if (!formData.majorId) {
        newErrors.departmentId = "กรุณาเลือกสาขาวิชา";
        isValid = false;
      }
      if (!formData.room) {
        newErrors.room = "กรุณากรอกห้องเรียน";
        isValid = false;
      }
      if (!formData.educationId) {
        newErrors.educationId = "กรุณาเลือกวุฒิการศึกษา";
        isValid = false;
      }
      if (!formData.years) {
        newErrors.years = "กรุณากรอกปีการศึกษา";
        isValid = false;
      }
      if (!formData.term) {
        newErrors.term = "กรุณากรอกภาคเรียน";
        isValid = false;
      }
      if (!formData.grade) {
        newErrors.grade = "กรุณากรอกระดับชั้น";
        isValid = false;
      }

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
    form.append("role", formData.role?.toString() ?? "");
    form.append("majorId", formData.majorId?.toString() ?? "");
    form.append("room", formData.room ?? "");
    form.append("educationId", formData.educationId?.toString() ?? "");
    form.append("years", formData.years ?? "");
    form.append("term", formData.term?.toString() ?? "");
    form.append("grade", formData.grade?.toString() ?? "");

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
      // console.log(err.message);
    }else{
      const response = await res.json();
      
      
      showToast(response.message, response.type)
      setFormData({
        firstname: "",
        lastname: "",
        sex: null,
        room: "",
        educationId: null,
        years: "",
        term: null,
        majorId: null,
        grade: null,
        birthday: null,
        citizenId: "",
        phone: "",
        departmentId: null,
        role: null,
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
      role: null,
      majorId: null,
      room: "",
      educationId: null,
      years: "",
      term: null,
      grade: null,
      departmentId: null,
      user_img: null
    });
    setErrors(createEmptyErrors());
    
    
  };


  if (isLoading || isMajorLoading || isEducationLoading) return <div>Loading...</div>;

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
                  { (formData.role === 4 || formData.role === 5) && (
                    <>
                     <FormRow label="ระดับการศึกษา" htmlFor="educationId">
                     <Select id="educationId" value={String(formData.educationId)} onChange={handleSelectChange}>
                       <option hidden value="">เลือกระดับการศึกษา (ที่รับผิดชอบ)</option>
                       {isEducationLoading ? (
                         <option>Loading...</option>
                       ) : educations.length > 0 ? ( 
                         educations?.map((education: any, index: any) => (
                         <option value={String(education.id)} key={index}>{education.name}</option>
                       ))) : (
                         <option>ไม่พบข้อมูล</option>
                       )}
 
                     </Select>
                     <span className="text-red-500">{errors.educationId}</span>
                   </FormRow>
                  
                      <FormRow label="ชั้นปี" htmlFor="grade">
                      <Select id="grade" value={formData.grade !== null ? String(formData.grade) : ""} onChange={handleSelectChange}>
                        <option hidden value="">เลือกชั้นทีปี(ที่รับผิดชอบ)</option>

                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                       
  
                      </Select>
                      <span className="text-red-500">{errors.grade}</span>
                    </FormRow>
                    <FormRow label="ห้อง" htmlFor="room">
                      <TextInput
                        id="room"
                        name="room"
                        value={formData.room as string}
                        onChange={handleChange}
                        placeholder="ห้องหรือกลุ่มที่รับผิดชอบ"
                        className="xxl:ms-12"
                    
                      />
                      <span className="text-red-500">{errors.room}</span>
                    </FormRow>
                    </>
                )}
                  <FormRow label="รูปโปรไฟล์" htmlFor="user_img">
                  <input
                    type="file"
                    name="user_img"
                    id="user_img"
                    accept="image/jpeg"
                    onChange={handleFileChange}
                  />

                    <span className="text-red-500">{errors.user_img}</span>

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
                  <FormRow label="เพศ" htmlFor="sex" >
                    <Select id="sex" value={formData.sex !== null ? String(formData.sex) : ""} onChange={handleSelectChange}>
                      <option hidden value="">เลือกเพศของอาจารย์ผู้ดูแลแผนกวิชา</option>
                      <option value="1">ชาย</option>
                      <option value="2">หญิง</option>
                    </Select>
                    <span className="text-red-500">{errors.sex}</span>

                  </FormRow>
                  
                
                  <FormRow label="ตำแหน่ง" htmlFor="role" >
                    <Select id="role" value={formData.role !== null ? String(formData.role) : ""} onChange={handleSelectChange}>
                      <option hidden value="">เลือกตำแหน่งของบุคคลากร</option>
                      <option value="2">ผู้บริหาร</option>
                      <option value="3">หัวหน้าแผนกวิชา</option>
                      <option value="4">ครูที่ปรึกษา</option>
                      <option value="5">ครูทวิภาคี</option>
                    </Select>
                    <span className="text-red-500">{errors.role}</span>

                  </FormRow>
                  { formData.role !== 2 && (
                                    <FormRow label="แผนกวิชา" htmlFor="department">
                                    <Select id="departmentId" value={formData.departmentId !== null ? String(formData.departmentId) : ""} onChange={handleSelectChange}>
                                      <option hidden value="">เลือกแผนกวิชา</option>
                                      {departments?.map((dep) => (
                                        <option value={dep.id} key={dep.id}>{dep.depname}</option>
                                      ))}
                                    </Select>
                                    <span className="text-red-500">{errors.departmentId}</span>
                                  </FormRow>
                                  )  
                  }
                 
                  { (formData.role === 4 || formData.role === 5) && (
                    <>
                      <FormRow label="สาขาวิชา" htmlFor="major">
                      <Select id="majorId" value={formData.majorId !== null ? String(formData.majorId) : ""} onChange={handleSelectChange}>
                        <option hidden value="">เลือกสาขาวิชา(ที่รับผิดชอบ)</option>
                        {isMajorLoading ? (
                          <option>Loading...</option>
                        ) : filteredMajors.length > 0 ? ( 
                          filteredMajors?.map((major: any) => (
                          <option value={major.id} key={major.id}>{major.major_name}</option>
                        ))) : (
                          <option>ไม่มีสาขาวิชาในแผนกนี้</option>
                        )}

                      </Select>
                      <span className="text-red-500">{errors.majorId}</span>
                    </FormRow>
                    <FormRow label="ภาคเรียน" htmlFor="term">
                      <Select id="term" value={String(formData.term)} onChange={handleSelectChange}>
                        <option hidden value="">เลือกภาคเรียน(ที่รับผิดชอบ)</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>  
                      </Select>
                      <span className="text-red-500">{errors.years}</span>
                    </FormRow>

                    
                      <FormRow label="ปีการศึกษา" htmlFor="years">
                      <TextInput
                        id="years"
                        name="years"
                        value={formData.years as string}
                        onChange={handleChange}
                        placeholder="เช่น 2566"
                        className="xxl:ms-12"
                    
                      />
                      <span className="text-red-500">{errors.years}</span>
                    </FormRow>
                    </>
                )}
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
