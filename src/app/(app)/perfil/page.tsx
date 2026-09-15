import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { Card } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export default async function PerfilPage() {
  const session = await verifySession();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      telefone: users.telefone,
      role: users.role,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Minhas configurações</h1>
        <p className="text-sm text-muted">Sua foto, dados de contato, senha e preferências de tema.</p>
      </div>

      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="m-0 text-sm font-semibold text-foreground">Tema</p>
          <p className="m-0 text-xs text-muted">Alterna entre claro e escuro (fica salvo neste navegador).</p>
        </div>
        <ThemeToggle />
      </Card>

      <Card className="p-5">
        <p className="mb-1 text-sm font-semibold text-foreground">Dados e foto</p>
        <p className="mb-4 text-xs text-muted">
          {user.email} · {ROLE_LABELS[user.role]}
        </p>
        <ProfileForm name={user.name} telefone={user.telefone} avatarUrl={user.avatarUrl} />
      </Card>

      <Card className="p-5">
        <p className="mb-1 text-sm font-semibold text-foreground">Alterar senha</p>
        <p className="mb-4 text-xs text-muted">Peça a senha atual antes de trocar, por segurança.</p>
        <PasswordForm />
      </Card>
    </div>
  );
}
