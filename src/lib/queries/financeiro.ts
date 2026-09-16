import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { compraParticipantes, movimentacoes, users, vaquinhaPagamentos } from "@/db/schema";

export async function listActiveUsers() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.ativo, true))
    .orderBy(users.name);
}

/** Últimas competências já lançadas (mais recente primeiro), sem repetir. */
export async function listVaquinhaCompetencias() {
  const rows = await db
    .selectDistinct({ competencia: vaquinhaPagamentos.competencia })
    .from(vaquinhaPagamentos)
    .orderBy(desc(vaquinhaPagamentos.competencia));
  return rows.map((r) => r.competencia);
}

export async function getVaquinhaDoMes(competencia: string) {
  return db.query.vaquinhaPagamentos.findMany({
    where: eq(vaquinhaPagamentos.competencia, competencia),
    orderBy: (v, { asc }) => [asc(v.createdAt)],
    with: { user: { columns: { id: true, name: true } } },
  });
}

export async function listCompras() {
  return db.query.compras.findMany({
    orderBy: (c, { desc }) => [desc(c.data)],
    with: { participantes: { with: { user: { columns: { id: true, name: true } } } } },
  });
}

/** Saldo em caixa: pagamentos de vaquinha + compras recebidos, mais/menos movimentações avulsas. */
export async function getSaldoCaixa() {
  const [vaquinha] = await db
    .select({ total: sql<string>`coalesce(sum(${vaquinhaPagamentos.valorPago}), 0)` })
    .from(vaquinhaPagamentos)
    .where(eq(vaquinhaPagamentos.pago, true));

  const [compra] = await db
    .select({ total: sql<string>`coalesce(sum(${compraParticipantes.valorDevido}), 0)` })
    .from(compraParticipantes)
    .where(eq(compraParticipantes.pago, true));

  const [entradas] = await db
    .select({ total: sql<string>`coalesce(sum(${movimentacoes.valor}), 0)` })
    .from(movimentacoes)
    .where(eq(movimentacoes.tipo, "entrada"));

  const [saidas] = await db
    .select({ total: sql<string>`coalesce(sum(${movimentacoes.valor}), 0)` })
    .from(movimentacoes)
    .where(eq(movimentacoes.tipo, "saida"));

  const saldo =
    Number(vaquinha.total) + Number(compra.total) + Number(entradas.total) - Number(saidas.total);

  return { saldo, recebidoVaquinha: Number(vaquinha.total), recebidoCompras: Number(compra.total) };
}

export async function listMovimentacoes(limit = 20) {
  return db.query.movimentacoes.findMany({
    orderBy: (m, { desc }) => [desc(m.data), desc(m.createdAt)],
    limit,
  });
}

export function nextCompetencia() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

/** Mês seguinte a uma competência "AAAA-MM" já lançada. */
export function incrementCompetencia(competencia: string) {
  const [ano, mes] = competencia.split("-").map(Number);
  const next = new Date(ano, mes, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}
