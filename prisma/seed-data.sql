-- ============================================================
-- Seed ข้อมูลทดสอบ: ครอบคลุมทุกเมนูและทุก Role
-- Run: mysql -u spvc -pspvc2025 -h 127.0.0.1 --default-character-set=utf8mb4 db_dvt_prod < prisma/seed-data.sql
-- ============================================================
-- Roles:
--   1 = ผู้ดูแลระบบ (Admin)
--   2 = ผู้บริหาร (Board)
--   3 = หัวหน้าแผนก (Department Head)
--   4 = ครูที่ปรึกษา (Teacher)
--   5 = ครูทวิภาคี (Supervision Teacher)
--   7 = นักศึกษา (Student)
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
SET @now = NOW();
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 0. Cleanup (ลบข้อมูลเก่าทั้งหมด)
-- ============================================
DELETE FROM supervisions;
DELETE FROM student_companies;
DELETE FROM teacher_classrooms;
DELETE FROM internship_report;
DELETE FROM inturnship;
DELETE FROM students;
DELETE FROM Teacher;
DELETE FROM companies;
DELETE FROM logins;
DELETE FROM users;
DELETE FROM major;
DELETE FROM departments;
DELETE FROM education_levels;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. Education Levels
-- ============================================
INSERT INTO education_levels (id, name) VALUES (1, 'ปวช.'), (2, 'ปวส.');

-- ============================================
-- 2. Departments + Majors
-- ============================================
INSERT INTO departments (id, depname, create_at, update_at) VALUES
  (1, 'แผนกวิชาการบัญชี', @now, @now),
  (2, 'แผนกวิชาการเลขานุการ', @now, @now),
  (3, 'แผนกวิชาการตลาด', @now, @now),
  (4, 'แผนกวิชาคอมพิวเตอร์ธุรกิจและเทคโนโลยีธุรกิจดิจิทัล', @now, @now),
  (5, 'แผนกวิชาคอมพิวเตอร์โปรแกรมเมอร์', @now, @now),
  (6, 'แผนกวิชาคอมพิวเตอร์กราฟิก', @now, @now),
  (7, 'แผนกวิชาการออกแบบ', @now, @now),
  (8, 'แผนกวิชาการโรงแรม', @now, @now),
  (9, 'แผนกวิชาการท่องเที่ยว', @now, @now),
  (10, 'แผนกวิชาอาหารและโภชนาการ', @now, @now),
  (11, 'แผนกวิชาผ้าและสื่อสิ่งทอ', @now, @now),
  (12, 'แผนกวิชาคหกรรม', @now, @now),
  (13, 'แผนกวิชาธุรกิจค้าปลีก', @now, @now);

INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES
  (1, 'สาขาเทคโนโลยีสารสนเทศ', 1, @now, @now),
  (2, 'สาขาเครือข่ายคอมพิวเตอร์', 1, @now, @now),
  (3, 'สาขาไฟฟ้ากำลัง', 2, @now, @now),
  (4, 'สาขาการบัญชี', 3, @now, @now);

-- ============================================
-- 3. Admin (role=1) — Username: Admin / Password: 123456
-- ============================================
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (1, 'Admin', 'ระบบ', '1103702589654', '0987654321', 1, 1, '1985-06-15');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('Admin', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 1, 0);

-- ============================================
-- 4. Board / ผู้บริหาร (role=2)
--    ตำแหน่ง: ผอ. + 4 รอง ผอ.
-- ============================================
-- 4.1 ผู้อำนวยการวิทยาลัย — Username: board01 / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (2, 'ทรงวุฒิ', 'เรือนไทย', '1100700200001', '0891111111', 2, 1, '1970-03-20');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('board01', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 2, 0);

-- 4.2 รองผู้อำนวยการวิทยาลัย — Username: board02 / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (19, 'ศุภชัย', 'นนท์ธีระวิชยา', '1100700200019', '0892222201', 2, 1, '1972-05-10');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('board02', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 19, 0);

-- 4.3 รองผู้อำนวยการวิทยาลัย — Username: board03 / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (20, 'กนกวรรณ', 'ส่งสมบูรณ์', '1100700200020', '0892222202', 2, 0, '1975-08-22');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('board03', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 20, 0);

-- 4.4 รองผู้อำนวยการวิทยาลัย — Username: board04 / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (21, 'สุรเชษฐ์', 'แก้วปาน', '1100700200021', '0892222203', 2, 1, '1973-11-15');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('board04', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 21, 0);

