-- AlterTable
ALTER TABLE `students` ADD COLUMN `marjor_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_marjor_id_fkey` FOREIGN KEY (`marjor_id`) REFERENCES `Major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
