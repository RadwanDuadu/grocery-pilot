import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/grocery_pilot";
const globalForPrisma = globalThis as unknown as { groceryPilotPrisma?: PrismaClient };

export const db =
  globalForPrisma.groceryPilotPrisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.groceryPilotPrisma = db;
