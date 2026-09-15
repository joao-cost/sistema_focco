"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Button, Field, Input, FormError } from "@/components/ui";

export function RedefinirSenhaForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field
        label="Nova senha"
        htmlFor="password"
        error={state?.fieldErrors?.password?.[0]}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </Field>
      <Field
        label="Confirme a nova senha"
        htmlFor="confirmPassword"
        error={state?.fieldErrors?.confirmPassword?.[0]}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </Field>
      <FormError message={state?.error} />
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
