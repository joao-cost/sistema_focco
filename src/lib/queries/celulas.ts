import "server-only";
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { avisos, celulas, users } from "@/db/schema";
import type { Session } from "next-auth";

export function canManageAllCelulas(session: Session) {
  return session.user.role === "coordenacao" || session.user.role === "facilitador";
}

export async function listCelulasForUser(session: Session) {
  const baseQuery = db
    .select({
      id: celulas.id,
      nome: celulas.nome,
      tema: celulas.tema,
      curso: celulas.curso,
      status: celulas.status,
      diaSemana: celulas.diaSemana,
      turno: celulas.turno,
      horario: celulas.horario,
      local: celulas.local,
      articuladorId: celulas.articuladorId,
      articuladorNome: users.name,
    })
    .from(celulas)
    .innerJoin(users, eq(celulas.articuladorId, users.id))
    .orderBy(asc(celulas.nome));

  if (canManageAllCelulas(session)) {
    return baseQuery;
  }

  return baseQuery.where(eq(celulas.articuladorId, session.user.id));
}

export async function getCelulaDetail(celulaId: string, session: Session) {
  const celula = await db.query.celulas.findFirst({
    where: eq(celulas.id, celulaId),
    with: {
      articulador: { columns: { id: true, name: true, email: true } },
      facilitadores: { with: { facilitador: { columns: { id: true, name: true } } } },
      celulandos: { orderBy: (c, { asc }) => [asc(c.nome)] },
      encontros: {
        orderBy: (e, { desc }) => [desc(e.data)],
        limit: 10,
        with: {
          registradoPor: { columns: { name: true } },
          presencas: true,
        },
      },
      avisos: {
        where: gte(avisos.validadeAte, new Date().toISOString().slice(0, 10)),
        orderBy: (a, { desc }) => [desc(a.data)],
      },
    },
  });

  if (!celula) return null;

  const isOwner = celula.articuladorId === session.user.id;
  if (!canManageAllCelulas(session) && !isOwner) {
    return null; // sem permissão — tratado como "não encontrado" pelo chamador
  }

  return { celula, canEdit: canManageAllCelulas(session) || isOwner };
}

export async function listArticuladores() {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.role, "articulador"), eq(users.ativo, true)))
    .orderBy(asc(users.name));
}

export async function listAllAvisos() {
  return db.query.avisos.findMany({
    orderBy: (a, { desc }) => [desc(a.data)],
    with: { celula: { columns: { nome: true } }, registradoPor: { columns: { name: true } } },
    limit: 50,
  });
}

export async function listFacilitadores() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.role, "facilitador"), eq(users.ativo, true)))
    .orderBy(asc(users.name));
}
