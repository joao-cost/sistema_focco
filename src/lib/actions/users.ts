"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { hashPassword } from "@/lib/password";
import { userSchema } from "@/lib/validation";
import { createPasswordResetToken } from "./auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import type { ActionState } from "./celulas";

/**
 * Senha aleatória usada só como placeholder no banco quando o usuário é
 * convidado por e-mail (ninguém precisa saber esse valor — o acesso real
 * acontece pelo link de "definir senha" enviado no convite).
 */
function randomPlaceholderPassword() {
  return randomBytes(24).toString("base64");
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("coordenacao");

  const result = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    curso: formData.get("curso") ?? "",
    telefone: formData.get("telefone") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }

  const { name, email, role, curso, telefone, password } = result.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    return { error: "Já existe um usuário com este e-mail." };
  }

  // Se a coordenação digitou uma senha, usa ela direto (fluxo manual, sem
  // e-mail). Se deixou em branco, cria com senha aleatória (que ninguém
  // conhece) e convida por e-mail com um link pra o próprio usuário definir
  // a senha dele.
  const passwordHash = await hashPassword(password || randomPlaceholderPassword());

  const [created] = await db
    .insert(users)
    .values({
      name,
      email: normalizedEmail,
      role,
      curso: curso || null,
      telefone: telefone || null,
      passwordHash,
    })
    .returning({ id: users.id });

  if (!password) {
    try {
      const token = await createPasswordResetToken(created.id);
      await sendWelcomeEmail(normalizedEmail, name, token);
    } catch (err) {
      console.error("[createUserAction] falha ao enviar convite por e-mail:", err);
    }
  }

  revalidatePath("/usuarios");
}

export async function setUserActiveAction(userId: string, ativo: boolean) {
  await requireRole("coordenacao");
  await db.update(users).set({ ativo, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/usuarios");
}

/**
 * "Redefinir senha": em vez de voltar pra uma senha padrão fixa e previsível
 * (inseguro), zera a senha atual (troca por um hash aleatório inutilizável)
 * e manda um link de definição de senha pro e-mail do usuário.
 */
export async function resetUserPasswordAction(userId: string) {
  await requireRole("coordenacao");

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return;

  const passwordHash = await hashPassword(randomPlaceholderPassword());
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

  try {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch (err) {
    console.error("[resetUserPasswordAction] falha ao enviar e-mail:", err);
  }

  revalidatePath("/usuarios");
}
