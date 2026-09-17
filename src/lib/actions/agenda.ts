"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
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

  await assertCanManageReserva(celulaId);

  const conflitos = await findConflitos({ diaSemana, sala, horaInicio, horaFim, excludeId: reservaId });

  await db
    .update(reservasSala)
    .set({ celulaId, tipo, diaSemana, horaInicio, horaFim, sala, observacoes: observacoes || null, updatedAt: new Date() })
    .where(eq(reservasSala.id, reservaId));

  revalidatePath("/agenda");

  if (conflitos.length > 0) {
    return {
      warning: `Salvo, mas ${sala} já tem ${conflitos.map((c) => c.celula.nome).join(", ")} nesse horário.`,
    };
  }
}

export async function deleteReservaAction(reservaId: string) {
  const [reserva] = await db
    .select({ celulaId: reservasSala.celulaId })
    .from(reservasSala)
    .where(eq(reservasSala.id, reservaId))
    .limit(1);
  if (!reserva) return;

  await assertCanManageReserva(reserva.celulaId);
  await db.delete(reservasSala).where(eq(reservasSala.id, reservaId));
  revalidatePath("/agenda");
}
