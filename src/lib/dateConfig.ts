/**
 * ตั้งค่า locale วันที่เป็นภาษาไทยทั้งระบบ
 * ฐานข้อมูลยังใช้รูปแบบสากล (ISO/Date) ได้ตามเดิม
 */
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.locale("th");
dayjs.extend(buddhistEra);

// แสดงวันที่เป็น พ.ศ. (ปีพุทธศักราช)
// BBBB = ปี พ.ศ. 4 หลัก (เช่น 2549)
export const DATE_DISPLAY_FORMAT = "DD/MM/BBBB";
export const DATE_VALUE_FORMAT = "YYYY-MM-DD"; // สำหรับ value ใน form / API (ยังเป็น ค.ศ.)

/**
 * แปลง Date → ข้อความ พ.ศ. เช่น "06/06/2549"
 */
export function formatThaiDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dayjs(date).format(DATE_DISPLAY_FORMAT);
}

/**
 * แปลง Date → ข้อความยาว พ.ศ. เช่น "6 มิถุนายน 2549"
 */
export function formatThaiDateLong(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dayjs(date).format("D MMMM BBBB");
}
