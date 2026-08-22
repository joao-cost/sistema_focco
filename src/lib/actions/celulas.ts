"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { celulandos, celulas, encontros, presencas, avisos } from "@/db/schema";
import { verifySession, requireRole } from "@/lib/dal";
import { canManageAllCelulas } from "@/lib/queries/celulas";
import {
  avisoSchema,
  celulaSchema,
  celulandoSchema,
  encontroSchema,
} from "@/lib/validation";

export type ActionState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

function parseOrError<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } },
  raw: unknown
): { data: T } | { error: ActionState } {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { error: { error: "Verifique os campos destacados.", fieldErrors: result.error!.flatten().fieldErrors } };
  }
  return { data: result.data as T };
}

async function assertCanEditCelula(celulaId: string) {
  const session = await verifySession();
  if (canManageAllCelulas(session)) return session;

  const [celula] = await db
    .select({ articuladorId: celulas.articuladorId })
    .from(celulas)
    .where(eq(celulas.id, celulaId))
    .limit(1);

  if (!celula || celula.articuladorId !== session.user.id) {
    throw new Error("Você não tem permissão para editar esta célula.");
  }
  return session;
}

// ---------------------------------------------------------------------------
// Células
// ---------------------------------------------------------------------------

export async function createCelulaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("coordenacao", "facilitador");

  const parsed = parseOrError(celulaSchema, {
    nome: formData.get("nome"),
    tema: formData.get("tema") ?? "",
    curso: formData.get("curso") ?? "",
    articuladorId: formData.get("articuladorId"),
    diaSemana: formData.get("diaSemana") ?? "",
    turno: formData.get("turno") ?? "",
    horario: formData.get("horario") ?? "",
    local: formData.get("local") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });
  if ("error" in parsed) return parsed.error;

  const { nome, tema, curso, articuladorId, diaSemana, turno, horario, local, observacoes } =
    parsed.data as z_CelulaInput;

  const [created] = await db
    .insert(celulas)
    .values({
      nome,
      tema: tema || null,
      curso: curso || null,
      articuladorId,
      diaSemana: (diaSemana || null) as never,
      turno: (turno || null) as never,
      horario: horario || null,
      local: local || null,
      observacoes: observacoes || null,
    })
    .returning({ id: celulas.id });

  revalidatePath("/celulas");
  redirect(`/celulas/${created.id}`);
}

export async function updateCelulaAction(
  celulaId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertCanEditCelula(celulaId);

  const parsed = parseOrError(celulaSchema, {
    nome: formData.get("nome"),
    tema: formData.get("tema") ?? "",
    curso: formData.get("curso") ?? "",
    articuladorId: formData.get("articuladorId"),
    diaSemana: formData.get("diaSemana") ?? "",
    turno: formData.get("turno") ?? "",
    horario: formData.get("horario") ?? "",
    local: formData.get("local") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });
  if ("error" in parsed) return parsed.error;

  const { nome, tema, curso, articuladorId, diaSemana, turno, horario, local, observacoes } =
    parsed.data as z_CelulaInput;

  await db
    .update(celulas)
    .set({
      nome,
      tema: tema || null,
      curso: curso || null,
      articuladorId,
      diaSemana: (diaSemana || null) as never,
      turno: (turno || null) as never,
      horario: horario || null,
      local: local || null,
      observacoes: observacoes || null,
      updatedAt: new Date(),
    })
    .where(eq(celulas.id, celulaId));

  revalidatePath("/celulas");
  revalidatePath(`/celulas/${celulaId}`);
  redirect(`/celulas/${celulaId}`);
}

export async function changeCelulaStatusAction(celulaId: string, status: "ativa" | "inativa" | "encerrada") {
  await assertCanEditCelula(celulaId);
  await db.update(celulas).set({ status, updatedAt: new Date() }).where(eq(celulas.id, celulaId));
  revalidatePath("/celulas");
  revalidatePath(`/celulas/${celulaId}`);
}

// ---------------------------------------------------------------------------
// Celulandos
// ---------------------------------------------------------------------------

