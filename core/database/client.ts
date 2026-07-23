import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { env, requireEnv } from "@core/env";

type PrismaGlobal = typeof globalThis & {
  __argocorePgPool?: Pool;
  __argocorePrisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

function createPool(): Pool {
  return new Pool({ connectionString: requireEnv("DATABASE_URL") });
}

function createPrismaClient(pool: Pool): PrismaClient {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const pgPool = globalForPrisma.__argocorePgPool ?? createPool();
export const db = globalForPrisma.__argocorePrisma ?? createPrismaClient(pgPool);

if (env.NODE_ENV !== "production") {
  globalForPrisma.__argocorePgPool = pgPool;
  globalForPrisma.__argocorePrisma = db;
}
