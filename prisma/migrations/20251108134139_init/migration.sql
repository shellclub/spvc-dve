/*
  Warnings:

  - Added the required column `endDate` to the `student_companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `student_companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student_companies` ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `student_companies` ADD CONSTRAINT `student_companies_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_companies` ADD CONSTRAINT `student_companies_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
