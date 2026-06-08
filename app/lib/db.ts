import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function seedDatabaseIfEmpty() {
  try {
    // Check if mountains are empty
    const countMountains = await prisma.mountain.count();
    if (countMountains === 0) {
      await prisma.mountain.create({
        data: {
          name: "Gunung Prau",
          location: "Dieng, Jawa Tengah",
          height: 2565,
          price: 650000,
          quota: 50,
          difficulty: "Mudah - Sedang",
        },
      });
      console.log("Seeded default mountain: Gunung Prau");
    }

    // Check if admins are empty
    const countAdmins = await prisma.admin.count();
    if (countAdmins === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.admin.create({
        data: {
          username: "admin",
          email: "admin@summitpass.com",
          password: hashedPassword,
          nama: "Administrator Utama",
        },
      });
      console.log("Seeded default admin: admin / admin123");
    }
  } catch (error) {
    // Log the error but do not crash the application (useful if DATABASE_URL is not yet configured)
    console.warn("Self-seeding skipped: Database connection could not be established. Please check your DATABASE_URL.", error);
  }
}

// Trigger self-seeding asynchronously
seedDatabaseIfEmpty();
