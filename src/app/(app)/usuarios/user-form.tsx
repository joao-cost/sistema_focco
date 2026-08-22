"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Select } from "@/components/ui";
import { createUserAction } from "@/lib/actions/users";
import type { ActionState } from "@/lib/actions/celulas";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, undefined as ActionState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <FormError message={state?.error} />
      <Field label="Nome" htmlFor="name" error={state?.fieldErrors?.name?.[0]}>
        <Input id="name" name="name" required />
      </Field>
      <Field label="E-mail" htmlFor="email" error={state?.fieldErrors?.email?.[0]}>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Papel" htmlFor="role">
        <Select id="role" name="role" defaultValue="articulador">
          <option value="articulador">Articulador</option>
          <option value="facilitador">Facilitador</option>
          <option value="coordenacao">Coordenação</option>
        </Select>
      </Field>
      <Field label="Curso" htmlFor="curso">
        <Input id="curso" name="curso" />
      </Field>
      <Field label="Telefone" htmlFor="telefone">
        <Input id="telefone" name="telefone" />
      </Field>
      <Field label="Senha inicial (opcional)" htmlFor="password" error={state?.fieldErrors?.password?.[0]}>
        <Input id="password" name="password" type="password" placeholder="Padrão: focco123" />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar usuário"}
        </Button>
      </div>
    </form>
  );
}
