"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { unlink, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { celulandos, celulas, encontros, presencas, avisos } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { canManageAllCelulas, getCelulaRecipients } from "@/lib/queries/celulas";
import { sendAvisoNotificationEmail } from "@/lib/email";
import { deleteFromR2ByUrl, isR2Configured, uploadToR2 } from "@/lib/storage";
import {
  avisoSchema,
  celulaSchema,
  celulandoSchema,
  encontroSchema,
} from "@/lib/validation";

export type ActionState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

const MAX_LOGO_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const LOGO_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "celulas");

/** Sobe o logo pro R2 (ou disco local em dev) e apaga o anterior, se houver. */
async function uploadCelulaLogo(file: File, current: string | null): Promise<string> {
  const ext = ALLOWED_LOGO_TYPES[file.type];
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isR2Configured) {
    const url = await uploadToR2(`celulas/${filename}`, bytes, file.type);
    if (current) await deleteFromR2ByUrl(current);
    return url;
  }

  await mkdir(LOGO_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOGO_UPLOAD_DIR, filename), bytes);
  if (current?.startsWith("/uploads/celulas/")) {
    await unlink(path.join(process.cwd(), "public", current)).catch(() => {});
  }
  return `/uploads/celulas/${filename}`;
}

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
  const session = await verifySession();

  const logoFile = formData.get("logo");
  if (!(logoFile instanceof File) || logoFile.size === 0) {
    return { error: "Envie um logo para a célula." };
  }
  if (!ALLOWED_LOGO_TYPES[logoFile.type]) {
    return { error: "Logo precisa ser PNG, JPG ou WEBP." };
  }
  if (logoFile.size > MAX_LOGO_BYTES) {
    return { error: "Logo muito grande (máximo 3MB)." };
  }

  const parsed = parseOrError(celulaSchema, {
    nome: formData.get("nome"),
    tema: formData.get("tema") ?? "",
    curso: formData.get("curso") ?? "",
    diaSemana: formData.get("diaSemana") ?? "",
    turno: formData.get("turno") ?? "",
    horario: formData.get("horario") ?? "",
    local: formData.get("local") ?? "",
    observacoes: formData.get("observacoes") ?? "",
    descricaoPublica: formData.get("descricaoPublica") ?? "",
    whatsappLink: formData.get("whatsappLink") ?? "",
  });
  if ("error" in parsed) return parsed.error;

  const {
    nome,
    tema,
    curso,
    diaSemana,
    turno,
    horario,
    local,
    observacoes,
    descricaoPublica,
    whatsappLink,
  } = parsed.data as z_CelulaInput;

  const logoUrl = await uploadCelulaLogo(logoFile, null);

  const [created] = await db
    .insert(celulas)
    .values({
      nome,
      tema: tema || null,
      curso: curso || null,
      articuladorId: session.user.id,
      diaSemana: (diaSemana || null) as never,
      turno: (turno || null) as never,
      horario: horario || null,
      local: local || null,
      logoUrl,
      observacoes: observacoes || null,
      descricaoPublica: descricaoPublica || null,
      whatsappLink: whatsappLink || null,
    })
    .returning({ id: celulas.id });

  revalidatePath("/celulas");
  revalidatePath("/vitrine");
  redirect(`/celulas/${created.id}`);
}

export async function updateCelulaAction(
  celulaId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertCanEditCelula(celulaId);

  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_LOGO_TYPES[logoFile.type]) {
      return { error: "Logo precisa ser PNG, JPG ou WEBP." };
    }
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { error: "Logo muito grande (máximo 3MB)." };
    }
  }

  const parsed = parseOrError(celulaSchema, {
    nome: formData.get("nome"),
    tema: formData.get("tema") ?? "",
    curso: formData.get("curso") ?? "",
    diaSemana: formData.get("diaSemana") ?? "",
    turno: formData.get("turno") ?? "",
    horario: formData.get("horario") ?? "",
    local: formData.get("local") ?? "",
    observacoes: formData.get("observacoes") ?? "",
    descricaoPublica: formData.get("descricaoPublica") ?? "",
    whatsappLink: formData.get("whatsappLink") ?? "",
  });
  if ("error" in parsed) return parsed.error;

  const {
    nome,
    tema,
    curso,
    diaSemana,
    turno,
    horario,
    local,
    observacoes,
    descricaoPublica,
    whatsappLink,
  } = parsed.data as z_CelulaInput;

  const updates: Record<string, unknown> = {
    nome,
    tema: tema || null,
    curso: curso || null,
    diaSemana: (diaSemana || null) as never,
    turno: (turno || null) as never,
    horario: horario || null,
  };

  if (logoFile instanceof File && logoFile.size > 0) {
    const [current] = await db.select({ logoUrl: celulas.logoUrl }).from(celulas).where(eq(celulas.id, celulaId)).limit(1);
    updates.logoUrl = await uploadCelulaLogo(logoFile, current?.logoUrl ?? null);
  }

  await db
    .update(celulas)
    .set({
      ...updates,
      local: local || null,
      observacoes: observacoes || null,
      descricaoPublica: descricaoPublica || null,
      whatsappLink: whatsappLink || null,
      updatedAt: new Date(),
    })
    .where(eq(celulas.id, celulaId));

  revalidatePath("/celulas");
  revalidatePath(`/celulas/${celulaId}`);
  revalidatePath("/vitrine");
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

  // Notifica por e-mail quem acompanha a célula (best-effort — uma falha de
  // envio não deve impedir o aviso de ter sido registrado).
  if (celulaId) {
    try {
      const { celulaNome, recipients } = await getCelulaRecipients(celulaId);
      await Promise.all(
        recipients
          .filter((r) => r.email !== session.user.email)
          .map((r) =>
            sendAvisoNotificationEmail(r.email, r.name, {
              celulaNome,
              data,
              horario: horario || null,
              mensagem,
            })
          )
      );
    } catch (err) {
      console.error("[createAvisoAction] falha ao enviar notificações:", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Tipos auxiliares (evitam repetir os schemas Zod como tipos inline)
// ---------------------------------------------------------------------------

type z_CelulaInput = {
  nome: string;
  tema?: string;
  curso?: string;
  diaSemana?: string;
  turno?: string;
  horario?: string;
  local?: string;
  observacoes?: string;
  descricaoPublica: string;
  whatsappLink?: string;
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
