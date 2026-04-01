"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

/* ─── Types ─── */
interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

/* ─── Menu Items ─── */
const menuItems: MenuItem[] = [
  { id: "overview", label: "ภาพรวมระบบ", icon: "tabler:layout-dashboard" },
  { id: "login", label: "การเข้าสู่ระบบ", icon: "tabler:login" },
  { id: "admin-dashboard", label: "แดชบอร์ด (Admin)", icon: "tabler:chart-bar" },
  { id: "admin-department", label: "จัดการแผนกวิชา", icon: "tabler:building" },
  { id: "admin-students", label: "จัดการนักศึกษา", icon: "tabler:school" },
  { id: "admin-teachers", label: "จัดการบุคคลากร", icon: "tabler:users" },
  { id: "admin-company", label: "จัดการสถานประกอบการ", icon: "tabler:buildings" },
  { id: "admin-all-students", label: "รายชื่อนักศึกษาทั้งหมด", icon: "tabler:list" },
  { id: "student-home", label: "หน้าแรก (นักศึกษา)", icon: "tabler:home" },
  { id: "student-report", label: "รายงานการปฏิบัติงาน", icon: "tabler:file-text" },
  { id: "student-company", label: "รายละเอียดการฝึกงาน", icon: "tabler:briefcase" },
  { id: "student-export", label: "ส่งออกรายงาน", icon: "tabler:printer" },
  { id: "teacher", label: "ระบบครูที่ปรึกษา", icon: "tabler:chalkboard" },
  { id: "department-head", label: "ระบบหัวหน้าแผนก", icon: "tabler:folder" },
  { id: "board", label: "ระบบผู้บริหาร", icon: "tabler:shield-check" },
];

/* ─── Shared Components ─── */
function ManualImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-md">
      <Image src={src} alt={alt} width={1200} height={700} className="w-full h-auto" unoptimized />
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 my-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1a73a7] text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      <div className="text-gray-700 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-[#1a73a7] rounded-r-lg p-4 my-5 text-sm text-blue-900">
      💡 <strong>หมายเหตุ:</strong> {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-gray-200">
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-gray-700 mt-8 mb-3">{children}</h3>;
}

