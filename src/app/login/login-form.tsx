"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Field, Input, FormError } from "@/components/ui";
import { cn } from "@/lib/utils";

export function LoginForm({
  callbackUrl,
  variant = "desktop",
}: {
  callbackUrl: string;
  variant?: "desktop" | "mobile";
}) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const isMobile = variant === "mobile";

  return (
    <form action={formAction} className={isMobile ? "space-y-3" : "space-y-4"}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Field label={isMobile ? "E-mail" : "E-mail institucional"} htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@unemat.br"
        />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <div className="text-right">
        <Link href="/esqueci-senha" className="text-xs font-medium text-focco-blue hover:underline">
          Esqueci minha senha
        </Link>
      </div>
      <FormError message={state?.error} />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full rounded-lg py-3 text-center text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          isMobile ? "bg-focco-blue hover:bg-focco-blue-dark" : "bg-focco-green hover:bg-focco-green-dark"
        )}
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <div className="pt-1 text-center">
        <Link
          href="/vitrine"
          className={cn("text-xs", isMobile ? "text-white/55 hover:text-white/80" : "text-[#98A2B3] hover:text-muted")}
        >
          Ver a vitrine pública das células →
        </Link>
      </div>
    </form>
  );
}
