"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Button, Field, Input, FormError } from "@/components/ui";

export function EsqueciSenhaForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-focco-green/25 bg-focco-green-pale/60 px-3.5 py-3 text-sm font-medium text-focco-green-dark">
        {state.success}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="E-mail" htmlFor="email" error={state?.fieldErrors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@unemat.br"
        />
      </Field>
      <FormError message={state?.error} />
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
    </form>
  );
}