-- 4.5 รองผู้อำนวยการวิทยาลัย — Username: board05 / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (22, 'เจนศักดิ์', 'แสงคำเฉลียง', '1100700200022', '0892222204', 2, 1, '1974-02-28');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('board05', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 22, 0);

-- ============================================
-- 5. Department Heads / หัวหน้าแผนก (role=3)
-- ============================================
-- หัวหน้าแผนก IT — Username: head.it / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (3, 'วิชัย', 'เจริญทรัพย์', '1100700200002', '0892222222', 3, 1, '1975-08-10');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('head.it', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 3, 0);
INSERT INTO Teacher (userId, departmentId, majorId) VALUES (3, 1, 1);

-- หัวหน้าแผนกไฟฟ้า — Username: head.elec / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (4, 'สุวัฒน์', 'ทองเกิด', '1100700200003', '0893333333', 3, 1, '1972-11-25');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('head.elec', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 4, 0);
INSERT INTO Teacher (userId, departmentId, majorId) VALUES (4, 2, 3);

-- ============================================
-- 6. Teachers / ครูที่ปรึกษา (role=4)
-- ============================================
-- อ.สมศักดิ์ — Username: somsak.j / Password: 0891234567
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (5, 'สมศักดิ์', 'ใจดี', '3100501234567', '0891234567', 4, 1);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('somsak.j', '$2b$10$q72zluR8sJWQ63wshy7mdeCPrtKke7Lr.A1hzsvV2N1iHxXOT..Yi', 5, 0);
INSERT INTO Teacher (userId, departmentId, majorId) VALUES (5, 1, 1);

-- อ.วิภาวดี — Username: wipawadee.s / Password: 0867654321
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (6, 'วิภาวดี', 'สุขสันต์', '3100501234568', '0867654321', 4, 2);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('wipawadee.s', '$2b$10$Et2JwDrsgB3bL72WC9it1.9HZpUdzH23GXBkTZOE0LIiHy9UBzDKK', 6, 0);
INSERT INTO Teacher (userId, departmentId, majorId) VALUES (6, 1, 2);

-- ============================================
-- 7. Supervision Teachers / ครูทวิภาคี (role=5)
-- ============================================
-- อ.ประสิทธิ์ — Username: prasit.c / Password: 0923456789
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (7, 'ประสิทธิ์', 'เจริญสุข', '3100501234569', '0923456789', 5, 1);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('prasit.c', '$2b$10$1Mjl2fPTwXSDCP8wQ5oLAeVuZbY4yDJKg5zkQu1g5Ft53LlXWxC8.', 7, 0);
INSERT INTO Teacher (userId, departmentId, majorId) VALUES (7, 1, 1);

-- อ.อรุณี — Username: arunee.p / Password: 123456
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (8, 'อรุณี', 'ประเสริฐ', '3100501234570', '0945678901', 5, 2);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('arunee.p', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 8, 0);
INSERT INTO Teacher (userId, departmentId, majorId) VALUES (8, 2, 3);

-- ============================================
-- 8. Companies / สถานประกอบการ (role=6 user + company record)
-- ============================================
-- บริษัท สุพรรณบุรี เทค จำกัด
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (9, 'สุพรรณเทค', 'บริษัท', '1234567890001', '0341234567', 6, 1);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('company01', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 9, 0);
INSERT INTO companies (id, name, address, userId)
VALUES (1, 'บริษัท สุพรรณบุรี เทค จำกัด', '123/45 ถ.มาลัยแมน ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 9);

-- ร้าน คอมพ์พลัส สุพรรณ
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (10, 'คอมพ์พลัส', 'ร้าน', '1234567890002', '0349876543', 6, 1);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('company02', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 10, 0);
INSERT INTO companies (id, name, address, userId)
VALUES (2, 'ร้าน คอมพ์พลัส สุพรรณ', '789 ถ.พระพันวษา ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 10);

-- บริษัท ไฟฟ้าสุพรรณ จำกัด
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex)
VALUES (11, 'ไฟฟ้าสุพรรณ', 'บริษัท', '1234567890003', '0341112222', 6, 1);
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('company03', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 11, 0);
INSERT INTO companies (id, name, address, userId)
VALUES (3, 'บริษัท ไฟฟ้าสุพรรณ จำกัด', '456 หมู่ 3 ต.สนามชัย อ.เมือง จ.สุพรรณบุรี 72000', 11);

-- ============================================
-- 9. Students / นักศึกษา (role=7)
-- ============================================
-- รหัสผ่านของนักศึกษา = วันเกิดแบบ ddmmyyyy (ปี พ.ศ.)

-- นายธนวัฒน์ สุขใจ (68201010001 / 10042560)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (12, 'ธนวัฒน์', 'สุขใจ', '1100700100001', '0812345001', 7, 1, '2017-04-10');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68201010001', '$2b$10$9s2uHm5m6EUnGaVuhRAmjuiM3VjrEA7Y.c2gHL6cx/gMHUopy88aS', 12, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68201010001', 12, 1, 1, '2568', '1', '1', 1, 'ปวช.1');

