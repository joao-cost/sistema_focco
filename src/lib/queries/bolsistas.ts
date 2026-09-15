import "server-only";
import { and, eq, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { bolsas, users } from "@/db/schema";

/** "Em dia" se o relatório mais recente foi entregue (ou não há nenhum ainda); "Atrasado" senão. */
export function computeRelatoriosStatus(relatorios: { status: "entregue" | "atrasado" }[]) {
  if (relatorios.length === 0) return "em_dia" as const;
  return relatorios[0].status === "atrasado" ? ("atrasado" as const) : ("em_dia" as const);
}

export async function listBolsistas() {
  const rows = await db.query.bolsas.findMany({
    orderBy: (b, { desc }) => [desc(b.createdAt)],
    with: {
      articulador: {
        columns: { id: true, name: true, ativo: true },
        with: { celulasComoArticulador: { columns: { nome: true }, limit: 1 } },
      },
      relatorios: { orderBy: (r, { desc }) => [desc(r.data)] },
    },
  });

  return rows.map((b) => ({
    ...b,
    celulaNome: b.articulador.celulasComoArticulador[0]?.nome ?? null,
    relatoriosStatus: computeRelatoriosStatus(b.relatorios),
  }));
}

export async function getBolsista(bolsaId: string) {
  const b = await db.query.bolsas.findFirst({
    where: eq(bolsas.id, bolsaId),
    with: {
      articulador: { columns: { id: true, name: true } },
      relatorios: { orderBy: (r, { desc }) => [desc(r.data)] },
    },
  });
  return b ?? null;
}

/** Articuladores ativos que ainda não têm nenhuma bolsa cadastrada — pro formulário de "novo bolsista". */
export async function listArticuladoresSemBolsa() {
  const jaBolsistas = await db.selectDistinct({ id: bolsas.articuladorId }).from(bolsas);
  const idsExcluidos = jaBolsistas.map((b) => b.id);

  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(
      idsExcluidos.length > 0
        ? and(eq(users.role, "articulador"), eq(users.ativo, true), notInArray(users.id, idsExcluidos))
        : and(eq(users.role, "articulador"), eq(users.ativo, true))
    )
    .orderBy(users.name);
}
