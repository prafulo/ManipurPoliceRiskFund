import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Default Admin
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const defaultName = process.env.ADMIN_NAME || 'Super Admin';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'password123';
  await upsertUser(defaultEmail, defaultName, defaultPassword, UserRole.SuperAdmin);

  // New Test Admin requested by user
  const testEmail = 'test@gmail.com';
  const testName = 'Test Admin';
  const testPassword = 'test123';
  await upsertUser(testEmail, testName, testPassword, UserRole.SuperAdmin);


  console.log('Seeding finished.');
  console.log('You can log in with the following credentials:');
  console.log(`1. Email: ${defaultEmail}, Password: ${defaultPassword}`);
  console.log(`2. Email: ${testEmail}, Password: ${testPassword}`);
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
            name: name,
            role: role
        }
    });
    console.log(`Updated user ${email}.`);
  } else {
    await prisma.user.create({
      data: {
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
