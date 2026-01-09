
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


    // --- 2. Seed the Super Admin Users ---
    console.log('\nStep 2: Seeding Super Admin users...');
    
    // Default Admin
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const defaultName = process.env.ADMIN_NAME || 'Super Admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'password123';
    await upsertUser(defaultEmail, defaultName, defaultPassword, 'SuperAdmin');

    // New Test Admin
    const testEmail = 'test@gmail.com';
    const testName = 'Test Admin';
    const testPassword = 'test123';
    await upsertUser(testEmail, testName, testPassword, 'SuperAdmin');

    
    console.log('\n--- Seeding finished. ---');
    console.log('You can now log in with the following Super Admin credentials:');
    console.log(`1. Email: ${defaultEmail}, Password: ${defaultPassword}`);
    console.log(`2. Email: ${testEmail}, Password: ${testPassword}`);
    console.log('IMPORTANT: Please change these default passwords in a production environment.');


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

async function upsertUser(email, name, password, role) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      console.log(`Admin user with email ${email} already exists. Updating password.`);
      await prisma.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
            name: name,
            role: role
          }
      });
      console.log(`Updated password for Super Admin user with email: ${email}`);
    } else {
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: role,
        },
      });
      console.log(`Created Super Admin user with email: ${email}`);
    }
}

setupDatabase();
