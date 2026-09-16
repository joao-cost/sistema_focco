"use server";

import { revalidatePath } from "next/cache";
import { unlink, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema, profileSchema } from "@/lib/validation";
import { deleteFromR2ByUrl, isR2Configured, uploadToR2 } from "@/lib/storage";

export type ProfileActionState =
  | { error?: string; fieldErrors?: Record<string, string[]>; success?: string }
  | undefined;

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await verifySession();

  const result = profileSchema.safeParse({
    name: formData.get("name"),
    telefone: formData.get("telefone") ?? "",
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }

  const { name, telefone } = result.data;
  const updates: { name: string; telefone: string | null; updatedAt: Date; avatarUrl?: string } = {
    name,
    telefone: telefone || null,
    updatedAt: new Date(),
  };

  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!ALLOWED_TYPES[avatarFile.type]) {
      return { error: "Foto precisa ser PNG, JPG ou WEBP." };
    }
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      return { error: "Foto muito grande (máximo 3MB)." };
    }

    const [current] = await db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const ext = ALLOWED_TYPES[avatarFile.type];
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const bytes = Buffer.from(await avatarFile.arrayBuffer());

    if (isR2Configured) {
      updates.avatarUrl = await uploadToR2(`avatars/${filename}`, bytes, avatarFile.type);
      if (current?.avatarUrl) await deleteFromR2ByUrl(current.avatarUrl);
    } else {
      // Fallback local em disco — útil em dev sem precisar configurar o R2
      // (ver README > variáveis R2_*). Em produção, o volume Docker
      // "focco_uploads" cobre esse caminho se o R2 não estiver configurado.
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, filename), bytes);
      updates.avatarUrl = `/uploads/avatars/${filename}`;
      if (current?.avatarUrl?.startsWith("/uploads/avatars/")) {
        await unlink(path.join(process.cwd(), "public", current.avatarUrl)).catch(() => {
          // Falha ao apagar a foto antiga não é crítica — só fica um arquivo órfão.
        });
      }
    }
  }

  await db.update(users).set(updates).where(eq(users.id, session.user.id));

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { success: "Dados atualizados." };
}

export async function changePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await verifySession();

  const result = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!result.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: result.error.flatten().fieldErrors };
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!user) return { error: "Usuário não encontrado." };

  const valid = await verifyPassword(result.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Senha atual incorreta.", fieldErrors: { currentPassword: ["Senha atual incorreta."] } };
  }

  const passwordHash = await hashPassword(result.data.newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, session.user.id));

  return { success: "Senha atualizada com sucesso." };
}
