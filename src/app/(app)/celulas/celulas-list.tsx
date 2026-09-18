"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { CELULA_STATUS_LABELS, DIA_SEMANA_LABELS, TURNO_LABELS, cn } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("celulas");

type Celula = {
  id: string;
  nome: string;
  tema: string | null;
  curso: string | null;
  status: string;
  diaSemana: string | null;
  turno: string | null;
  horario: string | null;
  local: string | null;
  logoUrl: string | null;
  articuladorId: string;
  articuladorNome: string;
  canEdit: boolean;
};

export function CelulasList({ celulas, meuUserId }: { celulas: Celula[]; meuUserId: string }) {
  const [view, setView] = useState<"cards" | "tabela">("cards");

  if (celulas.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhuma célula cadastrada"
          description="Comece cadastrando a primeira célula do programa."
          action={<LinkButton href="/celulas/nova">Nova célula</LinkButton>}
        />
      </Card>
    );
  }

  const minhas = celulas.filter((c) => c.articuladorId === meuUserId);
  const outras = celulas.filter((c) => c.articuladorId !== meuUserId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold transition-colors",
              view === "cards" ? cn(theme.bg, theme.text) : "bg-surface text-text-secondary hover:bg-border-subtle"
            )}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView("tabela")}
            className={cn(
              "border-l border-border px-3 py-1.5 text-xs font-semibold transition-colors",
              view === "tabela" ? cn(theme.bg, theme.text) : "bg-surface text-text-secondary hover:bg-border-subtle"
            )}
          >
            Tabela
          </button>
        </div>
        <LinkButton href="/celulas/nova" size="sm">
          + Nova célula
        </LinkButton>
      </div>

      {minhas.length > 0 && <Section title="Minhas células" celulas={minhas} view={view} />}
      {outras.length > 0 && (
        <Section title={minhas.length > 0 ? "Outras células" : "Células"} celulas={outras} view={view} />
      )}
    </div>
  );
}

function Section({ title, celulas, view }: { title: string; celulas: Celula[]; view: "cards" | "tabela" }) {
  return (
    <div>
      <h2 className="mb-2.5 text-sm font-bold text-foreground">
        {title} <span className="font-normal text-text-tertiary">({celulas.length})</span>
      </h2>
      {view === "cards" ? <CardsGrid celulas={celulas} /> : <TabelaView celulas={celulas} />}
    </div>
  );
}

function CardsGrid({ celulas }: { celulas: Celula[] }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {celulas.map((c) => (
        <Link key={c.id} href={`/celulas/${c.id}`} className="block">
          <Card className="h-full p-4 transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              {c.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- vem do R2/disco, não vale a pena otimizar
                <img src={c.logoUrl} alt="" className="h-11 w-11 flex-shrink-0 rounded-lg border border-border object-cover" />
              ) : (
                <div
                  className={cn(
                    theme.bg,
                    theme.text,
                    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  )}
                >
                  {c.nome.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-semibold text-foreground">{c.nome}</p>
                <p className="m-0 truncate text-[11.5px] text-muted">{c.articuladorNome}</p>
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Badge value={c.status} label={CELULA_STATUS_LABELS[c.status]} />
            </div>
            {c.tema && <p className="m-0 mb-1.5 truncate text-xs text-text-secondary">{c.tema}</p>}
            <p className="m-0 text-[11.5px] text-text-tertiary">
              {c.diaSemana ? DIA_SEMANA_LABELS[c.diaSemana] : "Sem horário definido"}
              {c.turno ? ` · ${TURNO_LABELS[c.turno]}` : ""}
              {c.horario ? ` · ${c.horario}` : ""}
            </p>
            {c.local && <p className="m-0 text-[11.5px] text-text-tertiary">{c.local}</p>}
            {c.canEdit && <span className="mt-2 inline-block text-[11px] font-semibold text-focco-blue">Editar →</span>}
          </Card>
        </Link>
      ))}
    </div>
  );
}

function TabelaView({ celulas }: { celulas: Celula[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={cn(theme.bg, "border-b", theme.border)}>
              {["Célula", "Articulador", "Dia / Turno / Horário", "Local", "Status", ""].map((h) => (
                <th key={h} className={cn(theme.text, "px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {celulas.map((c) => (
              <tr key={c.id} className="border-b border-border-subtle last:border-0 hover:bg-border-subtle">
                <td className="px-5 py-3.5">
                  <Link href={`/celulas/${c.id}`} className="font-semibold text-foreground hover:text-focco-blue">
                    {c.nome}
                  </Link>
                  {c.tema && <p className="text-xs text-muted">{c.tema}</p>}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.articuladorNome}</td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {c.diaSemana ? DIA_SEMANA_LABELS[c.diaSemana] : "—"}
                  {c.turno ? ` · ${TURNO_LABELS[c.turno]}` : ""}
                  {c.horario ? ` · ${c.horario}` : ""}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.local ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <Badge value={c.status} label={CELULA_STATUS_LABELS[c.status]} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  {c.canEdit && (
                    <Link href={`/celulas/${c.id}/editar`} className="text-xs font-semibold text-focco-blue hover:underline">
                      Editar
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
