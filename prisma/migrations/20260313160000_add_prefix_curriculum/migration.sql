-- AlterTable: add missing columns
ALTER TABLE `users` ADD COLUMN `prefix` VARCHAR(191) NULL;
ALTER TABLE `students` ADD COLUMN `curriculum` VARCHAR(191) NULL;
