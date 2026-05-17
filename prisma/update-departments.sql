-- ============================================================
-- อัปเดตแผนกวิชาใหม่ 13 แผนก
-- Run: mysql -u spvc -pspvc2025 -h 127.0.0.1 --default-character-set=utf8mb4 db_dvt_prod < prisma/update-departments.sql
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET @now = NOW();

-- ลบแผนกเดิมทั้งหมด (ถ้าไม่มี FK reference)
-- ถ้ามีข้อมูลอ้างอิงอยู่ จะใช้วิธี upsert แทน
-- DELETE FROM departments;

-- เพิ่ม/อัปเดตแผนกวิชาใหม่ทั้ง 13 แผนก
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
  (13, 'แผนกวิชาธุรกิจค้าปลีก', @now, @now)
ON DUPLICATE KEY UPDATE depname = VALUES(depname), update_at = @now;

SELECT '✅ อัปเดตแผนกวิชาเรียบร้อย!' AS result;
SELECT id, depname FROM departments ORDER BY id;
