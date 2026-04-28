-- ============================================
-- Demo Data Import from Excel Files
-- Generated: 2026-04-28T07:29:42
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
INSERT INTO departments (id, depname, create_at, update_at) VALUES (1, 'แผนกเทคโนโลยีสารสนเทศ', NOW(), NOW());
INSERT INTO departments (id, depname, create_at, update_at) VALUES (2, 'แผนกเทคโนโลยีธุรกิจดิจิทัล', NOW(), NOW());
INSERT INTO departments (id, depname, create_at, update_at) VALUES (3, 'แผนกการจัดการธุรกิจค้าปลีก', NOW(), NOW());
INSERT INTO departments (id, depname, create_at, update_at) VALUES (4, 'แผนกการตลาด', NOW(), NOW());
INSERT INTO departments (id, depname, create_at, update_at) VALUES (5, 'แผนกการท่องเที่ยว', NOW(), NOW());
INSERT INTO departments (id, depname, create_at, update_at) VALUES (6, 'แผนกการโรงแรม', NOW(), NOW());

-- ============================================
-- Majors (สาขาวิชา)
-- ============================================
INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (1, 'สาขาเทคโนโลยีสารสนเทศ', 1, NOW(), NOW());
INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (2, 'สาขาเทคโนโลยีธุรกิจดิจิทัล', 2, NOW(), NOW());
INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (3, 'สาขาการจัดการธุรกิจค้าปลีก', 3, NOW(), NOW());
INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (4, 'สาขาการตลาด', 4, NOW(), NOW());
INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (5, 'สาขาการท่องเที่ยว', 5, NOW(), NOW());
INSERT INTO major (id, major_name, departmentId, create_at, update_at) VALUES (6, 'สาขาการโรงแรม', 6, NOW(), NOW());

