import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Default Admin from .env
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const defaultName = process.env.ADMIN_NAME || 'Super Admin';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'password123';
  await upsertUser(defaultEmail, defaultName, defaultPassword, UserRole.SuperAdmin);

  // Hardcoded test admin for debugging
  const testEmail = 'test@gmail.com';
  const testName = 'Test Admin';
  const testPassword = 'test123';
  await upsertUser(testEmail, testName, testPassword, UserRole.SuperAdmin);

  // Password reset for top@gmail.com
  const resetEmail = 'top@gmail.com';
  const resetName = 'Top User'; // Name will be updated if user exists, or used for new user
  const resetPassword = '12345678';
  await upsertUser(resetEmail, resetName, resetPassword, UserRole.SuperAdmin);


  console.log('Seeding finished.');
  console.log('You can log in with the following credentials:');
  console.log(`1. Email: ${defaultEmail}, Password: ${defaultPassword}`);
  console.log(`2. Email: ${testEmail}, Password: ${testPassword}`);
  console.log(`3. Email: ${resetEmail}, Password: ${resetPassword}`);
  console.log('IMPORTANT: Please change these default passwords in a production environment.');
}

async function upsertUser(email: string, name: string, password: string, role: UserRole) {
    const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    console.log(`User with email ${email} already exists. Updating password.`);
    await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            name: name, // Also update name and role on existing user
            role: role
        }
    });
    console.log(`Updated user ${email}.`);
  } else {
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        role: role,
      },
    });
    console.log(`Created user with email: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
