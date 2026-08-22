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

// Reaproveita a conexão em dev (hot reload) para não esgotar o pool.
const client =
  global.__focco_pg_client__ ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== "production") {
  global.__focco_pg_client__ = client;
}

export const db = drizzle(client, { schema });
export * as schema from "./schema";
