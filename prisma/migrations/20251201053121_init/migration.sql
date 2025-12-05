/*
  Warnings:

  - You are about to drop the `Major` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Major` DROP FOREIGN KEY `Major_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `Teacher` DROP FOREIGN KEY `Teacher_majorId_fkey`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_major_id_fkey`;

-- DropIndex
DROP INDEX `Teacher_majorId_fkey` ON `Teacher`;

-- DropIndex
DROP INDEX `students_major_id_fkey` ON `students`;

-- DropTable
DROP TABLE `Major`;

-- CreateTable
CREATE TABLE `major` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `major_name` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `major_major_name_key`(`major_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `major` ADD CONSTRAINT `major_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_major_id_fkey` FOREIGN KEY (`major_id`) REFERENCES `major`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