-- นางสาวสุภาพร แก้วมณี (68201010002 / 25122559)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (13, 'สุภาพร', 'แก้วมณี', '1100700100002', '0812345002', 7, 2, '2016-12-25');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68201010002', '$2b$10$0mRe0wFy3lyhhL3xWWlCq.JBkNsdpwmA5jKnP4man2AVL4TmnY4P6', 13, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68201010002', 13, 1, 1, '2568', '1', '1', 1, 'ปวช.1');

-- นายพีรพัฒน์ มั่นคง (68201010003 / 01012560)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (14, 'พีรพัฒน์', 'มั่นคง', '1100700100003', '0812345003', 7, 1, '2017-01-01');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68201010003', '$2b$10$lVG1gMk9ZORh1Cic89oZ6e4QL.K9UsI.EfjhSNTKomogFrzV1HsE6', 14, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68201010003', 14, 1, 2, '2568', '1', '1', 1, 'ปวช.1');

-- นางสาวปิยะดา รุ่งเรือง (68201010004 / 15082560)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (15, 'ปิยะดา', 'รุ่งเรือง', '1100700100004', '0812345004', 7, 2, '2017-08-15');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68201010004', '$2b$10$b.gaERt4LxNBgSfsgUNVWemVn9f1xPVDR5uoi4JI3XbG3l8hNf1Oi', 15, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68201010004', 15, 1, 1, '2568', '1', '1', 1, 'ปวช.1');

-- นายวรเมธ ศรีสว่าง (68201010005 / 30062559)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (16, 'วรเมธ', 'ศรีสว่าง', '1100700100005', '0812345005', 7, 1, '2016-06-30');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68201010005', '$2b$10$v1lY83irQrNpggGYpm1MYuoBauBG4O7T8CZ7Fd8txXXv07QMwnOn2', 16, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68201010005', 16, 2, 1, '2568', '1', '2', 1, 'ปวส.1');

-- นักศึกษาแผนกไฟฟ้า
-- นายสมชาย แรงดี (68202010001 / 123456)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (17, 'สมชาย', 'แรงดี', '1100700100006', '0812345006', 7, 1, '2017-05-20');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68202010001', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 17, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68202010001', 17, 1, 3, '2568', '1', '1', 2, 'ปวช.1');

-- นางสาวจิราภา ส่องแสง (68202010002 / 123456)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (18, 'จิราภา', 'ส่องแสง', '1100700100007', '0812345007', 7, 2, '2017-09-12');
INSERT INTO logins (username, password, userId, is_first_login)
VALUES ('68202010002', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 18, 0);
INSERT INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel)
VALUES ('68202010002', 18, 1, 3, '2568', '1', '1', 2, 'ปวช.1');

-- ============================================
-- 10. Resolve auto-increment IDs
-- ============================================
SET @std1 = (SELECT id FROM students WHERE studentId = '68201010001');
SET @std2 = (SELECT id FROM students WHERE studentId = '68201010002');
SET @std3 = (SELECT id FROM students WHERE studentId = '68201010003');
SET @std4 = (SELECT id FROM students WHERE studentId = '68201010004');
SET @std5 = (SELECT id FROM students WHERE studentId = '68201010005');
SET @std6 = (SELECT id FROM students WHERE studentId = '68202010001');
SET @std7 = (SELECT id FROM students WHERE studentId = '68202010002');

SET @teacher_somsak = (SELECT id FROM Teacher WHERE userId = 5);
SET @teacher_wipawadee = (SELECT id FROM Teacher WHERE userId = 6);
SET @teacher_prasit = (SELECT id FROM Teacher WHERE userId = 7);
SET @teacher_arunee = (SELECT id FROM Teacher WHERE userId = 8);

-- ============================================
-- 11. Student-Company Assignments (จับคู่นักศึกษา-สถานประกอบการ)
-- ============================================
INSERT INTO student_companies (studentId, companyId, startDate, endDate) VALUES
  (@std1, 1, '2026-01-06', '2026-05-30'),
  (@std2, 1, '2026-01-06', '2026-05-30'),
  (@std3, 2, '2026-01-06', '2026-05-30'),
  (@std4, 2, '2026-01-06', '2026-05-30'),
  (@std5, 1, '2026-01-06', '2026-05-30');
