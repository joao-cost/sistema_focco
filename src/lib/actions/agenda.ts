"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { celulas, reservasSala } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { canManageAllCelulas } from "@/lib/queries/celulas";
import { findConflitos } from "@/lib/queries/agenda";
import { reservaSalaSchema } from "@/lib/validation";

export type AgendaActionState =
  | { error?: string; fieldErrors?: Record<string, string[]>; warning?: string }
  | undefined;

async function assertCanManageReserva(celulaId: string) {
  const session = await verifySession();
  if (canManageAllCelulas(session)) return session;

  const [celula] = await db
    .select({ articuladorId: celulas.articuladorId })
    .from(celulas)
    .where(eq(celulas.id, celulaId))
    .limit(1);

  if (!celula || celula.articuladorId !== session.user.id) {
    throw new Error("Você não tem permissão para gerenciar a agenda desta célula.");
  }
  return session;
}

function parseReserva(formData: FormData) {
  const tipo = formData.get("tipo");
  return reservaSalaSchema.safeParse({
    celulaId: formData.get("celulaId"),
    tipo,
    diaSemana: formData.get("diaSemana"),
    horaInicio: formData.get("horaInicio"),
    horaFim: formData.get("horaFim"),
    // Preparação é sempre na sala C1 — ignora o que vier do form pra esse tipo.
    sala: tipo === "preparacao" ? "C1" : formData.get("sala"),
    observacoes: formData.get("observacoes") ?? "",
  });
}

function formatHora(hhmm: string) {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function deriveTurno(horaInicio: string): "manha" | "tarde" | "noite" {
  const h = Number(horaInicio.split(":")[0]);
  if (h < 12) return "manha";
  if (h < 18) return "tarde";
  return "noite";
}

/**
 * A célula só tem um horário/sala fixos no cadastro (é o que aparece na
 * vitrine pública) — não faz sentido registrar de novo aqui na Agenda.
 * Sempre que uma reserva "aplicacao" (horário de célula) dessa célula muda,
 * refaz o cadastro a partir da reserva mais cedo na semana; sem nenhuma,
 * limpa os campos.
 */
async function syncCelulaHorario(celulaId: string) {
  const aplicacoes = await db.query.reservasSala.findMany({
    where: and(eq(reservasSala.celulaId, celulaId), eq(reservasSala.tipo, "aplicacao")),
    orderBy: (r, { asc }) => [asc(r.diaSemana), asc(r.horaInicio)],
  });
  const principal = aplicacoes[0];

  await db
    .update(celulas)
    .set({
      diaSemana: (principal?.diaSemana ?? null) as never,
      turno: (principal ? deriveTurno(principal.horaInicio) : null) as never,
      horario: principal ? `${formatHora(principal.horaInicio)} às ${formatHora(principal.horaFim)}` : null,
      local: principal?.sala ?? null,
      updatedAt: new Date(),
    })
    .where(eq(celulas.id, celulaId));

  revalidatePath("/celulas");
  revalidatePath(`/celulas/${celulaId}`);
  revalidatePath("/vitrine");
}

export async function createReservaAction(
  _prevState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const result = parseReserva(formData);
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }
  const { celulaId, tipo, diaSemana, horaInicio, horaFim, sala, observacoes } = result.data;

  await assertCanManageReserva(celulaId);

  const conflitos = await findConflitos({ diaSemana, sala, horaInicio, horaFim });

  await db.insert(reservasSala).values({
    celulaId,
    tipo,
    diaSemana,
    horaInicio,
    horaFim,
    sala,
    observacoes: observacoes || null,
  });

  revalidatePath("/agenda");
  if (tipo === "aplicacao") await syncCelulaHorario(celulaId);

  if (conflitos.length > 0) {
    return {
      warning: `Salvo, mas ${sala} já tem ${conflitos.map((c) => c.celula.nome).join(", ")} nesse horário.`,
    };
  }
}

export async function updateReservaAction(
  reservaId: string,
  _prevState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const result = parseReserva(formData);
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }
  const { celulaId, tipo, diaSemana, horaInicio, horaFim, sala, observacoes } = result.data;

  const [existing] = await db
    .select({ celulaId: reservasSala.celulaId, tipo: reservasSala.tipo })
    .from(reservasSala)
    .where(eq(reservasSala.id, reservaId))
    .limit(1);

  await assertCanManageReserva(celulaId);
  if (existing && existing.celulaId !== celulaId) await assertCanManageReserva(existing.celulaId);

  const conflitos = await findConflitos({ diaSemana, sala, horaInicio, horaFim, excludeId: reservaId });

  await db
    .update(reservasSala)
    .set({ celulaId, tipo, diaSemana, horaInicio, horaFim, sala, observacoes: observacoes || null, updatedAt: new Date() })
    .where(eq(reservasSala.id, reservaId));

  revalidatePath("/agenda");

  if (tipo === "aplicacao") await syncCelulaHorario(celulaId);
  if (existing?.tipo === "aplicacao" && existing.celulaId !== celulaId) await syncCelulaHorario(existing.celulaId);

  if (conflitos.length > 0) {
    return {
      warning: `Salvo, mas ${sala} já tem ${conflitos.map((c) => c.celula.nome).join(", ")} nesse horário.`,
    };
  }
}

export async function deleteReservaAction(reservaId: string) {
  const [reserva] = await db
    .select({ celulaId: reservasSala.celulaId, tipo: reservasSala.tipo })
    .from(reservasSala)
    .where(eq(reservasSala.id, reservaId))
    .limit(1);
  if (!reserva) return;

  await assertCanManageReserva(reserva.celulaId);
  await db.delete(reservasSala).where(eq(reservasSala.id, reservaId));
  revalidatePath("/agenda");

  if (reserva.tipo === "aplicacao") await syncCelulaHorario(reserva.celulaId);
}
