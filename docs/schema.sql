-- MySQL Schema for Manipur Police Risk Fund
-- This schema is based on the Firestore data structures used in the application.
-- Note: The application is built on Firebase/Firestore and would require a significant
-- backend rewrite to use this MySQL schema.

--
-- Table structure for table `units`
--
CREATE TABLE `units` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `members`
--
CREATE TABLE `members` (
  `id` VARCHAR(255) NOT NULL,
  `membershipCode` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `fatherName` VARCHAR(255) NOT NULL,
  `rank` VARCHAR(255) NOT NULL,
  `trade` VARCHAR(255) NOT NULL,
  `serviceNumber` VARCHAR(255) NOT NULL,
  `badgeNumber` VARCHAR(255) NOT NULL,
  `bloodGroup` VARCHAR(10) NOT NULL,
  `memberPostType` ENUM('Officiating', 'Temporary', 'Substantive') NOT NULL,
  `joiningRank` VARCHAR(255) NOT NULL,
  `dateOfBirth` DATE NOT NULL,
  `dateOfEnrollment` DATE NOT NULL,
  `superannuationDate` DATE NOT NULL,
  `dateOfDischarge` DATE DEFAULT NULL,
  `address` TEXT NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `unitId` VARCHAR(255) NOT NULL,
  `status` ENUM('Opened', 'Closed') NOT NULL,
  `closureReason` ENUM('Retirement', 'Death', 'Doubling', 'Expelled', '') DEFAULT NULL,
  `closureNotes` TEXT DEFAULT NULL,
  `subscriptionStartDate` DATE NOT NULL,
  `parentDepartment` VARCHAR(255) DEFAULT NULL,
  `dateApplied` DATE NOT NULL,
  `receiptDate` DATE NOT NULL,
  `allotmentDate` DATE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `membershipCode_unique` (`membershipCode`),
  KEY `unitId_fk` (`unitId`),
  CONSTRAINT `members_unitId_fk` FOREIGN KEY (`unitId`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `nominees`
-- Nominees are stored as a JSON object in Firestore. In MySQL, a separate table is appropriate.
--
CREATE TABLE `nominees` (
  `id` INT AUTO_INCREMENT,
  `memberId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `relation` VARCHAR(255) NOT NULL,
  `age` INT NOT NULL,
  `share` DECIMAL(5, 2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `memberId_fk` (`memberId`),
  CONSTRAINT `nominees_memberId_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `witnesses`
-- Witnesses are also nested in Firestore. In MySQL, we can represent them in their own table.
--
CREATE TABLE `witnesses` (
  `id` INT AUTO_INCREMENT,
  `memberId` VARCHAR(255) NOT NULL,
  `witnessType` ENUM('first', 'second') NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_witness_unique` (`memberId`, `witnessType`),
  CONSTRAINT `witnesses_memberId_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `payments`
--
CREATE TABLE `payments` (
  `id` VARCHAR(255) NOT NULL,
  `memberId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `paymentDate` TIMESTAMP NOT NULL,
  `monthsPaid` JSON NOT NULL, -- Storing an array of dates as JSON
  PRIMARY KEY (`id`),
  KEY `memberId_fk` (`memberId`),
  CONSTRAINT `payments_memberId_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `transfers`
--
CREATE TABLE `transfers` (
  `id` VARCHAR(255) NOT NULL,
  `memberId` VARCHAR(255) NOT NULL,
  `fromUnitId` VARCHAR(255) NOT NULL,
  `toUnitId` VARCHAR(255) NOT NULL,
  `transferDate` DATE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `memberId_fk` (`memberId`),
  KEY `fromUnitId_fk` (`fromUnitId`),
  KEY `toUnitId_fk` (`toUnitId`),
  CONSTRAINT `transfers_memberId_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`),
  CONSTRAINT `transfers_fromUnitId_fk` FOREIGN KEY (`fromUnitId`) REFERENCES `units` (`id`),
  CONSTRAINT `transfers_toUnitId_fk` FOREIGN KEY (`toUnitId`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `settings`
--
CREATE TABLE `settings` (
  `id` VARCHAR(255) NOT NULL,
  `subscriptionAmount` DECIMAL(10,2) DEFAULT 100.00,
  `expiredReleaseAmount` DECIMAL(10,2) DEFAULT 50000.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- It's common to have a single row in a settings table
INSERT INTO `settings` (`id`, `subscriptionAmount`, `expiredReleaseAmount`) VALUES ('global', 100.00, 50000.00);
