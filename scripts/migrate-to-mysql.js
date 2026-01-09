
require('dotenv').config({ path: '.env' });
const { execa } = require('execa');
const { PrismaClient } = require('@prisma/client');
const { createPool } = require('mysql2');
const bcrypt = require('bcryptjs');

const pool = createPool({ uri: process.env.DATABASE_URL });

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('--- Database Setup Script ---');

  try {
    // --- 1. Reset and Sync Prisma Schema with the Database ---
    console.log('\nStep 1: Resetting and syncing database schema with Prisma...');
    console.log('This will apply the latest schema. It may delete data on schema changes.');
    
    const { stdout: pushStdout, stderr: pushStderr } = await execa('npx', ['prisma', 'db', 'push', '--accept-data-loss']);
    
    if (pushStderr && !pushStderr.includes("Your database is now in sync")) {
        console.error("Prisma DB Push Error:", pushStderr);
        if (!pushStdout.includes("Your database is now in sync")) {
            throw new Error(pushStderr);
        }
    }
    console.log(pushStdout);
    console.log('Schema synchronization complete.');


    // --- 2. Seed the Super Admin User ---
    console.log('\nStep 2: Seeding Super Admin user...');
    
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const name = process.env.ADMIN_NAME || 'Super Admin';
    const password = process.env.ADMIN_PASSWORD || 'password123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists. Updating password.`);
      await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
      });
      console.log(`Updated password for Super Admin user with email: ${email}`);
    } else {
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'SuperAdmin',
        },
      });
      console.log(`Created Super Admin user with email: ${email}`);
    }
    
    console.log('\n--- Seeding finished. ---');
    console.log('You can now log in with the Super Admin credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('IMPORTANT: Please change this default password in a production environment.');


    console.log('\n\n--- Database Setup Complete! ---');

  } catch (error) {
    console.error('\n--- A critical error occurred during database setup: ---');
    console.error(error.message);
    if(error.stdout) console.error("STDOUT:", error.stdout);
    if(error.stderr) console.error("STDERR:", error.stderr);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    pool.end(); // Close the connection pool
    process.exit(0);
  }
}

setupDatabase();
