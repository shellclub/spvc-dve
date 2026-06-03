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

/**
 * แปลงวันที่จากฟอร์มรายงานฝึกงานเป็น Date
 * รองรับ YYYY-MM-DD (ThaiDatePicker) และรูปแบบเก่า "2 มิถุนายน 2569"
 */
export function parseReportDate(dateStr: string): Date {
  const trimmed = dateStr?.trim();
  if (!trimmed) {
    throw new Error("Invalid report date");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = dayjs(trimmed, DATE_VALUE_FORMAT, true);
    if (!parsed.isValid()) {
      throw new Error("Invalid report date");
    }
    return parsed.toDate();
  }

  const thaiMonths: Record<string, number> = {
    มกราคม: 0,
    กุมภาพันธ์: 1,
    มีนาคม: 2,
    เมษายน: 3,
    พฤษภาคม: 4,
    มิถุนายน: 5,
    กรกฎาคม: 6,
    สิงหาคม: 7,
    กันยายน: 8,
    ตุลาคม: 9,
    พฤศจิกายน: 10,
    ธันวาคม: 11,
  };

  const [dayStr, monthThai, yearThaiStr] = trimmed.split(" ");
  const day = parseInt(dayStr, 10);
  const month = thaiMonths[monthThai];
  const yearAD = parseInt(yearThaiStr, 10) - 543;

  if (!day || month === undefined || !yearAD) {
    throw new Error("Invalid report date");
  }

  const parsed = dayjs(new Date(yearAD, month, day));
  if (!parsed.isValid()) {
    throw new Error("Invalid report date");
  }
  return parsed.toDate();
}
