import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __focco_pg_client__: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Configure o arquivo .env.");
}

// Tamanho do pool de conexões por instância do app.
// - Docker/VPS (processo único e persistente): pode ser maior (padrão 10).
// - Serverless (Vercel + pooler do Supabase): mantenha baixo (1-2), já que
//   cada invocação de função é curta e o Supavisor cuida do pooling real.
const maxConnections = Number(process.env.DATABASE_POOL_MAX) || 10;

// `prepare: false` é necessário quando a conexão passa pelo pooler em modo
// "transaction" (Supabase/PgBouncer) — prepared statements não sobrevivem
// entre transações nesse modo. Não tem custo real em conexão direta.
const client =
  global.__focco_pg_client__ ??
  postgres(connectionString, { max: maxConnections, prepare: false });

if (process.env.NODE_ENV !== "production") {
  global.__focco_pg_client__ = client;
}

export const db = drizzle(client, { schema });
export * as schema from "./schema";
