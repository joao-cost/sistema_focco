"use server";

import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { requestPasswordResetSchema, resetPasswordSchema } from "@/lib/validation";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export type ResetActionState =
  | { error?: string; fieldErrors?: Record<string, string[]>; success?: string }
  | undefined;

/** Cria um token de redefinição/definição de senha e envia o e-mail correspondente. */
export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });
  return token;
}

export async function requestPasswordResetAction(
  _prevState: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const result = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!result.success) {
    return { error: "Verifique o e-mail informado.", fieldErrors: result.error.flatten().fieldErrors };
  }

  const email = result.data.email.toLowerCase().trim();

  // Mensagem sempre genérica — não revela se o e-mail existe na base.
  const genericSuccess = {
    success:
      "Se esse e-mail estiver cadastrado, enviamos um link de redefinição. Confira sua caixa de entrada (e o spam).",
  };

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, ativo: users.ativo })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.ativo) {
    return genericSuccess;
  }

  try {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch (err) {
    console.error("[requestPasswordResetAction] falha ao gerar/enviar token:", err);
  }

  return genericSuccess;
}

export async function resetPasswordAction(
  _prevState: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const result = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }

  const { token, password } = result.data;
  const tokenHash = hashToken(token);

  const [record] = await db
    .select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!record) {
    return { error: "Link inválido ou expirado. Solicite um novo link." };
  }

  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, record.userId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));
  });

  redirect("/login?senha-redefinida=1");
}
