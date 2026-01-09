-- This file contains the SQL schema for the application.

-- Units Table
CREATE TABLE `units` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `units_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SuperAdmin', 'UnitAdmin') NOT NULL DEFAULT 'UnitAdmin',
    `unit_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Members Table
CREATE TABLE `members` (
  `id` VARCHAR(191) NOT NULL,
  `membershipCode` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `fatherName` VARCHAR(191) NOT NULL,
  `rank` VARCHAR(191) NOT NULL,
  `trade` VARCHAR(191) NOT NULL,
  `serviceNumber` VARCHAR(191) NOT NULL,
  `badgeNumber` VARCHAR(191) NOT NULL,
  `bloodGroup` VARCHAR(191) NOT NULL,
  `memberPostType` ENUM('Officiating', 'Temporary', 'Substantive') NOT NULL,
  `joiningRank` VARCHAR(191) NOT NULL,
  `dateOfBirth` DATETIME(3) NOT NULL,
  `dateOfEnrollment` DATETIME(3) NOT NULL,
  `superannuationDate` DATETIME(3) NOT NULL,
  `dateOfDischarge` DATETIME(3) NULL,
  `address` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `unitId` VARCHAR(191) NOT NULL,
  `status` ENUM('Opened', 'Closed') NOT NULL DEFAULT 'Opened',
  `closureReason` ENUM('Retirement', 'Death', 'Doubling', 'Expelled') NULL,
  `closureNotes` TEXT NULL,
  `subscriptionStartDate` DATETIME(3) NOT NULL,
  `nominees` JSON NOT NULL,
  `firstWitness` JSON NOT NULL,
  `secondWitness` JSON NOT NULL,
  `parentDepartment` VARCHAR(191) NULL,
  `dateApplied` DATETIME(3) NOT NULL,
  `receiptDate` DATETIME(3) NOT NULL,
  `allotmentDate` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `members_membershipCode_key`(`membershipCode`),
  FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Payments Table
CREATE TABLE `payments` (
  `id` VARCHAR(191) NOT NULL,
  `memberId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `months` JSON NOT NULL,
  `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Transfers Table
CREATE TABLE `transfers` (
  `id` VARCHAR(191) NOT NULL,
  `memberId` VARCHAR(191) NOT NULL,
  `fromUnitId` VARCHAR(191) NOT NULL,
  `toUnitId` VARCHAR(191) NOT NULL,
  `transferDate` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`fromUnitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`toUnitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
