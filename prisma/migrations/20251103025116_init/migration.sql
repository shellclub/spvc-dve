/*
  Warnings:

  - You are about to drop the column `studentId` on the `companies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `companies` DROP FOREIGN KEY `companies_studentId_fkey`;

-- DropIndex
DROP INDEX `companies_studentId_key` ON `companies`;

-- AlterTable
ALTER TABLE `companies` DROP COLUMN `studentId`;

-- CreateTable
CREATE TABLE `student_companies` (
    `studentId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`studentId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
