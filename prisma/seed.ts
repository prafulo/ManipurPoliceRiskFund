import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const name = process.env.ADMIN_NAME || 'Super Admin';
  const password = process.env.ADMIN_PASSWORD || 'password123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Admin user with email ${email} already exists. Skipping.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.SuperAdmin,
      },
    });
    console.log(`Created Super Admin user with email: ${email} and password: ${password}`);
    console.log('IMPORTANT: Please change this default password in a production environment.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