INSERT INTO student_companies (studentId, companyId, startDate, endDate) VALUES
  (@std6, 3, '2026-01-06', '2026-05-30'),
  (@std7, 3, '2026-01-06', '2026-05-30');

-- ============================================
-- 12. Inturnship (ตั้งค่าวันฝึกงาน)
-- ============================================
INSERT INTO inturnship (studentId, selectedDays, dayperweeks) VALUES
  (@std1, '["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"]', '5'),
  (@std2, '["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"]', '5'),
  (@std3, '["จันทร์","อังคาร","พุธ","พฤหัสบดี"]', '4'),
  (@std4, '["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"]', '5'),
  (@std5, '["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"]', '5'),
  (@std6, '["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"]', '5'),
  (@std7, '["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์"]', '5');

-- ============================================
-- 13. Internship Reports (รายงานฝึกงานรายวัน)
-- ============================================
INSERT INTO internship_report (studentId, title, description, reportDate) VALUES
  (@std1, 'ติดตั้งระบบปฏิบัติการ Windows', 'ติดตั้ง Windows 11 ให้กับเครื่องคอมพิวเตอร์ใหม่ จำนวน 3 เครื่อง พร้อมติดตั้งไดรเวอร์และโปรแกรมพื้นฐาน', '2026-04-21'),
  (@std1, 'เดินสาย LAN ชั้น 2', 'เดินสาย LAN Cat6 จากห้อง Server ไปยังห้องทำงานชั้น 2 จำนวน 8 จุด พร้อมเข้าหัว RJ45 และทดสอบสัญญาณ', '2026-04-22'),
  (@std1, 'ซ่อมคอมพิวเตอร์ลูกค้า', 'ตรวจสอบและซ่อมเครื่องคอมพิวเตอร์ที่มีปัญหา Blue Screen จำนวน 2 เครื่อง พบว่าเกิดจาก RAM เสีย', '2026-04-23'),
  (@std1, 'ติดตั้งกล้องวงจรปิด', 'ช่วยพี่เลี้ยงติดตั้งกล้อง IP Camera จำนวน 4 ตัว พร้อมตั้งค่า NVR และทดสอบการดูผ่านมือถือ', '2026-04-24'),
  (@std1, 'ประกอบคอมพิวเตอร์ใหม่', 'ประกอบเครื่องคอมพิวเตอร์ตามสเปคที่ลูกค้าสั่ง 2 เครื่อง พร้อม Benchmark ทดสอบประสิทธิภาพ', '2026-04-25');

INSERT INTO internship_report (studentId, title, description, reportDate) VALUES
  (@std2, 'ศึกษาระบบเครือข่าย', 'เรียนรู้โครงสร้างระบบเครือข่ายภายในบริษัท ได้ศึกษา VLAN, Firewall, และ VPN', '2026-04-21'),
  (@std2, 'สำรองข้อมูล Server', 'ทำ Backup ข้อมูลบน File Server ลง NAS โดยใช้สคริปต์อัตโนมัติ ตรวจสอบ Log backup', '2026-04-22'),
  (@std2, 'ดูแลระบบ Email', 'ตรวจสอบ Spam filter, สร้าง email account ใหม่ให้พนักงาน 5 คน และตั้งค่า Outlook', '2026-04-23');

INSERT INTO internship_report (studentId, title, description, reportDate) VALUES
  (@std3, 'ซ่อม Notebook ลูกค้า', 'เปลี่ยนจอ LCD Notebook ที่แตก พร้อมล้าง Windows ใหม่ ติดตั้งโปรแกรมตามที่ลูกค้าต้องการ', '2026-04-21'),
  (@std3, 'อัพเกรด SSD', 'เปลี่ยน HDD เป็น SSD ให้เครื่องลูกค้า 4 เครื่อง พร้อม Clone ข้อมูลและทดสอบความเร็ว', '2026-04-22');

INSERT INTO internship_report (studentId, title, description, reportDate) VALUES
  (@std6, 'ตรวจสอบระบบไฟฟ้า', 'ตรวจสอบระบบไฟฟ้าภายในอาคาร ตรวจเช็คตู้ MDB และ DB ทุกชั้น เช็คแรงดัน กระแส', '2026-04-21'),
  (@std6, 'ซ่อมแซมระบบไฟฟ้า', 'เปลี่ยนเบรกเกอร์ที่เสียหาย 3 ตัว และเปลี่ยนสายไฟที่ชำรุดในห้องเครื่องจักร', '2026-04-22'),
  (@std6, 'ติดตั้งหลอดไฟ LED', 'เปลี่ยนหลอดไฟ Fluorescent เป็น LED จำนวน 20 ดวง เพื่อประหยัดพลังงาน', '2026-04-23');

