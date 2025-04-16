/* eslint-disable no-var */
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Prevents Next.js from creating multiple PrismaClient instances in development
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
