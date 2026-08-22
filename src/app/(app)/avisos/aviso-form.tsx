"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Select, Textarea } from "@/components/ui";
import { todayISO } from "@/lib/utils";
import { createAvisoAction, type ActionState } from "@/lib/actions/celulas";

type Celula = { id: string; nome: string };

export function AvisoForm({ celulas }: { celulas: Celula[] }) {
  const [state, formAction, pending] = useActionState(createAvisoAction, undefined as ActionState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <FormError message={state?.error} />
      <Field label="Célula (opcional)" htmlFor="celulaId">
        <Select id="celulaId" name="celulaId" defaultValue="">
          <option value="">Geral / sala do FOCCO</option>
          {celulas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Horário" htmlFor="horario">
        <Input id="horario" name="horario" placeholder="Ex: 15h às 17h" />
      </Field>
      <Field label="Data" htmlFor="data" error={state?.fieldErrors?.data?.[0]}>
        <Input id="data" name="data" type="date" required defaultValue={todayISO()} />
      </Field>
      <Field label="Válido até" htmlFor="validadeAte" error={state?.fieldErrors?.validadeAte?.[0]}>
        <Input id="validadeAte" name="validadeAte" type="date" required defaultValue={todayISO()} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Mensagem" htmlFor="mensagem" error={state?.fieldErrors?.mensagem?.[0]}>
          <Textarea id="mensagem" name="mensagem" rows={2} required placeholder="Descreva a mudança pontual..." />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar aviso"}
        </Button>
      </div>
    </form>
  );
}
