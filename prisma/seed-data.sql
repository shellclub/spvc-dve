-- Seed ข้อมูลทดสอบ: 1 Admin + 5 นักศึกษา + 3 ครู
-- ตาม Google Doc: https://docs.google.com/document/d/1F_GVvgrYerO9T36vaFRPcWGanHAvytQI2JqgrPbXPYs
-- Run: docker exec -i <mysql-container> mysql -u spvc -pspvc_2026 spvc_dve < prisma/seed-data.sql

-- ============================================
-- 1. Education Levels
-- ============================================
INSERT IGNORE INTO education_levels (id, name) VALUES (1, 'ปวช.'), (2, 'ปวส.');

-- ============================================
-- 2. Department + Major
-- ============================================
INSERT IGNORE INTO departments (id, depname) VALUES (1, 'แผนกเทคโนโลยีสารสนเทศ');
INSERT IGNORE INTO major (id, major_name, departmentId) VALUES (1, 'สาขาเทคโนโลยีสารสนเทศ', 1);

-- ============================================
-- 3. Admin (Username: Admin / Password: 123456)
-- ============================================
INSERT IGNORE INTO users (id, prefix, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES (1, NULL, 'Admin', 'Admin', '1103702589654', '0987654321', 1, 1, '2000-01-01');

INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('Admin', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 1, 0);

-- ============================================
-- 4. Students (5 คน) - role 7
-- ============================================
-- นายธนวัฒน์ สุขใจ (68201010001 / 10042560)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES ('นาย', 'ธนวัฒน์', 'สุขใจ', '1100700100001', '0812345001', 7, 1, '2017-04-10');
SET @uid1 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('68201010001', '$2b$10$9s2uHm5m6EUnGaVuhRAmjuiM3VjrEA7Y.c2gHL6cx/gMHUopy88aS', @uid1, 1);
INSERT IGNORE INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel, curriculum)
VALUES ('68201010001', @uid1, 1, 1, '2568', '1', '1', 1, 'ปวช.1', 'ปกติ');

-- นางสาวสุภาพร แก้วมณี (68201010002 / 25122559)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES ('นางสาว', 'สุภาพร', 'แก้วมณี', '1100700100002', '0812345002', 7, 2, '2016-12-25');
SET @uid2 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('68201010002', '$2b$10$0mRe0wFy3lyhhL3xWWlCq.JBkNsdpwmA5jKnP4man2AVL4TmnY4P6', @uid2, 1);
INSERT IGNORE INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel, curriculum)
VALUES ('68201010002', @uid2, 1, 1, '2568', '1', '1', 1, 'ปวช.1', 'ปกติ');

-- นายพีรพัฒน์ มั่นคง (68201010003 / 01012560)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES ('นาย', 'พีรพัฒน์', 'มั่นคง', '1100700100003', '0812345003', 7, 1, '2017-01-01');
SET @uid3 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('68201010003', '$2b$10$lVG1gMk9ZORh1Cic89oZ6e4QL.K9UsI.EfjhSNTKomogFrzV1HsE6', @uid3, 1);
INSERT IGNORE INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel, curriculum)
VALUES ('68201010003', @uid3, 1, 1, '2568', '1', '1', 1, 'ปวช.1', 'ปกติ');

-- นางสาวปิยะดา รุ่งเรือง (68201010004 / 15082560)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES ('นางสาว', 'ปิยะดา', 'รุ่งเรือง', '1100700100004', '0812345004', 7, 2, '2017-08-15');
SET @uid4 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('68201010004', '$2b$10$b.gaERt4LxNBgSfsgUNVWemVn9f1xPVDR5uoi4JI3XbG3l8hNf1Oi', @uid4, 1);
INSERT IGNORE INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel, curriculum)
VALUES ('68201010004', @uid4, 1, 1, '2568', '1', '1', 1, 'ปวช.1', 'ปกติ');

-- นายวรเมธ ศรีสว่าง (68201010005 / 30062559)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex, birthday)
VALUES ('นาย', 'วรเมธ', 'ศรีสว่าง', '1100700100005', '0812345005', 7, 1, '2016-06-30');
SET @uid5 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('68201010005', '$2b$10$v1lY83irQrNpggGYpm1MYuoBauBG4O7T8CZ7Fd8txXXv07QMwnOn2', @uid5, 1);
INSERT IGNORE INTO students (studentId, userId, educationLevel, major_id, academicYear, term, room, departmentId, gradeLevel, curriculum)
VALUES ('68201010005', @uid5, 1, 1, '2568', '1', '1', 1, 'ปวช.1', 'ปกติ');

-- ============================================
-- 5. Teachers (3 คน) - role 4
-- ============================================
-- อาจารย์สมศักดิ์ ใจดี (somsak.j / 0891234567)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex)
VALUES ('อาจารย์', 'สมศักดิ์', 'ใจดี', '3100501234567', '0891234567', 4, 1);
SET @tid1 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('somsak.j', '$2b$10$q72zluR8sJWQ63wshy7mdeCPrtKke7Lr.A1hzsvV2N1iHxXOT..Yi', @tid1, 1);
INSERT IGNORE INTO Teacher (userId, departmentId, majorId) VALUES (@tid1, 1, 1);

-- อาจารย์วิภาวดี สุขสันต์ (wipawadee.s / 0867654321)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex)
VALUES ('อาจารย์', 'วิภาวดี', 'สุขสันต์', '3100501234568', '0867654321', 4, 2);
SET @tid2 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('wipawadee.s', '$2b$10$Et2JwDrsgB3bL72WC9it1.9HZpUdzH23GXBkTZOE0LIiHy9UBzDKK', @tid2, 1);
INSERT IGNORE INTO Teacher (userId, departmentId, majorId) VALUES (@tid2, 1, 1);

-- อาจารย์ประสิทธิ์ เจริญสุข (prasit.c / 0923456789)
INSERT IGNORE INTO users (prefix, firstname, lastname, citizenId, phone, role, sex)
VALUES ('อาจารย์', 'ประสิทธิ์', 'เจริญสุข', '3100501234569', '0923456789', 4, 1);
SET @tid3 = LAST_INSERT_ID();
INSERT IGNORE INTO logins (username, password, userId, is_first_login)
VALUES ('prasit.c', '$2b$10$1Mjl2fPTwXSDCP8wQ5oLAeVuZbY4yDJKg5zkQu1g5Ft53LlXWxC8.', @tid3, 1);
INSERT IGNORE INTO Teacher (userId, departmentId, majorId) VALUES (@tid3, 1, 1);

SELECT '✅ Seed complete!' AS result;
