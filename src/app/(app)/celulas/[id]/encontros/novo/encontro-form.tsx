"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Textarea } from "@/components/ui";
import { todayISO } from "@/lib/utils";
import { createEncontroAction, type ActionState } from "@/lib/actions/celulas";

type Celulando = { id: string; nome: string };

export function EncontroForm({ celulaId, celulandos }: { celulaId: string; celulandos: Celulando[] }) {
  const boundAction = createEncontroAction.bind(null, celulaId, celulandos.map((c) => c.id));
  const [state, formAction, pending] = useActionState(boundAction, undefined as ActionState);

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data do encontro" htmlFor="data" error={state?.fieldErrors?.data?.[0]}>
          <Input id="data" name="data" type="date" required defaultValue={todayISO()} />
        </Field>
        <Field label="Duração (minutos)" htmlFor="duracaoMinutos">
          <Input id="duracaoMinutos" name="duracaoMinutos" type="number" min={1} placeholder="Ex: 120" />
        </Field>
      </div>

      <Field label="Conteúdo trabalhado" htmlFor="conteudoTrabalhado">
        <Textarea id="conteudoTrabalhado" name="conteudoTrabalhado" rows={2} />
      </Field>

      <Field label="Processamento de grupo" htmlFor="processamentoGrupo">
        <Textarea
          id="processamentoGrupo"
          name="processamentoGrupo"
          rows={2}
          placeholder="Como o grupo avaliou o encontro: o que funcionou, o que precisa melhorar..."
        />
      </Field>

      <Field label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" rows={2} />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Frequência</p>
        {celulandos.length === 0 ? (
          <p className="text-sm text-muted">Nenhum celulando ativo para registrar presença.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {celulandos.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name={`presente_${c.id}`} defaultChecked className="h-4 w-4 rounded border-border" />
                  {c.nome}
                </label>
                <input
                  type="text"
                  name={`justificativa_${c.id}`}
                  placeholder="Justificativa (se faltou)"
                  className="w-56 rounded-md border border-border px-2 py-1 text-xs"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Registrar encontro"}
      </Button>
    </form>
  );
}
