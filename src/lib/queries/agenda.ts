import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { reservasSala } from "@/db/schema";
import { canManageAllCelulas } from "@/lib/queries/celulas";
import type { Session } from "next-auth";

export async function listReservas(session: Session) {
  const rows = await db.query.reservasSala.findMany({
    orderBy: (r, { asc }) => [asc(r.diaSemana), asc(r.horaInicio)],
    with: {
      celula: {
        columns: { id: true, nome: true, articuladorId: true },
      },
    },
  });

  if (canManageAllCelulas(session)) return rows;
  return rows.filter((r) => r.celula.articuladorId === session.user.id);
}

/** Reservas que ocupam a mesma sala/dia em horário sobreposto (exceto ela mesma, se for edição). */
export async function findConflitos({
  diaSemana,
  sala,
  horaInicio,
  horaFim,
  excludeId,
}: {
  diaSemana: string;
  sala: string;
  horaInicio: string;
  horaFim: string;
  excludeId?: string;
}) {
  const candidatas = await db.query.reservasSala.findMany({
    where: and(
      eq(reservasSala.diaSemana, diaSemana as never),
      eq(reservasSala.sala, sala),
      excludeId ? ne(reservasSala.id, excludeId) : undefined
    ),
    with: { celula: { columns: { nome: true } } },
  });

  // Sobreposição de intervalos [horaInicio, horaFim) — strings "HH:MM" comparam certo.
  return candidatas.filter((c) => horaInicio < c.horaFim && c.horaInicio < horaFim);
}
