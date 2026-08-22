import "server-only";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { avisos, celulandos, celulas, encontros, presencas, users } from "@/db/schema";

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function getDashboardStats() {
  const [celulasPorStatus, celulandosAtivos, encontros30d, presencaStats, encontrosPorCelula, avisosAtivos, totalArticuladores] =
    await Promise.all([
      db
        .select({ status: celulas.status, total: count() })
        .from(celulas)
        .groupBy(celulas.status),

      db
        .select({ total: count() })
        .from(celulandos)
        .where(eq(celulandos.status, "ativo"))
        .then((r) => r[0]?.total ?? 0),

      db
        .select({ total: count() })
        .from(encontros)
        .where(gte(encontros.data, daysAgoISO(30)))
        .then((r) => r[0]?.total ?? 0),

      db
        .select({
          totalPresencas: count(),
          presentes: sql<number>`count(*) filter (where ${presencas.presente})`,
        })
        .from(presencas)
        .innerJoin(encontros, eq(presencas.encontroId, encontros.id))
        .where(gte(encontros.data, daysAgoISO(30)))
        .then((r) => r[0] ?? { totalPresencas: 0, presentes: 0 }),

      db
        .select({ nome: celulas.nome, total: count(encontros.id) })
        .from(celulas)
        .leftJoin(encontros, eq(encontros.celulaId, celulas.id))
        .groupBy(celulas.id, celulas.nome)
        .orderBy(celulas.nome),

      db.query.avisos.findMany({
        where: gte(avisos.validadeAte, daysAgoISO(0)),
        orderBy: (a, { desc }) => [desc(a.data)],
        with: { celula: { columns: { nome: true } } },
        limit: 8,
      }),

      db
        .select({ total: count() })
        .from(users)
        .where(and(eq(users.role, "articulador"), eq(users.ativo, true)))
        .then((r) => r[0]?.total ?? 0),
    ]);

  const statusMap: Record<string, number> = { ativa: 0, inativa: 0, encerrada: 0 };
  for (const row of celulasPorStatus) statusMap[row.status] = row.total;

  const totalPresencas = Number(presencaStats.totalPresencas ?? 0);
  const presentes = Number(presencaStats.presentes ?? 0);
  const taxaPresenca = totalPresencas > 0 ? Math.round((presentes / totalPresencas) * 100) : null;

  return {
    celulasPorStatus: statusMap,
    totalCelulas: statusMap.ativa + statusMap.inativa + statusMap.encerrada,
    celulandosAtivos,
    encontros30d,
    taxaPresenca,
    encontrosPorCelula,
    avisosAtivos,
    totalArticuladores,
  };
}
