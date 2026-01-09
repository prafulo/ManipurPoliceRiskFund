-- Sample SQL to insert a new user.
-- IMPORTANT: You must replace 'YOUR_BCRYPT_HASHED_PASSWORD' with a real bcrypt hash of your desired password.
-- The application will not be able to log this user in if you use a plain-text password.
-- You also need to generate a unique ID for the user (e.g., a UUID).

INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `createdAt`, `updatedAt`)
VALUES
(
  'clx......', -- Replace with a unique ID (e.g., a new CUID or UUID)
  'new.admin@example.com',
  'Manual Admin',
  '$2a$10$YourBcryptHashedPasswordGoesHere...', -- Replace with your actual bcrypt hash
  'SuperAdmin',
  NOW(),
  NOW()
);

-- To create a 'UnitAdmin', you would also need to provide a valid 'unitId' that exists in the 'Unit' table.
-- INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `unitId`, `createdAt`, `updatedAt`)
-- VALUES
-- (
--   'cly......',
--   'unit.admin@example.com',
--   'Unit Admin',
--   '$2a$10$AnotherBcryptHashGoesHere...',
--   'UnitAdmin',
--   'existing-unit-id-from-unit-table', -- Replace with a valid Unit ID
--   NOW(),
--   NOW()
-- );
