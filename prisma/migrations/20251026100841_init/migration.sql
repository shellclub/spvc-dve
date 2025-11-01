/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `companies` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `companies_userId_key` ON `companies`(`userId`);

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `companies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
