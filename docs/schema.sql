-- Complete SQL schema for the application

-- Units Table
CREATE TABLE `units` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `units_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Members Table
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `membership_code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `father_name` VARCHAR(191) NOT NULL,
    `rank` VARCHAR(191) NOT NULL,
    `trade` VARCHAR(191) NOT NULL,
    `service_number` VARCHAR(191) NOT NULL,
    `badge_number` VARCHAR(191) NOT NULL,
    `blood_group` VARCHAR(191) NOT NULL,
    `member_post_type` ENUM('Officiating', 'Temporary', 'Substantive') NOT NULL,
    `joining_rank` VARCHAR(191) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `date_of_enrollment` DATE NOT NULL,
    `superannuation_date` DATE NOT NULL,
    `date_of_discharge` DATE NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,
    `status` ENUM('Opened', 'Closed') NOT NULL DEFAULT 'Opened',
    `closure_reason` ENUM('Retirement', 'Death', 'Doubling', 'Expelled') NULL,
    `closure_notes` TEXT NULL,
    `subscription_start_date` DATE NOT NULL,
    `nominees` JSON NOT NULL,
    `first_witness` JSON NOT NULL,
    `second_witness` JSON NOT NULL,
    `parent_department` VARCHAR(191) NULL,
    `date_applied` DATE NOT NULL,
    `receipt_date` DATE NOT NULL,
    `allotment_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_membership_code_key`(`membership_code`),
    INDEX `members_unit_id_idx`(`unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `member_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `months` JSON NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payments_member_id_idx`(`member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Transfers Table
CREATE TABLE `transfers` (
    `id` VARCHAR(191) NOT NULL,
    `member_id` VARCHAR(191) NOT NULL,
    `from_unit_id` VARCHAR(191) NOT NULL,
    `to_unit_id` VARCHAR(191) NOT NULL,
    `transfer_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transfers_member_id_idx`(`member_id`),
    INDEX `transfers_from_unit_id_idx`(`from_unit_id`),
    INDEX `transfers_to_unit_id_idx`(`to_unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE `settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SuperAdmin', 'UnitAdmin') NOT NULL DEFAULT 'UnitAdmin',
    `unit_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

