import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "core/database/schema",
  migrations: {
    path: "core/database/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
