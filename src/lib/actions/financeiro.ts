"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { compraParticipantes, compras, movimentacoes, users, vaquinhaPagamentos } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { compraSchema, movimentacaoSchema, vaquinhaMesSchema } from "@/lib/validation";
import type { ActionState } from "./celulas";

export async function lancarVaquinhaMesAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("coordenacao", "facilitador");

  const result = vaquinhaMesSchema.safeParse({
    competencia: formData.get("competencia"),
    valorEsperado: formData.get("valorEsperado"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }
  const { competencia, valorEsperado } = result.data;

  const existente = await db
    .select({ id: vaquinhaPagamentos.id })
    .from(vaquinhaPagamentos)
    .where(eq(vaquinhaPagamentos.competencia, competencia))
    .limit(1);
  if (existente.length > 0) {
    return { error: `Já existe uma vaquinha lançada para ${competencia}.` };
  }

  const ativos = await db.select({ id: users.id }).from(users).where(eq(users.ativo, true));
  if (ativos.length > 0) {
    await db.insert(vaquinhaPagamentos).values(
      ativos.map((u) => ({
        competencia,
        userId: u.id,
        valorEsperado: valorEsperado.toFixed(2),
      }))
    );
  }

  revalidatePath("/financeiro");
}

export async function marcarVaquinhaPagaAction(pagamentoId: string, valorEsperado: string) {
  await requireRole("coordenacao", "facilitador");
  await db
    .update(vaquinhaPagamentos)
    .set({ pago: true, valorPago: valorEsperado, dataPagamento: new Date().toISOString().slice(0, 10) })
    .where(eq(vaquinhaPagamentos.id, pagamentoId));
  revalidatePath("/financeiro");
}

export async function desmarcarVaquinhaPagaAction(pagamentoId: string) {
  await requireRole("coordenacao", "facilitador");
  await db
    .update(vaquinhaPagamentos)
    .set({ pago: false, valorPago: null, dataPagamento: null })
    .where(eq(vaquinhaPagamentos.id, pagamentoId));
  revalidatePath("/financeiro");
}

export async function createCompraAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("coordenacao", "facilitador");

  const result = compraSchema.safeParse({
    descricao: formData.get("descricao"),
    valorTotal: formData.get("valorTotal"),
    data: formData.get("data"),
    participantes: formData.getAll("participantes"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }
  const { descricao, valorTotal, data, participantes } = result.data;
  const valorPorPessoa = Math.round((valorTotal / participantes.length) * 100) / 100;

  const [compra] = await db
    .insert(compras)
    .values({
      descricao,
      valorTotal: valorTotal.toFixed(2),
      data,
      registradoPorId: session.user.id,
    })
    .returning({ id: compras.id });

  await db.insert(compraParticipantes).values(
    participantes.map((userId) => ({
      compraId: compra.id,
      userId,
      valorDevido: valorPorPessoa.toFixed(2),
    }))
  );

  revalidatePath("/financeiro");
}

export async function marcarCompraPagaAction(participanteId: string) {
  await requireRole("coordenacao", "facilitador");
  await db
    .update(compraParticipantes)
    .set({ pago: true, dataPagamento: new Date().toISOString().slice(0, 10) })
    .where(eq(compraParticipantes.id, participanteId));
  revalidatePath("/financeiro");
}

export async function desmarcarCompraPagaAction(participanteId: string) {
  await requireRole("coordenacao", "facilitador");
  await db
    .update(compraParticipantes)
    .set({ pago: false, dataPagamento: null })
    .where(eq(compraParticipantes.id, participanteId));
  revalidatePath("/financeiro");
}

export async function createMovimentacaoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("coordenacao", "facilitador");

  const result = movimentacaoSchema.safeParse({
    tipo: formData.get("tipo"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    data: formData.get("data"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }
  const { tipo, descricao, valor, data } = result.data;

  await db.insert(movimentacoes).values({
    tipo,
    descricao,
    valor: valor.toFixed(2),
    data,
    registradoPorId: session.user.id,
  });

  revalidatePath("/financeiro");
}
