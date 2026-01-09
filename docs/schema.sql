-- This file contains the SQL schema for the application.

-- Units Table
CREATE TABLE `units` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `units_name_key`(`name`),
    PRIMARY KEY (`id`)
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
    `date_of_birth` DATETIME(3) NOT NULL,
    `date_of_enrollment` DATETIME(3) NOT NULL,
    `superannuation_date` DATETIME(3) NOT NULL,
    `date_of_discharge` DATETIME(3),
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,
    `status` ENUM('Opened', 'Closed') NOT NULL,
    `closure_reason` ENUM('Retirement', 'Death', 'Doubling', 'Expelled'),
    `closure_notes` VARCHAR(191),
    `subscription_start_date` DATETIME(3) NOT NULL,
    `nominees` JSON NOT NULL,
    `first_witness` JSON NOT NULL,
    `second_witness` JSON NOT NULL,
    `parent_department` VARCHAR(191),
    `date_applied` DATETIME(3) NOT NULL,
    `receipt_date` DATETIME(3) NOT NULL,
    `allotment_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_membership_code_key`(`membership_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `member_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `months` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Transfers Table
CREATE TABLE `transfers` (
    `id` VARCHAR(191) NOT NULL,
    `member_id` VARCHAR(191) NOT NULL,
    `from_unit_id` VARCHAR(191) NOT NULL,
    `to_unit_id` VARCHAR(191) NOT NULL,
    `transfer_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
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
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
