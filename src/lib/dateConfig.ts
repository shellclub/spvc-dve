/**
 * ตั้งค่า locale วันที่เป็นภาษาไทยทั้งระบบ
 * ฐานข้อมูลยังใช้รูปแบบสากล (ISO/Date) ได้ตามเดิม
 */
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

export const DATE_DISPLAY_FORMAT = "DD/MM/YYYY";
export const DATE_VALUE_FORMAT = "YYYY-MM-DD"; // สำหรับ value ใน form / API
