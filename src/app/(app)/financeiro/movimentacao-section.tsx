"use client";

import { useActionState, useState } from "react";
import { createMovimentacaoAction } from "@/lib/actions/financeiro";
import { Button, Card, Field, FormError, Input, Select } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("financeiro");

type Movimentacao = {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: string;
  data: string;
};

export function MovimentacaoSection({ movimentacoes }: { movimentacoes: Movimentacao[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState(createMovimentacaoAction, undefined);

  return (
    <Card>
      <div className={cn(theme.bg, "flex items-center justify-between gap-3 border-b px-[18px] py-3.5", theme.border)}>
        <p className={cn(theme.text, "m-0 text-sm font-bold")}>Outras movimentações</p>
        <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Lançar"}
        </Button>
      </div>

      {showForm && (
        <form action={formAction} className="grid gap-3 border-b border-border px-[18px] py-4 sm:grid-cols-[auto_1fr_auto_auto_auto]">
          <Field label="Tipo" htmlFor="tipo">
            <Select id="tipo" name="tipo" defaultValue="saida">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Select>
          </Field>
          <Field label="Descrição" htmlFor="descricao" error={state?.fieldErrors?.descricao?.[0]}>
            <Input id="descricao" name="descricao" placeholder="Ex: Material de limpeza" required />
          </Field>
          <Field label="Valor" htmlFor="valor" error={state?.fieldErrors?.valor?.[0]}>
            <Input id="valor" name="valor" type="number" step="0.01" min="0.01" required />
          </Field>
          <Field label="Data" htmlFor="data" error={state?.fieldErrors?.data?.[0]}>
            <Input id="data" name="data" type="date" required />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Salvando..." : "Lançar"}
            </Button>
          </div>
          <div className="sm:col-span-5">
            <FormError message={state?.error} />
          </div>
        </form>
      )}

      {movimentacoes.length === 0 ? (
        <p className="px-[18px] py-6 text-sm text-muted">Nenhuma movimentação avulsa registrada.</p>
      ) : (
        <div className="divide-y divide-surface-subtle">
          {movimentacoes.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-[18px] py-2.5">
              <div>
                <p className="m-0 text-[12.5px] font-medium text-foreground">{m.descricao}</p>
                <p className="m-0 text-[11px] text-text-tertiary">{formatDate(m.data)}</p>
              </div>
              <span
                className={cn(
                  "text-sm font-bold",
                  m.tipo === "entrada" ? "text-focco-green-dark" : "text-focco-red-dark"
                )}
              >
                {m.tipo === "entrada" ? "+" : "−"} R$ {Number(m.valor).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
