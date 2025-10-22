/*
  Warnings:

  - You are about to drop the column `marjor_id` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_marjor_id_fkey`;

-- DropIndex
DROP INDEX `students_marjor_id_fkey` ON `students`;

-- AlterTable
ALTER TABLE `students` DROP COLUMN `marjor_id`,
    ADD COLUMN `departmentId` INTEGER NULL,
    ADD COLUMN `major_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_major_id_fkey` FOREIGN KEY (`major_id`) REFERENCES `Major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
