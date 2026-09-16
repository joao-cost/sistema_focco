"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  desmarcarVaquinhaPagaAction,
  editarValorVaquinhaAction,
  lancarVaquinhaMesAction,
  marcarVaquinhaPagaAction,
} from "@/lib/actions/financeiro";
import { Avatar, Button, Card, Field, FormError, Input } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("financeiro");

type Pagamento = {
  id: string;
  valorEsperado: string;
  pago: boolean;
  valorPago: string | null;
  dataPagamento: string | null;
  user: { id: string; name: string };
};

export function VaquinhaSection({
  competencia,
  competencias,
  pagamentos,
  proximaCompetenciaSugerida,
}: {
  competencia: string;
  competencias: string[];
  pagamentos: Pagamento[];
  proximaCompetenciaSugerida: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const pagos = pagamentos.filter((p) => p.pago).length;
  const jaLancouProxima = competencias.includes(proximaCompetenciaSugerida);

  return (
    <Card>
      <div className={cn(theme.bg, "flex flex-wrap items-center justify-between gap-3 border-b px-[18px] py-3.5", theme.border)}>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className={cn(theme.text, "m-0 text-sm font-bold")}>Vaquinha</p>
          {competencias.length > 0 && (
            <select
              value={competencia}
              onChange={(e) => router.push(`/financeiro?mes=${e.target.value}`)}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground"
            >
              {competencias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          {!jaLancouProxima && (
            <button
              type="button"
              onClick={() => router.push(`/financeiro?mes=${proximaCompetenciaSugerida}`)}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold text-foreground hover:bg-border-subtle"
            >
              + Nova vaquinha ({proximaCompetenciaSugerida})
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {pagamentos.length > 0 && (
            <>
              <span className={cn(theme.text, "text-xs font-semibold")}>
                {pagos}/{pagamentos.length} pagaram
              </span>
              <button
                type="button"
                onClick={() => setEditando((v) => !v)}
                className="text-xs font-semibold text-text-secondary underline-offset-2 hover:underline"
              >
                {editando ? "Cancelar" : "Editar valor"}
              </button>
            </>
          )}
        </div>
      </div>

      {editando && pagamentos.length > 0 && (
        <div className="border-b border-border-subtle bg-surface-subtle p-4">
          <EditarValorForm competencia={competencia} onDone={() => setEditando(false)} />
        </div>
      )}

      {pagamentos.length === 0 ? (
        <div className="p-5">
          <p className="mb-4 text-sm text-muted">Nenhuma vaquinha lançada para {competencia} ainda.</p>
          <NovaVaquinhaForm sugestao={competencia === proximaCompetenciaSugerida ? competencia : proximaCompetenciaSugerida} />
        </div>
      ) : (
        <div className="divide-y divide-surface-subtle">
          {pagamentos.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-[18px] py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={p.user.name} />
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-semibold text-foreground">{p.user.name}</p>
                  <p className="m-0 text-[11px] text-text-tertiary">
                    R$ {Number(p.valorEsperado).toFixed(2)}
                    {p.pago && p.dataPagamento ? ` · pago em ${formatDate(p.dataPagamento)}` : ""}
                  </p>
                </div>
              </div>
              <form
                action={
                  p.pago
                    ? desmarcarVaquinhaPagaAction.bind(null, p.id)
                    : marcarVaquinhaPagaAction.bind(null, p.id, p.valorEsperado)
                }
              >
                <button
                  type="submit"
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    p.pago ? "bg-focco-green-pale text-focco-green-dark" : "bg-border-subtle text-text-secondary"
                  )}
                >
                  {p.pago ? "Pago" : "Pendente"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function EditarValorForm({ competencia, onDone }: { competencia: string; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(editarValorVaquinhaAction, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onDone();
    }
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <input type="hidden" name="competencia" value={competencia} />
      <Field
        label={`Novo valor por pessoa em ${competencia}`}
        htmlFor="valorEsperadoEdit"
        error={state?.fieldErrors?.valorEsperado?.[0]}
      >
        <Input id="valorEsperadoEdit" name="valorEsperado" type="number" step="0.01" min="0.01" placeholder="20.00" required />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
      <div className="sm:col-span-2">
        <p className="m-0 mb-1 text-[11px] text-text-tertiary">
          Atualiza só quem ainda está pendente — quem já pagou mantém o valor pago.
        </p>
        <FormError message={state?.error} />
      </div>
    </form>
  );
}

function NovaVaquinhaForm({ sugestao }: { sugestao: string }) {
  const [state, formAction, pending] = useActionState(lancarVaquinhaMesAction, undefined);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <Field label="Mês (AAAA-MM)" htmlFor="competencia" error={state?.fieldErrors?.competencia?.[0]}>
        <Input id="competencia" name="competencia" defaultValue={sugestao} placeholder="2026-10" required />
      </Field>
      <Field label="Valor por pessoa" htmlFor="valorEsperado" error={state?.fieldErrors?.valorEsperado?.[0]}>
        <Input id="valorEsperado" name="valorEsperado" type="number" step="0.01" min="0.01" placeholder="20.00" required />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Lançando..." : "Lançar"}
        </Button>
      </div>
      <div className="sm:col-span-3">
        <FormError message={state?.error} />
      </div>
    </form>
  );
}