-- ============================================
-- 14. Teacher-Classroom (ครูดูแลนักศึกษา)
-- ============================================
-- อ.สมศักดิ์ ดูแลนักศึกษา 3 คน (ธนวัฒน์ สุภาพร ปิยะดา)
INSERT INTO teacher_classrooms (teacherId, studentId) VALUES
  (@teacher_somsak, @std1),
  (@teacher_somsak, @std2),
  (@teacher_somsak, @std4);

-- อ.วิภาวดี ดูแลนักศึกษา 2 คน (พีรพัฒน์ วรเมธ)
INSERT INTO teacher_classrooms (teacherId, studentId) VALUES
  (@teacher_wipawadee, @std3),
  (@teacher_wipawadee, @std5);

-- อ.อรุณี ดูแลนักศึกษาไฟฟ้า 2 คน
INSERT INTO teacher_classrooms (teacherId, studentId) VALUES
  (@teacher_arunee, @std6),
  (@teacher_arunee, @std7);

-- ============================================
-- 14. Supervisions (บันทึกการนิเทศ)
-- ============================================
-- อ.ประสิทธิ์ (ครูทวิภาคี) ไปนิเทศที่บริษัท
INSERT INTO supervisions (studentId, companyId, teacherId, supervisionDate, notes, type) VALUES
  (@std1, 1, @teacher_prasit, '2026-03-15', 'นักศึกษาปฏิบัติงานได้ดี มีความตั้งใจ ทำงานตรงเวลา พี่เลี้ยงชื่นชมในเรื่องความรับผิดชอบ', 'ON_SITE'),
  (@std2, 1, @teacher_prasit, '2026-03-15', 'นักศึกษามีพัฒนาการดี สามารถทำงานด้านเครือข่ายเบื้องต้นได้ ควรเพิ่มทักษะด้าน Security', 'ON_SITE'),
  (@std3, 2, @teacher_prasit, '2026-03-20', 'นักศึกษาปฏิบัติงานได้ดี มีปัญหาเรื่องการมาสาย ได้ตักเตือนแล้ว', 'ON_SITE'),
  (@std1, 1, @teacher_prasit, '2026-04-10', 'นิเทศครั้งที่ 2 นักศึกษาพัฒนาทักษะได้มากขึ้น สามารถแก้ปัญหาคอมพิวเตอร์เบื้องต้นได้เอง', 'ONLINE');

-- อ.อรุณี นิเทศนักศึกษาไฟฟ้า
INSERT INTO supervisions (studentId, companyId, teacherId, supervisionDate, notes, type) VALUES
  (@std6, 3, @teacher_arunee, '2026-03-18', 'นักศึกษาปฏิบัติงานได้ตามมาตรฐานความปลอดภัย ใช้อุปกรณ์ PPE ครบถ้วน', 'ON_SITE'),
  (@std7, 3, @teacher_arunee, '2026-03-18', 'นักศึกษาสนใจเรียนรู้ มีทักษะในการอ่านแบบไฟฟ้าดี ควรฝึกเรื่องงานเดินท่อเพิ่มเติม', 'ON_SITE');

-- ============================================
-- Summary
-- ============================================
SELECT '✅ Seed complete!' AS result;
SELECT CONCAT('Users: ', COUNT(*)) AS info FROM users;
SELECT CONCAT('Logins: ', COUNT(*)) AS info FROM logins;
SELECT CONCAT('Students: ', COUNT(*)) AS info FROM students;
SELECT CONCAT('Teachers: ', COUNT(*)) AS info FROM Teacher;
SELECT CONCAT('Companies: ', COUNT(*)) AS info FROM companies;
SELECT CONCAT('Student-Companies: ', COUNT(*)) AS info FROM student_companies;
SELECT CONCAT('Inturnship configs: ', COUNT(*)) AS info FROM inturnship;
SELECT CONCAT('Internship reports: ', COUNT(*)) AS info FROM internship_report;
SELECT CONCAT('Teacher classrooms: ', COUNT(*)) AS info FROM teacher_classrooms;
SELECT CONCAT('Supervisions: ', COUNT(*)) AS info FROM supervisions;
