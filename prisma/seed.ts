import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('Start seeding ...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';

  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
  } else {
    // Create the admin user
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  }

  // Seed initial site settings
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        site_name: 'Zan Municipality',
        logo_url: '/img/logo.png',
        social: {
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          youtube: 'https://youtube.com',
        },
        footer_links: [
          { label: 'Home', url: '/' },
          { label: 'About Us', url: '/about.html' },
          { label: 'Contact', url: '/contact.html' },
        ],
        about: {
          intro: 'Welcome to the official website of Zan Municipality.',
          history: 'Our municipality has a rich history of serving the community.',
          vision: 'To be a model of excellence in public service.',
          mission: 'To provide high-quality services to our citizens.',
        },
        contact: {
          address: '123 Main Street, Zan City',
          working_hours: ['Mon-Fri: 9am - 5pm'],
          phones: ['123-456-7890'],
          email: 'contact@zan.gov',
          map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.819561314769!3d-6.19474199551493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f42b4b4b4b4b%3A0x4b4b4b4b4b4b4b4b!2sNational%20Monument!5e0!3m2!1sen!2sid!4v1620822194132!5m2!1sen!2sid',
        },
      },
    });
    console.log('Default site settings seeded.');
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