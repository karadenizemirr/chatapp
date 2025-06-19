import { PrismaClient } from "@prisma/client";

// PrismaClient'ı global olarak tanımlayarak hot-reloading sorunlarını önlüyoruz
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;