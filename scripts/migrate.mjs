// Runner de migrations para produção (Docker) — não depende do drizzle-kit
// nem do TypeScript, só de pacotes JS puros já presentes na imagem final.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Migrations (DDL) devem rodar na conexão DIRETA, não no pooler em modo
// "transaction" (Supabase Supavisor / PgBouncer) — use DIRECT_URL quando
// disponível; caso contrário cai para DATABASE_URL (Docker/VPS sem pooler).
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DIRECT_URL/DATABASE_URL não definida — abortando migrations.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

console.log("Aplicando migrations do banco de dados...");
await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations aplicadas com sucesso.");
await sql.end();
