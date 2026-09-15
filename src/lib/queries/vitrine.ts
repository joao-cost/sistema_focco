import "server-only";
import { asc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { celulas, users } from "@/db/schema";

/**
 * Cores da marca, ciclando por card — mesma lógica do protótipo da vitrine.
 * Classes completas (não interpoladas) pra o Tailwind conseguir detectar
 * estaticamente e gerar o CSS — ver https://tailwindcss.com/docs/detecting-classes-in-source-files.
 */
export const VITRINE_ACCENTS = [
  { bg: "bg-focco-green", text: "text-focco-green-dark", border: "border-focco-green-pale" },
  { bg: "bg-focco-blue", text: "text-focco-blue-dark", border: "border-focco-blue-pale" },
  { bg: "bg-focco-orange", text: "text-focco-orange-dark", border: "border-focco-orange-pale" },
  { bg: "bg-focco-pink", text: "text-focco-pink-dark", border: "border-focco-pink-pale" },
  { bg: "bg-focco-red", text: "text-focco-red-dark", border: "border-focco-red-pale" },
] as const;

export async function listVitrineCelulas() {
  const rows = await db
    .select({
      id: celulas.id,
      nome: celulas.nome,
      status: celulas.status,
      diaSemana: celulas.diaSemana,
      turno: celulas.turno,
      horario: celulas.horario,
      local: celulas.local,
      descricaoPublica: celulas.descricaoPublica,
      whatsappLink: celulas.whatsappLink,
      articuladorNome: users.name,
    })
    .from(celulas)
    .innerJoin(users, eq(celulas.articuladorId, users.id))
    .where(ne(celulas.status, "encerrada"))
    .orderBy(asc(celulas.nome));

  return rows.map((c, i) => ({ ...c, accent: VITRINE_ACCENTS[i % VITRINE_ACCENTS.length] }));
}
