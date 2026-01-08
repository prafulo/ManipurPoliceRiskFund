-- MySQL Database Schema for the Manipur Police Risk Fund Application

-- This schema is designed to match the data structures defined in `src/lib/types.ts`.

--
-- Table structure for table `units`
--
CREATE TABLE `units` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `members`
--
CREATE TABLE `members` (
  `id` varchar(255) NOT NULL,
  `membership_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `father_name` varchar(255) NOT NULL,
  `rank` varchar(255) NOT NULL,
  `trade` varchar(255) NOT NULL,
  `service_number` varchar(255) NOT NULL,
  `badge_number` varchar(255) NOT NULL,
  `blood_group` varchar(50) NOT NULL,
  `member_post_type` enum('Officiating','Temporary','Substantive') NOT NULL,
  `joining_rank` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `date_of_enrollment` date NOT NULL,
  `superannuation_date` date NOT NULL,
  `date_of_discharge` date DEFAULT NULL,
  `address` text NOT NULL,
  `phone` varchar(50) NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `status` enum('Opened','Closed') NOT NULL,
  `closure_reason` enum('Retirement','Death','Doubling','Expelled') DEFAULT NULL,
  `closure_notes` text,
  `subscription_start_date` date NOT NULL,
  `nominees` json NOT NULL,
  `first_witness` json NOT NULL,
  `second_witness` json NOT NULL,
  `parent_department` varchar(255) DEFAULT NULL,
  `date_applied` date NOT NULL,
  `receipt_date` date NOT NULL,
  `allotment_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `membership_code` (`membership_code`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `members_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payments`
--
CREATE TABLE `payments` (
  `id` varchar(255) NOT NULL,
  `member_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `months` json NOT NULL,
  `payment_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `transfers`
--
CREATE TABLE `transfers` (
  `id` varchar(255) NOT NULL,
  `member_id` varchar(255) NOT NULL,
  `from_unit_id` varchar(255) NOT NULL,
  `to_unit_id` varchar(255) NOT NULL,
  `transfer_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `from_unit_id` (`from_unit_id`),
  KEY `to_unit_id` (`to_unit_id`),
  CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`from_unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `transfers_ibfk_3` FOREIGN KEY (`to_unit_id`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
