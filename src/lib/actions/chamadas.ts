"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chamadaPresencas, chamadas } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { chamadaSchema } from "@/lib/validation";
import type { ActionState } from "./celulas";

export async function saveChamadaAction(
  bolsaIds: string[],
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const result = chamadaSchema.safeParse({ data: formData.get("data") });
  if (!result.success) {
    return { error: "Informe a data da reunião.", fieldErrors: result.error.flatten().fieldErrors };
  }
  const { data } = result.data;

  const presencas = bolsaIds.map((bolsaId) => ({
    bolsaId,
    presente: formData.get(`presente_${bolsaId}`) === "on",
  }));

  await db.transaction(async (tx) => {
    let [chamada] = await tx.select({ id: chamadas.id }).from(chamadas).where(eq(chamadas.data, data)).limit(1);
    if (!chamada) {
      [chamada] = await tx
        .insert(chamadas)
        .values({ data, registradoPorId: session.user.id })
        .returning({ id: chamadas.id });
    }

    await tx.delete(chamadaPresencas).where(eq(chamadaPresencas.chamadaId, chamada.id));
    if (presencas.length > 0) {
      await tx.insert(chamadaPresencas).values(presencas.map((p) => ({ chamadaId: chamada.id, ...p })));
    }
  });

  revalidatePath("/chamada");
}
