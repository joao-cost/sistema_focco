"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveChamadaAction } from "@/lib/actions/chamadas";
import { Avatar, Button, FormError } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("chamada");

type Bolsista = { bolsaId: string; nome: string; celulaNome: string | null; presente: boolean };

export function ChamadaForm({ data, bolsistas }: { data: string; bolsistas: Bolsista[] }) {
  const router = useRouter();
  const [presencas, setPresencas] = useState<Record<string, boolean>>(
    Object.fromEntries(bolsistas.map((b) => [b.bolsaId, b.presente]))
  );

  const bolsaIds = bolsistas.map((b) => b.bolsaId);
  const action = saveChamadaAction.bind(null, bolsaIds);
  const [state, formAction, pending] = useActionState(action, undefined);

  const presentesCount = Object.values(presencas).filter(Boolean).length;

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-surface", theme.border)}>
      <div
        className={cn(
          theme.bg,
          "flex flex-wrap items-center justify-between gap-4 border-b px-[18px] py-4",
          theme.border
        )}
      >
        <div className="flex items-center gap-2.5">
          <label htmlFor="dataReuniao" className={cn(theme.text, "text-xs font-semibold")}>
            Dia da reunião
          </label>
          <input
            id="dataReuniao"
            type="date"
            defaultValue={data}
            onChange={(e) => router.push(`/chamada?data=${e.target.value}`)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] text-foreground"
          />
        </div>
        <span className={cn(theme.text, "text-[12.5px] font-semibold")}>
          {presentesCount} de {bolsistas.length} bolsistas presentes
        </span>
      </div>

      <form action={formAction}>
        <input type="hidden" name="data" value={data} />
        {bolsistas.length === 0 ? (
          <p className="px-[18px] py-6 text-sm text-muted">Nenhum bolsista ativo no momento.</p>
        ) : (
          <div className="divide-y divide-surface-subtle">
            {bolsistas.map((b) => {
              const presente = presencas[b.bolsaId];
              return (
                <div key={b.bolsaId} className="flex items-center justify-between gap-3 px-[18px] py-3.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={b.nome} accent="bolsistas" />
                    <div className="min-w-0">
                      <p className="m-0 truncate text-[13px] font-semibold text-foreground">{b.nome}</p>
                      <p className="m-0 truncate text-[11px] text-text-tertiary">{b.celulaNome ?? "—"}</p>
                    </div>
                  </div>
                  <input type="hidden" name={`presente_${b.bolsaId}`} value={presente ? "on" : ""} />
                  <button
                    type="button"
                    onClick={() => setPresencas((s) => ({ ...s, [b.bolsaId]: !s[b.bolsaId] }))}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                      presente ? "bg-focco-green-pale text-focco-green-dark" : "bg-border-subtle text-text-secondary"
                    )}
                  >
                    {presente ? "Presente" : "Ausente"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div className="px-[18px] py-4">
          <FormError message={state?.error} />
          <Button type="submit" disabled={pending || bolsistas.length === 0} className="w-full">
            {pending ? "Salvando..." : "Salvar chamada"}
          </Button>
        </div>
      </form>
    </div>
  );
}
