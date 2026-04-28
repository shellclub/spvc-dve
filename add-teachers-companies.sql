-- ============================================
-- เพิ่มข้อมูลครูลงตาราง Teacher + สถานประกอบการ
-- ============================================

-- ============================================
-- 1. Teacher table (ครูที่ปรึกษา)
--    Map user_id ครู => department + major
-- ============================================

-- ครูแผนกเทคโนโลยีสารสนเทศ (dept=1, major=1)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (100, 1, 1, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (101, 1, 1, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');

-- ครูแผนกเทคโนโลยีธุรกิจดิจิทัล (dept=2, major=2)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (102, 2, 2, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (103, 2, 2, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (104, 2, 2, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (105, 2, 2, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');

-- ครูแผนกการจัดการธุรกิจค้าปลีก (dept=3, major=3)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (106, 3, 3, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (107, 3, 3, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (108, 3, 3, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (109, 3, 3, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');

-- ครูแผนกการตลาด (dept=4, major=4)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (110, 4, 4, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (111, 4, 4, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (112, 4, 4, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (113, 4, 4, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (114, 4, 4, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');

-- ครูแผนกการท่องเที่ยว (dept=5, major=5)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (115, 5, 5, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (116, 5, 5, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');

-- ครูแผนกการโรงแรม (dept=6, major=6)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (117, 6, 6, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (118, 6, 6, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (119, 6, 6, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');

-- ครูที่เหลือ (เฉลี่ยกระจายตามแผนก)
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (120, 1, 1, 'ปวช.3/1', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (121, 2, 2, 'ปวช.3/1', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (122, 3, 3, 'ปวช.3/1', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (123, 4, 4, 'ปวช.3/1', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (124, 5, 5, 'ปวช.3/1', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (125, 6, 6, 'ปวช.3/1', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (126, 1, 1, 'ปวส.2/1', 1, 'ปี 2', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (127, 2, 2, 'ปวส.2/1', 1, 'ปี 2', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (128, 3, 3, 'ปวส.2/1', 1, 'ปี 2', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (129, 4, 4, 'ปวส.2/1', 1, 'ปี 2', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (130, 5, 5, 'ปวส.2/1', 1, 'ปี 2', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (131, 6, 6, 'ปวส.2/1', 1, 'ปี 2', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (132, 1, 1, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (133, 2, 2, 'ปวส.1/1', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (134, 3, 3, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (135, 4, 4, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (136, 5, 5, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (137, 6, 6, 'ปวส.1/2', 1, 'ปี 1', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (138, 1, 1, 'ปวช.3/2', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (139, 2, 2, 'ปวช.3/2', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (140, 3, 3, 'ปวช.3/2', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (141, 4, 4, 'ปวช.3/2', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (142, 6, 6, 'ปวช.3/2', 2, 'ปี 3', '1', '2568');
INSERT INTO Teacher (userId, departmentId, majorId, room, educationId, grade, term, years) VALUES (143, 4, 4, 'ปวส.1/3', 1, 'ปี 1', '1', '2568');

-- ============================================
-- 2. Companies (สถานประกอบการ)
--    ต้องสร้าง user role=6 สำหรับแต่ละ company
-- ============================================

-- สร้าง user สำหรับสถานประกอบการ (role=6)
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (300, 'บริษัท ซีพี ออลล์', 'จำกัด (มหาชน)', '0105531023451', '0345641111', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (301, 'บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์', 'จำกัด (มหาชน)', '0105538037651', '0345642222', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (302, 'โรงแรมสุพรรณบุรี', 'รีสอร์ท', '0725500001231', '0355511111', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (303, 'บริษัท ทรู คอร์ปอเรชั่น', 'จำกัด (มหาชน)', '0105536089721', '0345643333', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (304, 'ธนาคารกรุงไทย', 'สาขาสุพรรณบุรี', '0109536004271', '0355522222', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (305, 'บริษัท โลตัส รีเทล', 'จำกัด', '0105548000391', '0345644444', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (306, 'โรงแรมศรีอู่ทอง แกรนด์', 'จำกัด', '0725500001321', '0355533333', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (307, 'สำนักงานท่องเที่ยว', 'จังหวัดสุพรรณบุรี', '0725500001411', '0355544444', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (308, 'บริษัท เอไอเอส', 'จำกัด (มหาชน)', '0105530011511', '0345645555', 6, 1, '');
INSERT INTO users (id, firstname, lastname, citizenId, phone, role, sex, prefix) VALUES (309, 'บริษัท แม็คโคร', 'จำกัด (มหาชน)', '0105527000591', '0345646666', 6, 1, '');

-- Login สำหรับสถานประกอบการ (password: 123456)
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company01', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 300, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company02', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 301, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company03', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 302, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company04', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 303, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company05', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 304, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company06', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 305, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company07', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 306, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company08', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 307, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company09', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 308, 0);
INSERT INTO logins (username, password, userId, is_first_login) VALUES ('company10', '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG', 309, 0);

-- Companies table
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (1, 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)', '119 ถ.มาลัยแมน ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 300, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (2, 'บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)', '999 ถ.สุพรรณบุรี-ชัยนาท ต.สนามชัย อ.เมือง จ.สุพรรณบุรี 72000', 301, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (3, 'โรงแรมสุพรรณบุรี รีสอร์ท', '55/5 หมู่ 3 ต.สนามชัย อ.เมือง จ.สุพรรณบุรี 72000', 302, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (4, 'บริษัท ทรู คอร์ปอเรชั่น จำกัด (มหาชน)', '300 ถ.พระพันวษา ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 303, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (5, 'ธนาคารกรุงไทย สาขาสุพรรณบุรี', '88 ถ.นางพิมพ์ ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 304, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (6, 'บริษัท โลตัส รีเทล จำกัด', '777 ถ.สุพรรณบุรี-ชัยนาท ต.สนามชัย อ.เมือง จ.สุพรรณบุรี 72000', 305, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (7, 'โรงแรมศรีอู่ทอง แกรนด์', '100 ถ.ขุนช้าง ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 306, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (8, 'สำนักงานท่องเที่ยวจังหวัดสุพรรณบุรี', 'ศาลากลางจังหวัดสุพรรณบุรี อ.เมือง จ.สุพรรณบุรี 72000', 307, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (9, 'บริษัท เอไอเอส จำกัด (มหาชน)', '200 ถ.พระพันวษา ต.ท่าพี่เลี้ยง อ.เมือง จ.สุพรรณบุรี 72000', 308, NOW());
INSERT INTO companies (id, name, address, userId, updatedAt) VALUES (10, 'บริษัท แม็คโคร จำกัด (มหาชน)', '555 ถ.สุพรรณบุรี-ชัยนาท ต.สนามชัย อ.เมือง จ.สุพรรณบุรี 72000', 309, NOW());

-- ============================================
-- Verify
-- ============================================
SELECT 'Teachers:' as info, COUNT(*) as cnt FROM Teacher;
SELECT 'Companies:' as info, COUNT(*) as cnt FROM companies;
