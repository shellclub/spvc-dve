export function validateThaiID(id: string) {
    // ตรวจสอบว่า id เป็น string และมี 13 หลักหรือไม่
    if (typeof id !== 'string' || id.length !== 13 || !/^\d+$/.test(id)) {
      return false;
    }
  
    // คำนวณตามสูตร
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id[i]) * (13 - i);
    }
  
    const checkDigit = (11 - (sum % 11)) % 10;
  
    // เปรียบเทียบกับหลักที่ 13
    return checkDigit === parseInt(id[12]);
  }