-- ============================================
-- Teachers (ครู) - Role 4
-- ============================================
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (100, 'วิไล', 'รัตนเชิดฉาย', '1720000000001', '0800000001', 4, 0, 'นาง');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher01', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 100, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (101, 'ยุภา', 'เกตบุตร', '1720000000002', '0800000002', 4, 0, 'นาง');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher02', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 101, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (102, 'สรัลรัตน์', 'รุ่งโรจน์', '1720000000003', '0800000003', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher03', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 102, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (103, 'ธวัชชัย', 'หาญจริง', '1720000000004', '0800000004', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher04', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 103, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (104, 'ณฐนันธ์', 'พิริยะธนาธรรม', '1720000000005', '0800000005', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher05', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 104, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (105, 'มานิตา', 'ปานดำ', '1720000000006', '0800000006', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher06', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 105, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (106, 'เฟื่องฟ้า', 'นนท์แก้ว', '1720000000007', '0800000007', 4, 0, 'นาง');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher07', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 106, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (107, 'ภัทรพงศ์', 'โตนน้ำขาว', '1720000000008', '0800000008', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher08', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 107, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (108, 'วารี', 'เสนาะพิณ', '1720000000009', '0800000009', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher09', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 108, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (109, 'วัชราภรณ์', 'นนท์ธีระวิชยา', '1720000000010', '0800000010', 4, 0, 'นาง');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher10', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 109, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (110, 'น้ำผึ้ง', 'คงเปีย', '1720000000011', '0800000011', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher11', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 110, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (111, 'โสรยา', 'สุวรรณชัย', '1720000000012', '0800000012', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher12', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 111, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (112, 'เศวตโชติ', 'บุญจีน', '1720000000013', '0800000013', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher13', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 112, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (113, 'สินาภรณ์', 'สุขเรื่อย', '1720000000014', '0800000014', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher14', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 113, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (114, 'ศิริภา', 'จิตผ่อง', '1720000000015', '0800000015', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher15', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 114, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (115, 'รัตนกาญจน์', 'รัตนประดิษฐ์', '1720000000016', '0800000016', 4, 0, 'นาง');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher16', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 115, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (116, 'ณรงฤทธิ์', 'ศรีประภาวงษ์', '1720000000017', '0800000017', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher17', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 116, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (117, 'ประภัสรา', 'ชนวัฒน์', '1720000000018', '0800000018', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher18', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 117, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (118, 'สุกัญญา', 'วงศ์ศรีเทพ', '1720000000019', '0800000019', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher19', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 118, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (119, 'รัฐนันท์', 'เสียงเสนาะ', '1720000000020', '0800000020', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher20', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 119, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (120, 'ยานุมาศ', 'กองร้อยอยู่', '1720000000021', '0800000021', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher21', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 120, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (121, 'สุพัฒณดา', 'สีวะรมย์', '1720000000022', '0800000022', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher22', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 121, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (122, 'วารุณี', 'มงคลหัตถี', '1720000000023', '0800000023', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher23', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 122, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (123, 'ณ กมล', 'ยุทธิวัฒน์', '1720000000024', '0800000024', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher24', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 123, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (124, 'อรัญกานต์', 'อินต๊ะปัน', '1720000000025', '0800000025', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher25', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 124, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (125, 'วรารัตน์', 'โรจน์ทนงค์', '1720000000026', '0800000026', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher26', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 125, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (126, 'กิติพงศ์', 'โกวิทวณิชชา', '1720000000027', '0800000027', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher27', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 126, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (127, 'สุวิมล', 'เปรมปรีดิ์', '1720000000028', '0800000028', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher28', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 127, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (128, 'ทิพยรัตน์', 'อาชนะชัย', '1720000000029', '0800000029', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher29', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 128, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (129, 'ปัทมพร', 'แสงศรี', '1720000000030', '0800000030', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher30', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 129, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (130, 'กษมา', 'ว่องไว', '1720000000031', '0800000031', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher31', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 130, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (131, 'วัจนา', 'เจริญสวัสดิ์', '1720000000032', '0800000032', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher32', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 131, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (132, 'ปาลิตา', 'จิระสุนทร', '1720000000033', '0800000033', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher33', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 132, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (133, 'กวินธร', 'ไขหทัยบุตร', '1720000000034', '0800000034', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher34', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 133, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (134, 'อภิรดี', 'อามาตย์ทัศน์', '1720000000035', '0800000035', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher35', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 134, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (135, 'ชณิศา', 'เมฆสุทัศน์', '1720000000036', '0800000036', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher36', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 135, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (136, 'สมภพ', 'อุตสาหะ', '1720000000037', '0800000037', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher37', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 136, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (137, 'สุมาวดี', 'จันทร์เพ็ญ', '1720000000038', '0800000038', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher38', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 137, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (138, 'เกล็ดนที', 'ไชยชนะ', '1720000000039', '0800000039', 4, 1, 'ผศ.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher39', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 138, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (139, 'พงศกร', 'พวงสมบัติ', '1720000000040', '0800000040', 4, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher40', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 139, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (140, 'ณัฐวรรธน์', 'ศิริเตชภัทร์', '1720000000041', '0800000041', 4, 1, 'ผศ.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher41', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 140, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (141, 'ภรัณยา', 'มิ่งสมร', '1720000000042', '0800000042', 4, 0, 'นางสาว');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher42', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 141, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (142, 'กานต์สิรี', 'อู่อรุณ', '1720000000043', '0800000043', 4, 0, 'นาง');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher43', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 142, 0);
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (143, 'Argie', 'Picao', '1720000000044', '0800000044', 4, 0, 'Miss');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('teacher44', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 143, 0);

-- ============================================
-- Students (นักเรียน) - Role 7
-- ============================================

-- นาย อชิตพล สุทธิ (68319100016)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (200, 'อชิตพล', 'สุทธิ', '1729900750618', '0900000200', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100016', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 200, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100016', 200, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. กุลจิรา สูงปานเขา (68319100017)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (201, 'กุลจิรา', 'สูงปานเขา', '1100201903684', '0900000201', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100017', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 201, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100017', 201, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- นาย ประยุทธ ลมูลจิตร (68319100018)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (202, 'ประยุทธ', 'ลมูลจิตร', '1720900326125', '0900000202', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100018', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 202, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100018', 202, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- นาย ธนโชติ สุภาถิน (68319100019)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (203, 'ธนโชติ', 'สุภาถิน', '1729900731508', '0900000203', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100019', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 203, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100019', 203, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ทิพรัตน์ อินทร์ปาน (68319100020)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (204, 'ทิพรัตน์', 'อินทร์ปาน', '1729800350375', '0900000204', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100020', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 204, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100020', 204, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. สุภาพร ม่วงคำ (68319100021)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (205, 'สุภาพร', 'ม่วงคำ', '1729900730277', '0900000205', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100021', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 205, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100021', 205, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- นาย ชุติพนธ์ พวงดอกไม้ (68319100022)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (206, 'ชุติพนธ์', 'พวงดอกไม้', '1139400031286', '0900000206', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100022', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 206, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100022', 206, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ปภาพินท์ พงษ์สุพรรณ (68319100023)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (207, 'ปภาพินท์', 'พงษ์สุพรรณ', '1219901096886', '0900000207', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100023', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 207, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100023', 207, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ธารารัตน์ พร้อมพิมพ์ (68319100024)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (208, 'ธารารัตน์', 'พร้อมพิมพ์', '1560301429018', '0900000208', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100024', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 208, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100024', 208, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ปาลิตา บัวเพ็ชร (68319100025)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (209, 'ปาลิตา', 'บัวเพ็ชร', '1809902391878', '0900000209', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100025', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 209, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100025', 209, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ปวริศา เอมสมบูรณ์ (68319100026)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (210, 'ปวริศา', 'เอมสมบูรณ์', '1729900739797', '0900000210', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100026', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 210, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100026', 210, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. อรพรรณ สาททอง (68319100027)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (211, 'อรพรรณ', 'สาททอง', '1720900333628', '0900000211', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100027', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 211, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100027', 211, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- นาย จารุวัฒน์ สามงามหลู (68319100028)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (212, 'จารุวัฒน์', 'สามงามหลู', '1729900728671', '0900000212', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100028', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 212, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100028', 212, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ภัทราวดี ผู้ชงแก้ว (68319100029)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (213, 'ภัทราวดี', 'ผู้ชงแก้ว', '1720401216855', '0900000213', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100029', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 213, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100029', 213, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. วรรรา ทองสุข (68319100030)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (214, 'วรรรา', 'ทองสุข', '1729900652535', '0900000214', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100030', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 214, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100030', 214, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. อารียา เภาวงษ์ (68319100031)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (215, 'อารียา', 'เภาวงษ์', '1129901835035', '0900000215', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100031', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 215, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100031', 215, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. จุฬาลักษณ์ ยิ้มแย้ม (68319100032)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (216, 'จุฬาลักษณ์', 'ยิ้มแย้ม', '1179900491405', '0900000216', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100032', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 216, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100032', 216, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- นาย ศตพรรษ วงค์เครือสอน (68319100033)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (217, 'ศตพรรษ', 'วงค์เครือสอน', '1729400005956', '0900000217', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100033', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 217, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100033', 217, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. ชลพรรษ กิตติโก (68319100034)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (218, 'ชลพรรษ', 'กิตติโก', '1729900737107', '0900000218', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68319100034', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 218, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68319100034', 218, 1, '2568', 1, '1', 'ปวส.1/2', 'ปี 2', 2, 2);

-- น.ส. อมรรัตน์ ชมภูนุช (68302110001)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (219, 'อมรรัตน์', 'ชมภูนุช', '1729900738227', '0900000219', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110001', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 219, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110001', 219, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. กัญญ์วรา ม่วงศรี (68302110002)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (220, 'กัญญ์วรา', 'ม่วงศรี', '1729800355849', '0900000220', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110002', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 220, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110002', 220, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. วรรณษา เซี่ยงลี้ (68302110003)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (221, 'วรรณษา', 'เซี่ยงลี้', '1149600159928', '0900000221', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110003', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 221, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110003', 221, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. นริสรา ชัยชนะ (68302110004)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (222, 'นริสรา', 'ชัยชนะ', '1729900750057', '0900000222', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110004', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 222, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110004', 222, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. วริศรา เดือนฉาย (68302110005)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (223, 'วริศรา', 'เดือนฉาย', '1729900756896', '0900000223', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110005', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 223, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110005', 223, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. วราภรณ์ แซ่ลิ้ม (68302110006)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (224, 'วราภรณ์', 'แซ่ลิ้ม', '1729900748745', '0900000224', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110006', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 224, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110006', 224, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. คัทรียา แก้วมิ่ง (68302110007)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (225, 'คัทรียา', 'แก้วมิ่ง', '1749800412648', '0900000225', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110007', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 225, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110007', 225, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. สุกัญญา จันทรัตน์ (68302110008)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (226, 'สุกัญญา', 'จันทรัตน์', '1729900735716', '0900000226', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110008', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 226, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110008', 226, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. พรพิมล หงษ์ทอง (68302110009)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (227, 'พรพิมล', 'หงษ์ทอง', '1729900747293', '0900000227', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110009', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 227, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110009', 227, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. ณัฐณิชา อุปถัมภ์ (68302110010)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (228, 'ณัฐณิชา', 'อุปถัมภ์', '1208300038422', '0900000228', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110010', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 228, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110010', 228, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. ลลิดา พยัฆวงค์ (68302110011)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (229, 'ลลิดา', 'พยัฆวงค์', '1720401218777', '0900000229', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110011', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 229, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110011', 229, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. ปนัดดา คงพะเนา (68302110012)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (230, 'ปนัดดา', 'คงพะเนา', '1749700137441', '0900000230', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110012', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 230, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110012', 230, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. ปรัชญ์ณัฐฎา มาลารัตน์ (68302110013)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (231, 'ปรัชญ์ณัฐฎา', 'มาลารัตน์', '1729900738481', '0900000231', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110013', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 231, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110013', 231, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. พุทธิดา นิลเกษม (68302110014)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (232, 'พุทธิดา', 'นิลเกษม', '1729900730994', '0900000232', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110014', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 232, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110014', 232, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. วริศา กลำพบุตร (68302110015)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (233, 'วริศา', 'กลำพบุตร', '1729900732831', '0900000233', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110015', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 233, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110015', 233, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. ลักษิกา ก้อนทองดี (68302110016)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (234, 'ลักษิกา', 'ก้อนทองดี', '1729900748061', '0900000234', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110016', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 234, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110016', 234, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. สิริวิมล ด้วงละไม้ (68302110017)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (235, 'สิริวิมล', 'ด้วงละไม้', '1729900728027', '0900000235', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110017', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 235, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110017', 235, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. สุพพัตรา สมสวย (68302110018)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (236, 'สุพพัตรา', 'สมสวย', '1729900732369', '0900000236', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110018', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 236, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110018', 236, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. กรพินธุ์ ตู้แก้ว (68302110020)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (237, 'กรพินธุ์', 'ตู้แก้ว', '1199600434635', '0900000237', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110020', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 237, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110020', 237, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. พิมพ์มาดา ขันทองดี (68302110022)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (238, 'พิมพ์มาดา', 'ขันทองดี', '1729800357264', '0900000238', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110022', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 238, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110022', 238, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. จันทิมา นิจลม (68302110023)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (239, 'จันทิมา', 'นิจลม', '1710400112584', '0900000239', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110023', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 239, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110023', 239, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- น.ส. ปาริฉัตต์ ดำรงค์ภักดี (68302110024)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (240, 'ปาริฉัตต์', 'ดำรงค์ภักดี', '1729800351797', '0900000240', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302110024', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 240, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302110024', 240, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 3, 3);

-- นาย ธนวัฒน์ คล้ายสุบรรณ (68302020001)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (241, 'ธนวัฒน์', 'คล้ายสุบรรณ', '1729800351827', '0900000241', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020001', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 241, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020001', 241, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. ณฐพร คงวิเชียร (68302020002)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (242, 'ณฐพร', 'คงวิเชียร', '1729900730811', '0900000242', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020002', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 242, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020002', 242, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. สุธิมา โฉมตระการ (68302020003)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (243, 'สุธิมา', 'โฉมตระการ', '1729900730617', '0900000243', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020003', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 243, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020003', 243, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. ณัฐธิดา พวงศิลป์ (68302020005)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (244, 'ณัฐธิดา', 'พวงศิลป์', '1104000189431', '0900000244', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020005', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 244, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020005', 244, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. ปฐมาวดี ดีลี (68302020006)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (245, 'ปฐมาวดี', 'ดีลี', '1729900746793', '0900000245', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020006', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 245, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020006', 245, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. วิภาวดี กลิ่นประทุม (68302020008)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (246, 'วิภาวดี', 'กลิ่นประทุม', '1729800344839', '0900000246', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020008', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 246, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020008', 246, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. สุภนิชา เฉกแสงทอง (68302020009)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (247, 'สุภนิชา', 'เฉกแสงทอง', '1720501189591', '0900000247', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020009', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 247, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020009', 247, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย ธีรภัทร์ รอดจิตต์สวัสดิ์ (68302020010)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (248, 'ธีรภัทร์', 'รอดจิตต์สวัสดิ์', '1730601289899', '0900000248', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020010', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 248, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020010', 248, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. โชติรส กาบแก้ว (68302020011)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (249, 'โชติรส', 'กาบแก้ว', '1730201457140', '0900000249', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020011', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 249, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020011', 249, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. ฆนรส ถินมานัด (68302020012)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (250, 'ฆนรส', 'ถินมานัด', '1119600119594', '0900000250', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020012', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 250, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020012', 250, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. มุกฎา พุทธไชย (68302020013)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (251, 'มุกฎา', 'พุทธไชย', '1729900753137', '0900000251', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020013', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 251, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020013', 251, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. ธนพร บุญหมั่น (68302020014)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (252, 'ธนพร', 'บุญหมั่น', '1105000003711', '0900000252', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020014', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 252, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020014', 252, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. สุวนันท์ ทับแสง (68302020015)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (253, 'สุวนันท์', 'ทับแสง', '1729900741198', '0900000253', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020015', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 253, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020015', 253, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. สุดารัตน์ แสงบุญ (68302020017)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (254, 'สุดารัตน์', 'แสงบุญ', '1729900727608', '0900000254', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020017', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 254, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020017', 254, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย บดินทร์ เจริญทรัพย์ (68302020018)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (255, 'บดินทร์', 'เจริญทรัพย์', '1729900727373', '0900000255', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020018', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 255, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020018', 255, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย วรพัทธ์ ฉัตรธีรธราพงษ์ (68302020019)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (256, 'วรพัทธ์', 'ฉัตรธีรธราพงษ์', '1719900703172', '0900000256', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020019', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 256, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020019', 256, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย ภานุวัฒน์ เอกสมบัติ (68302020021)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (257, 'ภานุวัฒน์', 'เอกสมบัติ', '1729900737387', '0900000257', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020021', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 257, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020021', 257, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. อรยา พันธุ์สมบูรณ์ (68302020022)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (258, 'อรยา', 'พันธุ์สมบูรณ์', '1729800331192', '0900000258', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020022', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 258, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020022', 258, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- น.ส. พัชรพร แก้วเกิดเถื่อน (68302020023)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (259, 'พัชรพร', 'แก้วเกิดเถื่อน', '1729800328680', '0900000259', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020023', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 259, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020023', 259, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย ผดุงเกียรติ จำปาเงิน (68302020024)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (260, 'ผดุงเกียรติ', 'จำปาเงิน', '1729900586362', '0900000260', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020024', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 260, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020024', 260, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย ธนชิต อมรภูวดล (68302020025)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (261, 'ธนชิต', 'อมรภูวดล', '1729900612215', '0900000261', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020025', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 261, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020025', 261, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย สุพัฒน์ แผนสมบูรณ์ (68302020026)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (262, 'สุพัฒน์', 'แผนสมบูรณ์', '1729900726954', '0900000262', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020026', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 262, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020026', 262, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย อานนท์ หรีมฉ่ำ (68302020027)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (263, 'อานนท์', 'หรีมฉ่ำ', '1729900736488', '0900000263', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020027', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 263, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020027', 263, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย สาธร หนองบอน (68302020029)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (264, 'สาธร', 'หนองบอน', '1720501182944', '0900000264', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020029', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 264, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020029', 264, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย สิทธิชัย จุ้ยแตง (68302020030)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (265, 'สิทธิชัย', 'จุ้ยแตง', '1729900664347', '0900000265', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68302020030', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 265, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68302020030', 265, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 4, 4);

-- นาย ดนัยณัฐ มณีวรรณ (68307020001)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (266, 'ดนัยณัฐ', 'มณีวรรณ', '1199901141599', '0900000266', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307020001', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 266, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307020001', 266, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 5, 5);

-- นาย วสิษฐ์พล นุชปั้น (68307020002)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (267, 'วสิษฐ์พล', 'นุชปั้น', '1729100051944', '0900000267', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307020002', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 267, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307020002', 267, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 5, 5);

-- น.ส. ญารินดา เอี่ยมอินทร์ (68307010002)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (268, 'ญารินดา', 'เอี่ยมอินทร์', '1729900735040', '0900000268', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010002', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 268, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010002', 268, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- น.ส. กชกร ศรีบุญเพ็ง (68307010003)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (269, 'กชกร', 'ศรีบุญเพ็ง', '1729900747111', '0900000269', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010003', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 269, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010003', 269, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- น.ส. วาสนา การภักดี (68307010004)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (270, 'วาสนา', 'การภักดี', '1729100071457', '0900000270', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010004', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 270, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010004', 270, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- น.ส. สุนิตา สีขาว (68307010006)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (271, 'สุนิตา', 'สีขาว', '1729900731800', '0900000271', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010006', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 271, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010006', 271, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- นาย ศรัณยู แตงหวาน (68307010007)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (272, 'ศรัณยู', 'แตงหวาน', '1720501188250', '0900000272', 7, 1, 'นาย');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010007', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 272, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010007', 272, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- น.ส. อารีรัตน์ โพธิเปี้ยศรี (68307010008)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (273, 'อารีรัตน์', 'โพธิเปี้ยศรี', '1729900745967', '0900000273', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010008', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 273, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010008', 273, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- น.ส. นวนันท์ ร่มโพธิ์เย็น (68307010009)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (274, 'นวนันท์', 'ร่มโพธิ์เย็น', '1729900720778', '0900000274', 7, 0, 'น.ส.');
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('68307010009', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 274, 0);
INSERT INTO students (studentId, userId, educationLevel, academicYear, status, term, room, gradeLevel, departmentId, major_id) VALUES ('68307010009', 274, 1, '2568', 1, '1', 'ปวส.1/1', 'ปี 1', 6, 6);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Summary
-- ============================================
-- Departments: 6
-- Majors: 6
-- Teachers: 44
-- Students: 75
-- Total users added: 119
