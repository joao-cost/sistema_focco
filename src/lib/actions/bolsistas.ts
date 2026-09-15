"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bolsaRelatorios, bolsas } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { bolsaSchema, relatorioSchema } from "@/lib/validation";
import type { ActionState } from "./celulas";

export async function createBolsaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("coordenacao", "facilitador");

  const result = bolsaSchema.safeParse({
    articuladorId: formData.get("articuladorId"),
    categoria: formData.get("categoria"),
    vigenciaInicio: formData.get("vigenciaInicio"),
    vigenciaFim: formData.get("vigenciaFim"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }

  await db.insert(bolsas).values(result.data);
  revalidatePath("/bolsistas");
}

export async function setBolsaStatusAction(bolsaId: string, status: "ativo" | "suspenso" | "encerrado") {
  await requireRole("coordenacao", "facilitador");
  await db.update(bolsas).set({ status, updatedAt: new Date() }).where(eq(bolsas.id, bolsaId));
  revalidatePath("/bolsistas");
}

export async function setDocumentacaoStatusAction(bolsaId: string, status: "completa" | "pendente") {
  await requireRole("coordenacao", "facilitador");
  await db.update(bolsas).set({ documentacaoStatus: status, updatedAt: new Date() }).where(eq(bolsas.id, bolsaId));
  revalidatePath("/bolsistas");
}

export async function addRelatorioAction(
  bolsaId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("coordenacao", "facilitador");

  const result = relatorioSchema.safeParse({
    data: formData.get("data"),
    status: formData.get("status"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }

  await db.insert(bolsaRelatorios).values({ bolsaId, ...result.data });
  revalidatePath("/bolsistas");
}
