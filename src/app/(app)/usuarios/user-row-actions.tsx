"use client";

import { Button } from "@/components/ui";
import { resetUserPasswordAction, setUserActiveAction } from "@/lib/actions/users";

export function UserRowActions({ userId, ativo }: { userId: string; ativo: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <form action={setUserActiveAction.bind(null, userId, !ativo)}>
        <Button type="submit" variant="secondary" size="sm">
          {ativo ? "Desativar" : "Reativar"}
        </Button>
      </form>
      <form action={resetUserPasswordAction.bind(null, userId)}>
        <Button type="submit" variant="ghost" size="sm">
          Redefinir senha
        </Button>
      </form>
    </div>
  );
}
