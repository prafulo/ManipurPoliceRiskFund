-- Units Table
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `Unit_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Members Table
CREATE TABLE `Member` (
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
    `closureNotes` VARCHAR(191) NULL,
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

    UNIQUE INDEX `Member_membershipCode_key`(`membershipCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `months` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Transfers Table
CREATE TABLE `Transfer` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `fromUnitId` VARCHAR(191) NOT NULL,
    `toUnitId` VARCHAR(191) NOT NULL,
    `transferDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Setting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Users Table (Generated from the specified Prisma model)
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SuperAdmin', 'UnitAdmin') NOT NULL DEFAULT 'UnitAdmin',
    `unitId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_unitId_idx`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
