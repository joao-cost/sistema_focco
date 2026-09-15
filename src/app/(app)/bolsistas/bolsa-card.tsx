"use client";

import { useActionState } from "react";
import { useState } from "react";
import {
  addRelatorioAction,
  setBolsaStatusAction,
  setDocumentacaoStatusAction,
} from "@/lib/actions/bolsistas";
import { Avatar, Badge, Button, Field, Input, Select, FormError } from "@/components/ui";
import {
  BOLSA_CATEGORIA_LABELS,
  BOLSA_STATUS_LABELS,
  DOCUMENTACAO_STATUS_LABELS,
  RELATORIO_STATUS_LABELS,
  formatDate,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("bolsistas");

type Bolsa = {
  id: string;
  categoria: "integral" | "parcial";
  vigenciaInicio: string;
  vigenciaFim: string;
  status: "ativo" | "suspenso" | "encerrado";
  documentacaoStatus: "completa" | "pendente";
  articulador: { id: string; name: string };
  celulaNome: string | null;
  relatoriosStatus: "em_dia" | "atrasado";
  relatorios: { id: string; data: string; status: "entregue" | "atrasado" }[];
};

const STATUS_OPTIONS = ["ativo", "suspenso", "encerrado"] as const;

export function BolsaCard({ bolsa }: { bolsa: Bolsa }) {
  const [showRelatorioForm, setShowRelatorioForm] = useState(false);

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-surface", theme.border)}>
      <div className={cn(theme.bg, "flex flex-wrap items-center justify-between gap-3 px-[18px] py-3.5")}>
        <div className="flex items-center gap-2.5">
          <Avatar name={bolsa.articulador.name} accent="bolsistas" />
          <div>
            <p className={cn(theme.text, "m-0 text-[13.5px] font-bold")}>{bolsa.articulador.name}</p>
            <p className={cn(theme.text, "mt-0.5 text-[11.5px]")}>
              {BOLSA_CATEGORIA_LABELS[bolsa.categoria]}
              {bolsa.celulaNome ? ` · ${bolsa.celulaNome}` : ""}
            </p>
          </div>
        </div>
        <Badge value={bolsa.status} label={BOLSA_STATUS_LABELS[bolsa.status]} />
      </div>

      <div className="grid grid-cols-1 gap-4 px-[18px] py-4 sm:grid-cols-3">
        <div>
          <p className="m-0 mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#98A2B3]">Vigência</p>
          <p className="m-0 text-[12.5px] text-[#344054]">
            {formatDate(bolsa.vigenciaInicio)} – {formatDate(bolsa.vigenciaFim)}
          </p>
        </div>
        <div>
          <p className="m-0 mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#98A2B3]">Documentação</p>
          <Badge value={bolsa.documentacaoStatus} label={DOCUMENTACAO_STATUS_LABELS[bolsa.documentacaoStatus]} />
        </div>
        <div>
          <p className="m-0 mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#98A2B3]">Relatórios</p>
          <Badge value={bolsa.relatoriosStatus} label={RELATORIO_STATUS_LABELS[bolsa.relatoriosStatus]} />
        </div>
      </div>

      <div className="px-[18px] pb-4">
        <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-[#98A2B3]">
          Histórico de relatórios
        </p>
        <div className="flex flex-wrap gap-2">
          {bolsa.relatorios.length === 0 && <span className="text-xs text-muted">Nenhum relatório ainda.</span>}
          {bolsa.relatorios.map((h) => (
            <Badge key={h.id} value={h.status} label={`${formatDate(h.data)} · ${RELATORIO_STATUS_LABELS[h.status]}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#F2F4F7] px-[18px] py-3">
        {STATUS_OPTIONS.filter((s) => s !== bolsa.status).map((s) => (
          <form key={s} action={setBolsaStatusAction.bind(null, bolsa.id, s)}>
            <Button type="submit" variant="secondary" size="sm">
              Marcar {BOLSA_STATUS_LABELS[s].toLowerCase()}
            </Button>
          </form>
        ))}
        <form
          action={setDocumentacaoStatusAction.bind(
            null,
            bolsa.id,
            bolsa.documentacaoStatus === "completa" ? "pendente" : "completa"
          )}
        >
          <Button type="submit" variant="secondary" size="sm">
            Marcar documentação {bolsa.documentacaoStatus === "completa" ? "pendente" : "completa"}
          </Button>
        </form>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowRelatorioForm((v) => !v)}>
          {showRelatorioForm ? "Cancelar" : "+ Relatório"}
        </Button>
      </div>

      {showRelatorioForm && (
        <div className="border-t border-[#F2F4F7] px-[18px] py-3.5">
          <RelatorioForm bolsaId={bolsa.id} />
        </div>
      )}
    </div>
  );
}

function RelatorioForm({ bolsaId }: { bolsaId: string }) {
  const action = addRelatorioAction.bind(null, bolsaId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <Field label="Data do relatório" htmlFor={`data-${bolsaId}`} error={state?.fieldErrors?.data?.[0]}>
        <Input id={`data-${bolsaId}`} name="data" type="date" required />
      </Field>
      <Field label="Status" htmlFor={`status-${bolsaId}`} error={state?.fieldErrors?.status?.[0]}>
        <Select id={`status-${bolsaId}`} name="status" defaultValue="entregue">
          <option value="entregue">Entregue</option>
          <option value="atrasado">Atrasado</option>
        </Select>
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Adicionar"}
      </Button>
      <FormError message={state?.error} />
    </form>
  );
}
