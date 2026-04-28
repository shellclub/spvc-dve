import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join } from 'path';

const downloadsDir = '/Users/shellclub/Downloads';
const bcryptHash = '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG'; // 123456

// ==========================================
// 1. Read teacher data
// ==========================================
const teacherWb = XLSX.readFile(join(downloadsDir, 'ครูนิเทศก์1-69.xlsx'));
const teacherData = XLSX.utils.sheet_to_json(teacherWb.Sheets[teacherWb.SheetNames[0]], { header: 1, defval: '' });

// Extract unique teachers
const teacherSet = new Map();
for (let i = 1; i < teacherData.length; i++) {
  const row = teacherData[i];
  const firstName = String(row[3] || '').trim();
  const lastName = String(row[4] || '').trim();
  if (firstName && lastName && firstName !== '' && !firstName.startsWith('Miss')) {
    // Extract clean name (remove prefix like นาง, นาย, นางสาว)
    let cleanFirst = firstName;
    let prefix = '';
    if (cleanFirst.startsWith('นางสาว')) { prefix = 'นางสาว'; cleanFirst = cleanFirst.replace('นางสาว', '').trim(); }
    else if (cleanFirst.startsWith('นาง')) { prefix = 'นาง'; cleanFirst = cleanFirst.replace('นาง', '').trim(); }
    else if (cleanFirst.startsWith('นาย')) { prefix = 'นาย'; cleanFirst = cleanFirst.replace('นาย', '').trim(); }
    
    if (cleanFirst && !teacherSet.has(cleanFirst + ' ' + lastName)) {
      const sex = prefix === 'นาย' ? 1 : 0;
      teacherSet.set(cleanFirst + ' ' + lastName, { prefix, firstName: cleanFirst, lastName, sex });
    }
  }
}
// Also add Miss Argie
teacherSet.set('Argie Picao', { prefix: 'Miss', firstName: 'Argie', lastName: 'Picao', sex: 0 });

console.log(`Found ${teacherSet.size} unique teachers`);

// ==========================================
// 2. Read student data from all files
// ==========================================
const studentFiles = [
  { file: 'ปวส1-2เทคโนโลยีธุรกิจดิจิทัล.xlsx', dept: 'แผนกเทคโนโลยีธุรกิจดิจิทัล', major: 'สาขาเทคโนโลยีธุรกิจดิจิทัล' },
  { file: 'ปวส1การจัดการธุรกิจค้าปลีก.xlsx', dept: 'แผนกการจัดการธุรกิจค้าปลีก', major: 'สาขาการจัดการธุรกิจค้าปลีก' },
  { file: 'ปวส1การตลาด.xlsx', dept: 'แผนกการตลาด', major: 'สาขาการตลาด' },
  { file: 'ปวส1การท่องเที่ยว.xlsx', dept: 'แผนกการท่องเที่ยว', major: 'สาขาการท่องเที่ยว' },
  { file: 'ปวส1การโรงแรม.xlsx', dept: 'แผนกการโรงแรม', major: 'สาขาการโรงแรม' },
];

const allStudents = [];
for (const sf of studentFiles) {
  const wb = XLSX.readFile(join(downloadsDir, sf.file));
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
  
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row[2]) continue; // skip empty rows
    
    const citizenId = String(row[1]).trim();
    const studentId = String(row[2]).trim();
    const prefix = String(row[5]).trim();
    const firstName = String(row[6]).trim();
    const lastName = String(row[7]).trim();
    const sex = prefix === 'นาย' ? 1 : 0;
    const classGroup = String(row[4]).trim(); // ปวส.1/1
    
    if (firstName && lastName && citizenId.length === 13) {
      allStudents.push({
        citizenId, studentId, firstName, lastName, sex, prefix,
        dept: sf.dept, major: sf.major, classGroup
      });
    }
  }
}

console.log(`Found ${allStudents.length} students`);

// ==========================================
// 3. Generate SQL
// ==========================================
let sql = `-- ============================================
-- Demo Data Import from Excel Files
-- Generated: ${new Date().toISOString().slice(0, 19)}
-- Password for all accounts: 123456
-- ============================================

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Clean existing demo data (keep Admin + Board)
-- ============================================
DELETE FROM logins WHERE username NOT IN ('Admin', 'board01', 'board02', 'board03', 'board04', 'board05');
DELETE FROM students;
DELETE FROM Teacher;
DELETE FROM users WHERE role NOT IN (1, 2);
DELETE FROM major;
DELETE FROM departments;

-- ============================================
-- Departments (แผนก)
-- ============================================
`;

// Collect unique departments
const deptMap = new Map();
deptMap.set('แผนกเทคโนโลยีสารสนเทศ', { id: 1, majors: ['สาขาเทคโนโลยีสารสนเทศ'] });

