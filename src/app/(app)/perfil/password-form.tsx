"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/profile";
import { Button, Field, FormError, Input } from "@/components/ui";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Senha atual" htmlFor="currentPassword" error={state?.fieldErrors?.currentPassword?.[0]}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nova senha" htmlFor="newPassword" error={state?.fieldErrors?.newPassword?.[0]}>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={6} />
      </Field>
      <Field label="Confirme a nova senha" htmlFor="confirmPassword" error={state?.fieldErrors?.confirmPassword?.[0]}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={6} />
      </Field>

      {state?.success && (
        <p className="rounded-lg border border-focco-green/25 bg-focco-green-pale/60 px-3.5 py-2.5 text-sm font-medium text-focco-green-dark">
          {state.success}
        </p>
      )}
      <FormError message={state?.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