export async function addCelulandoAction(
  celulaId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertCanEditCelula(celulaId);

  const parsed = parseOrError(celulandoSchema, {
    nome: formData.get("nome"),
    email: formData.get("email") ?? "",
    matricula: formData.get("matricula") ?? "",
    curso: formData.get("curso") ?? "",
    telefone: formData.get("telefone") ?? "",
  });
  if ("error" in parsed) return parsed.error;

  const { nome, email, matricula, curso, telefone } = parsed.data as z_CelulandoInput;

  await db.insert(celulandos).values({
    celulaId,
    nome,
    email: email || null,
    matricula: matricula || null,
    curso: curso || null,
    telefone: telefone || null,
  });

  revalidatePath(`/celulas/${celulaId}`);
}

export async function setCelulandoStatusAction(
  celulaId: string,
  celulandoId: string,
  status: "ativo" | "inativo" | "desistente"
) {
  await assertCanEditCelula(celulaId);
  await db
    .update(celulandos)
    .set({ status, updatedAt: new Date() })
    .where(eq(celulandos.id, celulandoId));
  revalidatePath(`/celulas/${celulaId}`);
}

// ---------------------------------------------------------------------------
// Encontros + presenças
// ---------------------------------------------------------------------------

export async function createEncontroAction(
  celulaId: string,
  celulandoIds: string[],
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await assertCanEditCelula(celulaId);

  const parsed = parseOrError(encontroSchema, {
    data: formData.get("data"),
    conteudoTrabalhado: formData.get("conteudoTrabalhado") ?? "",
    duracaoMinutos: formData.get("duracaoMinutos") || undefined,
    processamentoGrupo: formData.get("processamentoGrupo") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });
  if ("error" in parsed) return parsed.error;

  const { data, conteudoTrabalhado, duracaoMinutos, processamentoGrupo, observacoes } =
    parsed.data as z_EncontroInput;

  const [encontro] = await db
    .insert(encontros)
    .values({
      celulaId,
      data,
      conteudoTrabalhado: conteudoTrabalhado || null,
      duracaoMinutos: duracaoMinutos ?? null,
      processamentoGrupo: processamentoGrupo || null,
      observacoes: observacoes || null,
      registradoPorId: session.user.id,
    })
    .returning({ id: encontros.id });

  if (celulandoIds.length > 0) {
    await db.insert(presencas).values(
      celulandoIds.map((celulandoId) => ({
        encontroId: encontro.id,
        celulandoId,
        presente: formData.get(`presente_${celulandoId}`) === "on",
        justificativa: (formData.get(`justificativa_${celulandoId}`) as string) || null,
      }))
    );
  }

  revalidatePath(`/celulas/${celulaId}`);
  redirect(`/celulas/${celulaId}`);
}

// ---------------------------------------------------------------------------
// Avisos temporários
// ---------------------------------------------------------------------------

export async function createAvisoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const rawCelulaId = (formData.get("celulaId") as string) || "";
  if (rawCelulaId) {
    await assertCanEditCelula(rawCelulaId);
  }

  const parsed = parseOrError(avisoSchema, {
    celulaId: rawCelulaId,
    data: formData.get("data"),
    horario: formData.get("horario") ?? "",
    mensagem: formData.get("mensagem"),
    validadeAte: formData.get("validadeAte"),
  });
  if ("error" in parsed) return parsed.error;

  const { celulaId, data, horario, mensagem, validadeAte } = parsed.data as z_AvisoInput;

  await db.insert(avisos).values({
    celulaId: celulaId || null,
    data,
    horario: horario || null,
    mensagem,
    validadeAte,
    registradoPorId: session.user.id,
  });

  revalidatePath("/celulas");
  if (celulaId) revalidatePath(`/celulas/${celulaId}`);
}

// ---------------------------------------------------------------------------
// Tipos auxiliares (evitam repetir os schemas Zod como tipos inline)
// ---------------------------------------------------------------------------

type z_CelulaInput = {
  nome: string;
  tema?: string;
  curso?: string;
  articuladorId: string;
  diaSemana?: string;
  turno?: string;
  horario?: string;
  local?: string;
  observacoes?: string;
};

type z_CelulandoInput = {
  nome: string;
  email?: string;
  matricula?: string;
  curso?: string;
  telefone?: string;
};

type z_EncontroInput = {
  data: string;
  conteudoTrabalhado?: string;
  duracaoMinutos?: number;
  processamentoGrupo?: string;
  observacoes?: string;
};

type z_AvisoInput = {
  celulaId?: string;
  data: string;
  horario?: string;
  mensagem: string;
  validadeAte: string;
};