let deptId = 2;
for (const sf of studentFiles) {
  if (!deptMap.has(sf.dept)) {
    deptMap.set(sf.dept, { id: deptId++, majors: [sf.major] });
  }
}

for (const [name, info] of deptMap) {
  sql += `INSERT INTO departments (id, depname, create_at, update_at) VALUES (${info.id}, '${name}', NOW(), NOW());\n`;
}

// ============================================
// Majors
// ============================================
sql += `\n-- ============================================\n-- Majors (สาขาวิชา)\n-- ============================================\n`;

let majorId = 1;
const majorMap = new Map();
for (const [deptName, info] of deptMap) {
  for (const mName of info.majors) {
    majorMap.set(mName, { id: majorId, deptId: info.id });
    sql += `INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (${majorId}, '${mName}', ${info.id}, NOW(), NOW());\n`;
    majorId++;
  }
}

// ============================================
// Teachers
// ============================================
sql += `\n-- ============================================\n-- Teachers (ครู) - Role 4\n-- ============================================\n`;

let userId = 100; // Start teachers at 100
let teacherIndex = 1;
const teacherIdMap = new Map();
for (const [fullName, t] of teacherSet) {
  const phone = `08${String(teacherIndex).padStart(8, '0')}`;
  const citizenId = `1720000${String(teacherIndex).padStart(6, '0')}`;
  const username = `teacher${String(teacherIndex).padStart(2, '0')}`;
  
  sql += `INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (${userId}, '${t.firstName}', '${t.lastName}', '${citizenId}', '${phone}', 4, ${t.sex}, '${t.prefix}');\n`;
  sql += `INSERT INTO logins (username, password, userId, is_first_login) VALUES ('${username}', '${bcryptHash}', ${userId}, 0);\n`;
  
  teacherIdMap.set(fullName, userId);
  userId++;
  teacherIndex++;
}

// ============================================
// Students
// ============================================
sql += `\n-- ============================================\n-- Students (นักเรียน) - Role 7\n-- ============================================\n`;

userId = 200; // Start students at 200
for (const s of allStudents) {
  const phone = `09${String(userId).padStart(8, '0')}`;
  const deptInfo = deptMap.get(s.dept);
  const majorInfo = majorMap.get(s.major);
  
  // Parse class group to get grade level
  const gradeLevel = s.classGroup.includes('2') ? 'ปี 2' : 'ปี 1'; 
  const room = s.classGroup; // ปวส.1/1
  
  sql += `\n-- ${s.prefix} ${s.firstName} ${s.lastName} (${s.studentId})\n`;
  sql += `INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (${userId}, '${s.firstName}', '${s.lastName}', '${s.citizenId}', '${phone}', 7, ${s.sex}, '${s.prefix}');\n`;
  sql += `INSERT INTO logins (username, password, userId, is_first_login) VALUES ('${s.studentId}', '${bcryptHash}', ${userId}, 0);\n`;
  sql += `INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('${s.studentId}', ${userId}, 1, '2568', 1, '1', '${room}', '${gradeLevel}', ${deptInfo?.id || 1}, ${majorInfo?.id || 1});\n`;
  
  userId++;
}

sql += `\n-- Re-enable foreign key checks\nSET FOREIGN_KEY_CHECKS = 1;\n`;
sql += `\n-- ============================================\n-- Summary\n-- ============================================\n`;
sql += `-- Departments: ${deptMap.size}\n`;
sql += `-- Majors: ${majorMap.size}\n`;
sql += `-- Teachers: ${teacherSet.size}\n`;
sql += `-- Students: ${allStudents.length}\n`;
sql += `-- Total users added: ${teacherSet.size + allStudents.length}\n`;

// Write SQL file
const outputPath = '/Users/shellclub/Desktop/spvc-dve/spvc-internship/import-demo-data.sql';
writeFileSync(outputPath, sql, 'utf8');
console.log(`\nSQL written to: ${outputPath}`);
console.log(`Departments: ${deptMap.size}`);
console.log(`Majors: ${majorMap.size}`);
console.log(`Teachers: ${teacherSet.size}`);
console.log(`Students: ${allStudents.length}`);

// Print teacher list
console.log('\n--- Teacher accounts ---');
let ti = 1;
for (const [name, t] of teacherSet) {
  console.log(`teacher${String(ti).padStart(2, '0')}: ${t.prefix} ${t.firstName} ${t.lastName}`);
  ti++;
}

// Print student summary by dept 
console.log('\n--- Students by Department ---');
const deptCount = {};
for (const s of allStudents) {
  deptCount[s.dept] = (deptCount[s.dept] || 0) + 1;
}
for (const [d, c] of Object.entries(deptCount)) {
  console.log(`${d}: ${c} students`);
}
