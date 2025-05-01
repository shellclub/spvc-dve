import dayjs from 'dayjs';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(customParseFormat);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function userRole(role: number) {
  let roleName  = "นักศึกษา";

  if(role === 1) roleName = "ผู้ดูแลระบบ";

  if(role === 2) roleName = "ผู้ดูแลแผนกวิชา";

  return roleName;  
}

export function userSex(sex: number) {
  let sexName;
  if(sex === 1) sexName = "ชาย"; 
  if(sex === 2) sexName = "หญิง";
  
  return sexName;
}

export function maskCitizenId(id: string): string {
  // ตรวจสอบความยาวก่อน
  if (id.length !== 13) return id;

  return '******' + id.slice(9);
}

export function excelSerialToDate(serial: number): Date {
  return dayjs('1899-12-30').add(serial, 'day').toDate();
}



 export const formatThaiDate = (dateString: string) => {
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]
  const date = dayjs(dateString)
  const day = date.date()
  const month = thaiMonthsShort[date.month()] // month() returns 0-11
  const year = date.year() + 543 // Convert to Buddhist year

  return `${day}/${month}/${year}`
}

export function convertThaiDateToEnglishFormat(thaiDate: string) {
  // แยกข้อมูลออกมา
  const thaiMonths: { [key: string]: number } = {
    'มกราคม': 0,
    'กุมภาพันธ์': 1,
    'มีนาคม': 2,
    'เมษายน': 3,
    'พฤษภาคม': 4,
    'มิถุนายน': 5,
    'กรกฎาคม': 6,
    'สิงหาคม': 7,
    'กันยายน': 8,
    'ตุลาคม': 9,
    'พฤศจิกายน': 10,
    'ธันวาคม': 11,
  };
  const [dayStr, monthThai, yearThaiStr] = thaiDate.split(' ');
  const day = parseInt(dayStr, 10);
  const month = thaiMonths[monthThai];
  const yearBE = parseInt(yearThaiStr, 10);
  
  // แปลง พ.ศ. เป็น ค.ศ.
  const yearAD = yearBE - 543;

  // สร้างวันที่ใหม่
  const date = new Date(yearAD, month, day);

  // ใช้ dayjs เพื่อ format เป็นภาษาอังกฤษ
  return dayjs(date).locale('en').format('MMMM D, YYYY');
}