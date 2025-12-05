-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_major_id_fkey`;

-- DropIndex
DROP INDEX `students_departmentId_fkey` ON `students`;

-- DropIndex
DROP INDEX `students_major_id_fkey` ON `students`;

-- CreateTable
CREATE TABLE `supervisions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `teacherId` INTEGER NOT NULL,
    `supervisionDate` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `type` ENUM('ON_SITE', 'ONLINE', 'PHONE') NOT NULL DEFAULT 'ON_SITE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_major_id_fkey` FOREIGN KEY (`major_id`) REFERENCES `Major`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervisions` ADD CONSTRAINT `supervisions_studentId_companyId_fkey` FOREIGN KEY (`studentId`, `companyId`) REFERENCES `student_companies`(`studentId`, `companyId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervisions` ADD CONSTRAINT `supervisions_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
