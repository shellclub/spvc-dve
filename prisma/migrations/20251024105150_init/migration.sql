-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `educationId` INTEGER NULL,
    ADD COLUMN `grade` VARCHAR(191) NULL,
    ADD COLUMN `term` VARCHAR(191) NULL,
    ADD COLUMN `years` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` INTEGER NOT NULL DEFAULT 6;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_educationId_fkey` FOREIGN KEY (`educationId`) REFERENCES `education_levels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
