/*
  Warnings:

  - You are about to drop the column `major` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `major`;

-- CreateTable
CREATE TABLE `Major` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `major_name` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Major_major_name_key`(`major_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Major` ADD CONSTRAINT `Major_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
