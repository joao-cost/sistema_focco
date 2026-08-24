import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Conexão direta para gerar/rodar migrations (ver DIRECT_URL no .env.example).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
