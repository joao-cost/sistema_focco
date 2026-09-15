import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bolsas, chamadas } from "@/db/schema";

/** Bolsistas ativos + se estão presentes na chamada da data informada (se já existir). */
export async function getChamadaDoDia(data: string) {
  const bolsistasAtivos = await db.query.bolsas.findMany({
    where: eq(bolsas.status, "ativo"),
    orderBy: (b, { asc }) => [asc(b.createdAt)],
    with: {
      articulador: {
        columns: { id: true, name: true },
        with: { celulasComoArticulador: { columns: { nome: true }, limit: 1 } },
      },
    },
  });

  const chamada = await db.query.chamadas.findFirst({
    where: eq(chamadas.data, data),
    with: { presencas: true },
  });
  const presencaMap = new Map((chamada?.presencas ?? []).map((p) => [p.bolsaId, p.presente]));

  return bolsistasAtivos.map((b) => ({
    bolsaId: b.id,
    nome: b.articulador.name,
    celulaNome: b.articulador.celulasComoArticulador[0]?.nome ?? null,
    presente: presencaMap.get(b.id) ?? false,
  }));
}

export async function listChamadasAnteriores(limit = 8) {
  const rows = await db.query.chamadas.findMany({
    orderBy: (c, { desc }) => [desc(c.data)],
    limit,
    with: { presencas: true },
  });
  return rows.map((c) => ({
    id: c.id,
    data: c.data,
    presentes: c.presencas.filter((p) => p.presente).length,
    total: c.presencas.length,
  }));
}
