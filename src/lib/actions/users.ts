"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { hashPassword } from "@/lib/password";
import { userSchema } from "@/lib/validation";
import type { ActionState } from "./celulas";

const DEFAULT_PASSWORD = "focco123";

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

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    return { error: "Já existe um usuário com este e-mail." };
  }

  const passwordHash = await hashPassword(password || DEFAULT_PASSWORD);

  await db.insert(users).values({
    name,
    email: email.toLowerCase(),
    role,
    curso: curso || null,
    telefone: telefone || null,
    passwordHash,
  });

  revalidatePath("/usuarios");
}

export async function setUserActiveAction(userId: string, ativo: boolean) {
  await requireRole("coordenacao");
  await db.update(users).set({ ativo, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/usuarios");
}

export async function resetUserPasswordAction(userId: string) {
  await requireRole("coordenacao");
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/usuarios");
}
