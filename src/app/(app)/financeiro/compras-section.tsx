"use client";

import { useActionState, useState } from "react";
import { createCompraAction, desmarcarCompraPagaAction, marcarCompraPagaAction } from "@/lib/actions/financeiro";
import { Button, Card, Field, FormError, Input } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("financeiro");

type Compra = {
  id: string;
  descricao: string;
  valorTotal: string;
  data: string;
  participantes: {
    id: string;
    valorDevido: string;
    pago: boolean;
    dataPagamento: string | null;
    user: { id: string; name: string };
  }[];
};

export function ComprasSection({
  compras,
  usuarios,
}: {
  compras: Compra[];
  usuarios: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card>
      <div className={cn(theme.bg, "flex items-center justify-between gap-3 border-b px-[18px] py-3.5", theme.border)}>
        <p className={cn(theme.text, "m-0 text-sm font-bold")}>Compras / pedidos divididos</p>
        <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Nova compra"}
        </Button>
      </div>

      {showForm && (
        <div className="border-b border-border px-[18px] py-4">
          <NovaCompraForm usuarios={usuarios} />
        </div>
      )}

      {compras.length === 0 ? (
        <p className="px-[18px] py-6 text-sm text-muted">Nenhuma compra registrada ainda.</p>
      ) : (
        <div className="divide-y divide-surface-subtle">
          {compras.map((c) => {
            const pagos = c.participantes.filter((p) => p.pago).length;
            return (
              <div key={c.id} className="px-[18px] py-3.5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="m-0 text-[13px] font-semibold text-foreground">{c.descricao}</p>
                    <p className="m-0 text-[11px] text-text-tertiary">
                      {formatDate(c.data)} · R$ {Number(c.valorTotal).toFixed(2)} total · {pagos}/{c.participantes.length}{" "}
                      pagaram
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.participantes.map((p) => (
                    <form
                      key={p.id}
                      action={
                        p.pago
                          ? desmarcarCompraPagaAction.bind(null, p.id)
                          : marcarCompraPagaAction.bind(null, p.id)
                      }
                    >
                      <button
                        type="submit"
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                          p.pago ? "bg-focco-green-pale text-focco-green-dark" : "bg-border-subtle text-text-secondary"
                        )}
                      >
                        {p.user.name} · R$ {Number(p.valorDevido).toFixed(2)}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function NovaCompraForm({ usuarios }: { usuarios: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createCompraAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Descrição" htmlFor="descricao" error={state?.fieldErrors?.descricao?.[0]}>
          <Input id="descricao" name="descricao" placeholder="Ex: Camisetas FOCCO" required />
        </Field>
        <Field label="Valor total" htmlFor="valorTotal" error={state?.fieldErrors?.valorTotal?.[0]}>
          <Input id="valorTotal" name="valorTotal" type="number" step="0.01" min="0.01" required />
        </Field>
        <Field label="Data" htmlFor="data" error={state?.fieldErrors?.data?.[0]}>
          <Input id="data" name="data" type="date" required />
        </Field>
      </div>
      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Dividir entre</p>
        <div className="grid max-h-40 grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-3">
          {usuarios.map((u) => (
            <label key={u.id} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" name="participantes" value={u.id} className="accent-focco-green" />
              {u.name}
            </label>
          ))}
        </div>
        {state?.fieldErrors?.participantes?.[0] && (
          <p className="mt-1 text-xs text-focco-red">{state.fieldErrors.participantes[0]}</p>
        )}
      </div>
      <FormError message={state?.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Registrar compra"}
      </Button>
    </form>
  );
}
