/*
  Warnings:

  - You are about to drop the `login` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Login` DROP FOREIGN KEY `Login_userId_fkey`;

-- DropTable
DROP TABLE `Login`;

-- CreateTable
CREATE TABLE `logins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `is_first_login` BOOLEAN NOT NULL DEFAULT true,
    `skip_password_change` DATETIME(3) NULL,

    UNIQUE INDEX `logins_username_key`(`username`),
    UNIQUE INDEX `logins_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `logins` ADD CONSTRAINT `logins_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
