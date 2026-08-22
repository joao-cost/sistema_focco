import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth, type UserRole } from "@/auth";

/**
 * Data Access Layer — centraliza a checagem de sessão/autorização.
 * Chame verifySession() no topo de toda Server Action e de toda página
 * que dependa de dados sensíveis (ver guia de autenticação do Next.js).
 */
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
});

export async function requireRole(...roles: UserRole[]) {
  const session = await verifySession();
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}
