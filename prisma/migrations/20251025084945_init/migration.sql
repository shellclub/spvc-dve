/*
  Warnings:

  - You are about to drop the column `position` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `trainer` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `week` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `companies` DROP COLUMN `position`,
    DROP COLUMN `tel`,
    DROP COLUMN `trainer`,
    DROP COLUMN `week`;

-- CreateTable
CREATE TABLE `Login` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `password_status` INTEGER NOT NULL,

    UNIQUE INDEX `Login_username_key`(`username`),
    UNIQUE INDEX `Login_password_key`(`password`),
    UNIQUE INDEX `Login_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Login` ADD CONSTRAINT `Login_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