/* ─── Section Content Map ─── */
function SectionContent({ sectionId }: { sectionId: string }) {
  switch (sectionId) {
    case "overview":
      return (
        <>
          <SectionHeading>ภาพรวมระบบ</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-4">
            ระบบรายงานการฝึกงาน (E-REPORT DVE) เป็นระบบจัดการข้อมูลการฝึกงาน สำหรับวิทยาลัยอาชีวศึกษาสุพรรณบุรี
            ใช้ในการบันทึกข้อมูล ติดตามความก้าวหน้า และส่งออกรายงานการฝึกงานของนักศึกษา
          </p>

          <SubHeading>บทบาทผู้ใช้งานในระบบ</SubHeading>
          <p className="text-gray-700 leading-relaxed mb-3">ระบบรองรับผู้ใช้งาน 5 บทบาท ดังนี้:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">บทบาท</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">หน้าที่หลัก</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">ชื่อผู้ใช้</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["ผู้ดูแลระบบ (Admin)", "จัดการข้อมูลทั้งหมดในระบบ", "Admin"],
                  ["นักศึกษา", "รายงานการฝึกงาน ส่งออกรายงาน", "รหัสนักศึกษา"],
                  ["ครูที่ปรึกษา", "ดูแลนักศึกษาในความรับผิดชอบ", "Username ที่กำหนด"],
                  ["หัวหน้าแผนก", "ดูข้อมูลนักศึกษาและบุคลากรในแผนก", "Username ที่กำหนด"],
                  ["ผู้บริหาร", "ดูภาพรวมข้อมูลทั้งหมด", "Username ที่กำหนด"],
                ].map(([role, duty, username], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800 border-b">{role}</td>
                    <td className="px-4 py-3 text-gray-600 border-b">{duty}</td>
                    <td className="px-4 py-3 text-gray-600 border-b">{username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubHeading>เมนูของแต่ละบทบาท</SubHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {[
              { title: "ผู้ดูแลระบบ", items: ["หน้าแรก (Dashboard)", "จัดการข้อมูลแผนกวิชา", "จัดการข้อมูลนักศึกษา", "จัดการข้อมูลบุคคลากร", "จัดการข้อมูลสถานประกอบการ", "รายชื่อนักศึกษาทั้งหมด"] },
              { title: "นักศึกษา", items: ["หน้าแรก", "รายงานการปฏิบัติงานแต่ละวัน", "รายละเอียดการฝึกงาน", "ส่งออกรายงาน"] },
              { title: "ครูที่ปรึกษา", items: ["หน้าแรก (นักศึกษาในความดูแล)"] },
              { title: "หัวหน้าแผนก", items: ["หน้าแรก", "ข้อมูลบุคคลากร"] },
              { title: "ผู้บริหาร", items: ["หน้าแรก", "ข้อมูลบุคลากร", "ข้อมูลสถานประกอบการ", "ข้อมูลการนิเทศ"] },
            ].map((role) => (
              <div key={role.title} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-bold text-gray-800 text-sm mb-2">{role.title}</h4>
                <ul className="space-y-1">
                  {role.items.map((item) => (
                    <li key={item} className="text-sm text-gray-600 flex items-center gap-1.5">
                      <span className="text-[#1a73a7]">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      );

    case "login":
      return (
        <>
          <SectionHeading>การเข้าสู่ระบบ</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            เข้าสู่ระบบผ่านเว็บไซต์ <strong className="text-[#1a73a7]">dve.spvc.ac.th</strong> ระบบจะแสดงหน้าเข้าสู่ระบบดังรูป:
          </p>
          <ManualImage src="/images/manual/login_page.png" alt="หน้าเข้าสู่ระบบ" />

          <SubHeading>ขั้นตอนการเข้าสู่ระบบ</SubHeading>
          <Step number={1}>เปิดเว็บเบราว์เซอร์ (Chrome, Firefox, Safari) แล้วไปที่ <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">dve.spvc.ac.th</code></Step>
          <Step number={2}>กรอก <strong>ชื่อผู้ใช้</strong> — สำหรับนักศึกษาใช้ <strong>รหัสนักศึกษา</strong> เช่น 68201010001</Step>
          <Step number={3}>กรอก <strong>รหัสผ่าน</strong> — สำหรับนักศึกษาใช้ <strong>วัน/เดือน/ปีเกิด พ.ศ.</strong> เช่น 10042560</Step>
          <Step number={4}>กดปุ่ม <strong>&quot;เข้าสู่ระบบ&quot;</strong></Step>
          <Step number={5}>ระบบจะนำไปยังหน้าแรกตามบทบาทของผู้ใช้โดยอัตโนมัติ</Step>

          <InfoBox>
            หากเข้าสู่ระบบครั้งแรก ระบบจะแนะนำให้เปลี่ยนรหัสผ่าน สามารถเปลี่ยนรหัสผ่านทันที หรือกด &quot;ข้ามไปก่อน&quot; เพื่อเปลี่ยนภายหลังได้
          </InfoBox>

          <SubHeading>กรณีลืมรหัสผ่าน</SubHeading>
          <p className="text-gray-700 text-sm leading-relaxed">
            หากลืมรหัสผ่าน ให้ติดต่อ <strong>ผู้ดูแลระบบ (Admin)</strong> เพื่อให้รีเซ็ตรหัสผ่านกลับไปเป็นค่าเริ่มต้น
            โดย Admin สามารถกดปุ่ม 🔑 ที่หน้าจัดการนักศึกษาหรือบุคลากรได้
          </p>
        </>
      );

    case "admin-dashboard":
      return (
        <>
          <SectionHeading>แดชบอร์ด (Admin)</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            หน้าแรกของผู้ดูแลระบบ แสดงข้อมูลภาพรวมของระบบทั้งหมด เช่น จำนวนนักศึกษา จำนวนบุคลากร จำนวนสถานประกอบการ
          </p>
          <ManualImage src="/images/manual/admin_dashboard.png" alt="แดชบอร์ดผู้ดูแลระบบ" />
          <p className="text-gray-700 text-sm leading-relaxed">
            แดชบอร์ดจะแสดงสถิติสำคัญและข้อมูลสรุปของระบบ ช่วยให้ผู้ดูแลระบบเห็นภาพรวมได้ทันที
          </p>
        </>
      );

    case "admin-department":
      return (
        <>
          <SectionHeading>จัดการข้อมูลแผนกวิชา</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            จัดการข้อมูลแผนกวิชาและสาขาวิชาต่างๆ ของวิทยาลัย สามารถเพิ่ม แก้ไข และลบแผนกวิชาได้
          </p>
          <ManualImage src="/images/manual/admin_department.png" alt="จัดการข้อมูลแผนกวิชา" />

          <SubHeading>ขั้นตอนการเพิ่มแผนกวิชา</SubHeading>
          <Step number={1}>เข้าเมนู <strong>จัดการ → จัดการข้อมูลแผนกวิชา</strong></Step>
          <Step number={2}>กดปุ่ม <strong>&quot;+ เพิ่มแผนก&quot;</strong> ที่มุมขวาบน</Step>
          <Step number={3}>กรอก <strong>ชื่อแผนกวิชา</strong> เช่น &quot;แผนกเทคโนโลยีสารสนเทศ&quot;</Step>
          <Step number={4}>กดปุ่ม <strong>&quot;บันทึก&quot;</strong></Step>

          <SubHeading>การแก้ไข / ลบ แผนกวิชา</SubHeading>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li>กดปุ่ม <strong>✏️ (แก้ไข)</strong> เพื่อแก้ไขชื่อแผนก</li>
            <li>กดปุ่ม <strong>🗑️ (ลบ)</strong> เพื่อลบแผนก (ต้องไม่มีนักศึกษาอยู่ในแผนกนั้น)</li>
          </ul>
        </>
      );

    case "admin-students":
      return (
        <>
          <SectionHeading>จัดการข้อมูลนักศึกษา</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            เพิ่ม แก้ไข ลบ ค้นหา และนำเข้าข้อมูลนักศึกษาในระบบ
          </p>
          <ManualImage src="/images/manual/admin_students.png" alt="จัดการข้อมูลนักศึกษา" />

          <SubHeading>ขั้นตอนการเพิ่มนักศึกษา</SubHeading>
          <Step number={1}>เข้าเมนู <strong>จัดการ → จัดการข้อมูลนักศึกษา</strong></Step>
          <Step number={2}>กดปุ่ม <strong>&quot;+ เพิ่มนักศึกษา&quot;</strong></Step>
          <Step number={3}>กรอกข้อมูล: รหัสนักศึกษา, คำนำหน้า, ชื่อ-นามสกุล, เลขบัตรประชาชน, เบอร์โทร</Step>
          <Step number={4}>เลือก <strong>แผนก, สาขา, ระดับชั้น, ภาคเรียน, ห้อง</strong></Step>
          <Step number={5}>กดปุ่ม <strong>&quot;บันทึก&quot;</strong></Step>

          <SubHeading>การนำเข้าจากไฟล์ Excel</SubHeading>
          <Step number={1}>กดปุ่ม <strong>&quot;นำเข้า&quot;</strong> ที่อยู่ด้านบน</Step>
          <Step number={2}>เลือกไฟล์ <strong>Excel (.xlsx)</strong> ที่มีข้อมูลนักศึกษา</Step>
          <Step number={3}>ระบบจะนำเข้าข้อมูลนักศึกษาทั้งหมดจากไฟล์โดยอัตโนมัติ</Step>

          <SubHeading>การค้นหานักศึกษา</SubHeading>
          <p className="text-gray-700 text-sm leading-relaxed">
            ใช้ช่องค้นหาด้านบนของตาราง พิมพ์ <strong>ชื่อ</strong> หรือ <strong>รหัสนักศึกษา</strong> เพื่อค้นหา
          </p>

          <SubHeading>ปุ่มจัดการในแต่ละแถว</SubHeading>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li><strong>✏️ แก้ไข</strong> — แก้ไขข้อมูลนักศึกษา</li>
            <li><strong>🔑 รีเซ็ตรหัสผ่าน</strong> — รีเซ็ตรหัสผ่านกลับไปเป็นค่าเริ่มต้น</li>
            <li><strong>🗑️ ลบ</strong> — ลบข้อมูลนักศึกษาออกจากระบบ</li>
          </ul>
        </>
      );

    case "admin-teachers":
      return (
        <>
          <SectionHeading>จัดการข้อมูลบุคคลากร</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            จัดการข้อมูลครู อาจารย์ และบุคลากรของวิทยาลัย
          </p>
          <ManualImage src="/images/manual/admin_teachers.png" alt="จัดการข้อมูลบุคคลากร" />

          <SubHeading>ขั้นตอนการเพิ่มบุคลากร</SubHeading>
          <Step number={1}>เข้าเมนู <strong>จัดการ → จัดการข้อมูลบุคคลากร</strong></Step>
          <Step number={2}>กดปุ่ม <strong>&quot;+ เพิ่มบุคลากร&quot;</strong></Step>
          <Step number={3}>กรอกข้อมูล: คำนำหน้า, ชื่อ-นามสกุล, เลขบัตรประชาชน, เบอร์โทรศัพท์</Step>
          <Step number={4}>เลือก <strong>แผนกวิชา, สาขาวิชา, บทบาท</strong> (ครูที่ปรึกษา / หัวหน้าแผนก / ผู้บริหาร)</Step>
          <Step number={5}>กดปุ่ม <strong>&quot;บันทึก&quot;</strong> — ระบบจะสร้าง Username และรหัสผ่านเริ่มต้นให้โดยอัตโนมัติ</Step>

          <InfoBox>
            Username ของบุคลากรจะถูกสร้างจากชื่อภาษาอังกฤษ เช่น somsak.j
            รหัสผ่านเริ่มต้นสามารถรีเซ็ตได้โดย Admin
          </InfoBox>
        </>
      );

    case "admin-company":
      return (
        <>
          <SectionHeading>จัดการข้อมูลสถานประกอบการ</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            จัดการข้อมูลสถานประกอบการที่รับนักศึกษาเข้าฝึกงาน
          </p>
          <ManualImage src="/images/manual/admin_company.png" alt="จัดการข้อมูลสถานประกอบการ" />

          <SubHeading>ขั้นตอนการเพิ่มสถานประกอบการ</SubHeading>
          <Step number={1}>เข้าเมนู <strong>จัดการ → จัดการข้อมูลสถานประกอบการ</strong></Step>
          <Step number={2}>กดปุ่ม <strong>&quot;+ เพิ่มสถานประกอบการ&quot;</strong></Step>
          <Step number={3}>กรอกข้อมูล: ชื่อสถานประกอบการ, ที่อยู่, ข้อมูลผู้ประสานงาน</Step>
          <Step number={4}>กดปุ่ม <strong>&quot;บันทึก&quot;</strong></Step>
        </>
      );

    case "admin-all-students":
      return (
        <>
          <SectionHeading>รายชื่อนักศึกษาทั้งหมด</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            แสดงรายชื่อนักศึกษาทั้งหมดในระบบ สามารถกรองตามแผนก สาขา และระดับชั้นได้
          </p>
          <ManualImage src="/images/manual/admin_students_all.png" alt="รายชื่อนักศึกษาทั้งหมด" />

          <SubHeading>การใช้งาน</SubHeading>
          <Step number={1}>เข้าเมนู <strong>รายชื่อนักศึกษาทั้งหมด</strong></Step>
          <Step number={2}>ใช้ตัวกรองด้านบนเพื่อ <strong>กรองตามแผนก สาขา หรือระดับชั้น</strong></Step>
          <Step number={3}>ใช้ช่องค้นหาเพื่อค้นหานักศึกษาตาม <strong>ชื่อ</strong> หรือ <strong>รหัสนักศึกษา</strong></Step>
        </>
      );

    case "student-home":
      return (
        <>
          <SectionHeading>หน้าแรก (นักศึกษา)</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            หน้าแรกของนักศึกษา แสดงข้อมูลส่วนตัว สถานะการฝึกงาน และสรุปกิจกรรมล่าสุด
          </p>
          <ManualImage src="/images/manual/student_home.png" alt="หน้าแรกนักศึกษา" />

          <InfoBox>
            นักศึกษาเข้าสู่ระบบด้วย <strong>รหัสนักศึกษา</strong> เป็นชื่อผู้ใช้ และ <strong>วันเดือนปีเกิด (พ.ศ.)</strong> เป็นรหัสผ่านเริ่มต้น เช่น 10042560
          </InfoBox>
        </>
      );

    case "student-report":
      return (
        <>
          <SectionHeading>รายงานการปฏิบัติงานแต่ละวัน</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            นักศึกษาบันทึกกิจกรรมที่ปฏิบัติในแต่ละวัน พร้อมแนบรูปภาพประกอบ
          </p>
          <ManualImage src="/images/manual/student_report.png" alt="รายงานการปฏิบัติงาน" />

          <SubHeading>ขั้นตอนการเพิ่มรายงาน</SubHeading>
          <Step number={1}>เข้าเมนู <strong>รายงานการปฏิบัติงานแต่ละวัน</strong></Step>
          <Step number={2}>กดปุ่ม <strong>&quot;+ เพิ่มรายงาน&quot;</strong></Step>
          <Step number={3}>เลือก <strong>วันที่</strong> ที่ต้องการรายงาน</Step>
          <Step number={4}>กรอก <strong>หัวข้อ</strong> และ <strong>รายละเอียดกิจกรรม</strong> ที่ปฏิบัติ</Step>
          <Step number={5}>แนบ <strong>รูปภาพประกอบ</strong> (ถ้ามี) แล้วกด <strong>&quot;บันทึก&quot;</strong></Step>

          <InfoBox>
            ควรบันทึกรายงานทุกวันที่ฝึกงาน เพื่อให้ข้อมูลครบถ้วนตอนส่งออกรายงาน
          </InfoBox>
        </>
      );

    case "student-company":
      return (
        <>
          <SectionHeading>รายละเอียดการฝึกงาน</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            แสดงข้อมูลสถานประกอบการที่นักศึกษาฝึกงาน รวมถึงวันเริ่มต้น-สิ้นสุดการฝึกงาน
          </p>
          <ManualImage src="/images/manual/student_company.png" alt="รายละเอียดการฝึกงาน" />

          <SubHeading>ข้อมูลที่แสดง</SubHeading>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li><strong>ชื่อสถานประกอบการ</strong> ที่ฝึกงาน</li>
            <li><strong>ที่อยู่</strong> ของสถานประกอบการ</li>
            <li><strong>วันที่เริ่มต้น-สิ้นสุด</strong> การฝึกงาน</li>
            <li><strong>ครูที่ปรึกษา</strong> ที่รับผิดชอบ</li>
          </ul>
        </>
      );

    case "student-export":
      return (
        <>
          <SectionHeading>ส่งออกรายงาน</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-2">
            ส่งออกรายงานการฝึกงานเป็นไฟล์ PDF พร้อมพิมพ์
          </p>
          <ManualImage src="/images/manual/student_export.png" alt="ส่งออกรายงาน" />

          <SubHeading>ขั้นตอนการส่งออก</SubHeading>
          <Step number={1}>เข้าเมนู <strong>ส่งออกรายงาน</strong></Step>
          <Step number={2}>ระบบจะแสดงรายงานทั้งหมดที่พร้อมส่งออก</Step>
          <Step number={3}>กดปุ่ม <strong>&quot;ส่งออก PDF&quot;</strong> เพื่อดาวน์โหลดไฟล์ PDF</Step>
          <Step number={4}>สามารถพิมพ์รายงานจากไฟล์ PDF ที่ดาวน์โหลดมาได้ทันที</Step>
        </>
      );

    case "teacher":
      return (
        <>
          <SectionHeading>ระบบครูที่ปรึกษา</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-4">
            ครูที่ปรึกษาสามารถดูรายชื่อนักศึกษาในความดูแล ติดตามความก้าวหน้า และดูรายงานการฝึกงานของนักศึกษา
          </p>

          <SubHeading>เมนูหลัก</SubHeading>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-4">
            <li><strong>หน้าแรก (นักศึกษาในความดูแล)</strong> — แสดงรายชื่อนักศึกษาที่อยู่ในความรับผิดชอบ</li>
          </ul>

          <SubHeading>การใช้งาน</SubHeading>
          <Step number={1}>เข้าสู่ระบบด้วย Username ของครูที่ปรึกษา</Step>
          <Step number={2}>ระบบจะแสดง <strong>รายชื่อนักศึกษาในความดูแล</strong> โดยอัตโนมัติ</Step>
          <Step number={3}>กดที่ <strong>ชื่อนักศึกษา</strong> เพื่อดูรายละเอียดและรายงานการฝึกงาน</Step>
        </>
      );

    case "department-head":
      return (
        <>
          <SectionHeading>ระบบหัวหน้าแผนก</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-4">
            หัวหน้าแผนกสามารถดูข้อมูลนักศึกษาและบุคลากรในแผนกของตน
          </p>

          <SubHeading>เมนูหลัก</SubHeading>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-4">
            <li><strong>หน้าแรก</strong> — ภาพรวมข้อมูลแผนก</li>
            <li><strong>ข้อมูลบุคคลากร</strong> — รายชื่อครูและอาจารย์ในแผนก</li>
          </ul>

          <SubHeading>การใช้งาน</SubHeading>
          <Step number={1}>เข้าสู่ระบบด้วย Username ของหัวหน้าแผนก</Step>
          <Step number={2}>หน้าแรกจะแสดง <strong>ภาพรวมข้อมูลนักศึกษา</strong> ในแผนก</Step>
          <Step number={3}>เข้าเมนู <strong>ข้อมูลบุคคลากร</strong> เพื่อดูรายชื่อครูในแผนก</Step>
        </>
      );

    case "board":
      return (
        <>
          <SectionHeading>ระบบผู้บริหาร</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-4">
            ผู้บริหารสามารถดูภาพรวมข้อมูลทั้งหมดของระบบ
          </p>

          <SubHeading>เมนูหลัก</SubHeading>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-4">
            <li><strong>หน้าแรก</strong> — ภาพรวมข้อมูลทั้งหมด</li>
            <li><strong>ข้อมูลบุคลากร</strong> — รายชื่อบุคลากรทั้งหมด</li>
            <li><strong>ข้อมูลสถานประกอบการ</strong> — ข้อมูลบริษัทรับนักศึกษาฝึกงาน</li>
            <li><strong>ข้อมูลการนิเทศ</strong> — ประวัติการนิเทศนักศึกษา</li>
          </ul>

          <SubHeading>การใช้งาน</SubHeading>
          <Step number={1}>เข้าสู่ระบบด้วย Username ของผู้บริหาร</Step>
          <Step number={2}>ดูข้อมูลภาพรวมที่หน้าแรก</Step>
          <Step number={3}>เข้าเมนูต่างๆ เพื่อดูรายละเอียดบุคลากร สถานประกอบการ และการนิเทศ</Step>
        </>
      );

    default:
      return null;
  }
}

/* ─── Main Page ─── */
export default function ManualPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#1e293b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Icon icon="tabler:menu-2" height={22} />
            </button>
            <Link href="/signin" className="p-1.5 rounded-lg hover:bg-white/10 text-white hidden lg:block">
              <Icon icon="tabler:chevron-left" height={22} />
            </Link>
            <span className="text-white font-bold text-lg tracking-wide">E-REPORT คู่มือการใช้งาน</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
            >
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed lg:sticky top-[52px] left-0 z-40 h-[calc(100vh-52px)] w-64 bg-[#f0f4f8] border-r border-gray-200 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="py-4">
            {/* Group: ระบบ Admin */}
            <div className="px-4 pt-2 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ทั่วไป</span>
            </div>
            {menuItems.slice(0, 2).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-all ${
                  activeSection === item.id
                    ? "bg-[#1a73a7] text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200/70"
                }`}
              >
                <Icon icon={item.icon} height={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}

            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ผู้ดูแลระบบ</span>
            </div>
            {menuItems.slice(2, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-all ${
                  activeSection === item.id
                    ? "bg-[#1a73a7] text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200/70"
                }`}
              >
                <Icon icon={item.icon} height={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}

            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">นักศึกษา</span>
            </div>
            {menuItems.slice(8, 12).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-all ${
                  activeSection === item.id
                    ? "bg-[#1a73a7] text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200/70"
                }`}
              >
                <Icon icon={item.icon} height={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}

            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">บทบาทอื่นๆ</span>
            </div>
            {menuItems.slice(12).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-all ${
                  activeSection === item.id
                    ? "bg-[#1a73a7] text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200/70"
                }`}
              >
                <Icon icon={item.icon} height={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
            <SectionContent sectionId={activeSection} />

            {/* Footer */}
            <div className="mt-16 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-400 text-xs">
                คู่มือการใช้งานระบบรายงานการฝึกงาน (E-REPORT DVE) — วิทยาลัยอาชีวศึกษาสุพรรณบุรี
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
