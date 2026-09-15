"use client";

import { useActionState } from "react";
import { createBolsaAction } from "@/lib/actions/bolsistas";
import { Button, Field, Input, Select, FormError } from "@/components/ui";

export function BolsaForm({ articuladores }: { articuladores: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createBolsaAction, undefined);

  if (articuladores.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todos os articuladores ativos já têm uma bolsa cadastrada. Cadastre um novo articulador em{" "}
        <span className="font-medium text-foreground">Usuários</span> primeiro.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Articulador" htmlFor="articuladorId" error={state?.fieldErrors?.articuladorId?.[0]}>
        <Select id="articuladorId" name="articuladorId" required defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          {articuladores.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Categoria da bolsa" htmlFor="categoria" error={state?.fieldErrors?.categoria?.[0]}>
        <Select id="categoria" name="categoria" required defaultValue="integral">
          <option value="integral">Cota Integral</option>
          <option value="parcial">Cota Parcial</option>
        </Select>
      </Field>
      <Field label="Vigência de" htmlFor="vigenciaInicio" error={state?.fieldErrors?.vigenciaInicio?.[0]}>
        <Input id="vigenciaInicio" name="vigenciaInicio" type="date" required />
      </Field>
      <Field label="até" htmlFor="vigenciaFim" error={state?.fieldErrors?.vigenciaFim?.[0]}>
        <Input id="vigenciaFim" name="vigenciaFim" type="date" required />
      </Field>
      <div className="sm:col-span-2">
        <FormError message={state?.error} />
        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "Cadastrando..." : "Cadastrar bolsista"}
        </Button>
      </div>
    </form>
  );
}
