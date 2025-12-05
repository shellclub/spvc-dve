export function formatThaiDateFixed(dateInput: string | Date): string {
    if (!dateInput) return "Invalid date";
  
    let d: Date;
  
    if (typeof dateInput === "string") {
      // กรณีเป็นรูปแบบ 01/01/2555 → แปลงก่อน
      const parts = dateInput.split("/");
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
  
        // ถ้าเป็นปี พ.ศ. ให้แปลงเป็น ค.ศ.
        const christianYear = year > 2500 ? year - 543 : year;
        d = new Date(christianYear, month, day);
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = dateInput;
    }
  
    if (isNaN(d.getTime())) return "Invalid date";
  
    // ใช้ getUTC* methods เพื่อดึงค่าจาก UTC timezone
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear() + 543;
  
    return `${day}/${month}/${year}`;
}