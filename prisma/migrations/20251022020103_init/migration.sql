/*
  Warnings:

  - You are about to drop the column `departmentId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_departmentId_fkey`;

-- DropIndex
DROP INDEX `users_departmentId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `departmentId`;

-- CreateTable
CREATE TABLE `Teacher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `departmentId` INTEGER NULL,
    `majorId` INTEGER NULL,
    `room` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `Major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
