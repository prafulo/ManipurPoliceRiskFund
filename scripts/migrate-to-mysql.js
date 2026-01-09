
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
    console.log('This will delete all existing data and apply the latest schema.');
    
    // Use --force-reset to ensure the database is wiped and the new schema can be applied
    const { stdout: pushStdout, stderr: pushStderr } = await execa('npx', ['prisma', 'db', 'push', '--force-reset']);
    
    if (pushStderr && !pushStderr.includes("Your database is now in sync")) {
        console.error("Prisma DB Push Error:", pushStderr);
        // Sometimes stdout has the success message even if stderr has warnings
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

    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists. Skipping.`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'SuperAdmin',
        },
      });
      console.log(`Created Super Admin user with email: ${email}`);
      console.log(`Default password: ${password}`);
      console.log('IMPORTANT: Please change this default password in a production environment.');
    }
    console.log('Seeding finished.');


    console.log('\n\n--- Database Setup Complete! ---');
    console.log('You can now log in with the Super Admin credentials.');

  } catch (error) {
    console.error('\n--- A critical error occurred during database setup: ---');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    pool.end(); // Close the connection pool
    process.exit(0);
  }
}

setupDatabase();
