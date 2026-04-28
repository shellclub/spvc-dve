import XLSX from 'xlsx';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const downloadsDir = '/Users/shellclub/Downloads';

// Read all relevant xlsx files
const files = [
  'ครูนิเทศก์1-69.xlsx',
  'ปวส1-2เทคโนโลยีธุรกิจดิจิทัล.xlsx',
  'ปวส1การจัดการธุรกิจค้าปลีก.xlsx',
  'ปวส1การตลาด.xlsx',
  'ปวส1การท่องเที่ยว.xlsx',
  'ปวส1การโรงแรม.xlsx',
];

for (const file of files) {
  const filePath = join(downloadsDir, file);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📁 File: ${file}`);
  console.log('='.repeat(60));
  
  try {
    const workbook = XLSX.readFile(filePath);
    
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📋 Sheet: "${sheetName}"`);
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      // Show first 30 rows with nice formatting
      const maxRows = Math.min(data.length, 30);
      for (let i = 0; i < maxRows; i++) {
        const row = data[i];
        if (row && row.some(cell => cell !== '')) {
          console.log(`Row ${i}: ${JSON.stringify(row)}`);
        }
      }
      console.log(`... Total rows: ${data.length}`);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}
