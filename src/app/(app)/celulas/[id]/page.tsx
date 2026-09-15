import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCelulaDetail } from "@/lib/queries/celulas";
import { Badge, Card, LinkButton, PageHeaderBand } from "@/components/ui";
import {
  CELULA_STATUS_LABELS,
  DIA_SEMANA_LABELS,
  TURNO_LABELS,
  formatDate,
  cn,
} from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";
import { CelulandosSection } from "./celulandos-section";
import { AvisosSection } from "./avisos-section";
import { CelulaStatusActions } from "./status-actions";

export default async function CelulaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const result = await getCelulaDetail(id, session);
  if (!result) notFound();

  const { celula, canEdit } = result;
  const celulandosAtivos = celula.celulandos.filter((c) => c.status === "ativo").length;
  const theme = getModuleTheme("celulas");

  return (
    <div>
      <Link
        href="/celulas"
        className="mb-2.5 inline-block text-[12.5px] font-semibold text-focco-blue hover:text-focco-blue-dark"
      >
        ← Voltar para Células
      </Link>

      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {canEdit && <LinkButton href={`/celulas/${celula.id}/editar`} variant="secondary">Editar</LinkButton>}
          {canEdit && <LinkButton href={`/celulas/${celula.id}/encontros/novo`}>Registrar encontro</LinkButton>}
        </div>
      </div>

      <PageHeaderBand
        module="celulas"
        title={celula.nome}
        badge={<Badge value={celula.status} label={CELULA_STATUS_LABELS[celula.status]} />}
        description={`${celula.articulador.name} · ${celula.diaSemana ? DIA_SEMANA_LABELS[celula.diaSemana] : "—"} · ${celula.turno ? TURNO_LABELS[celula.turno] : "—"} · ${celula.horario ?? "—"} · ${celula.local ?? "—"}`}
      />

      <div className="grid items-start gap-[18px] lg:grid-cols-2">
        <Card>
          <div className={cn(theme.bg, "border-b border-border-subtle px-[18px] py-4")}>
            <p className={cn(theme.text, "m-0 text-sm font-bold")}>Celulandos</p>
            <p className={cn(theme.text, "mt-0.5 text-[11.5px]")}>
              {celulandosAtivos} ativo(s) de {celula.celulandos.length} cadastrados
            </p>
          </div>
          <div className="p-5">
            <CelulandosSection celulaId={celula.id} celulandos={celula.celulandos} canEdit={canEdit} />
          </div>
        </Card>

        <Card>
          <div className={cn(theme.bg, "border-b border-border-subtle px-[18px] py-4")}>
            <p className={cn(theme.text, "m-0 text-sm font-bold")}>Histórico de encontros</p>
            <p className={cn(theme.text, "mt-0.5 text-[11.5px]")}>Registro de presença por encontro.</p>
          </div>
          {celula.encontros.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">Nenhum encontro registrado ainda.</p>
          ) : (
            <div className="divide-y divide-surface-subtle">
              {celula.encontros.map((e) => {
                const presentes = e.presencas.filter((p) => p.presente).length;
                const total = e.presencas.length;
                const pct = total > 0 ? (presentes / total) * 100 : 0;
                return (
                  <div key={e.id} className="px-[18px] py-3.5">
                    <div className="mb-1.5 flex items-start justify-between gap-2.5">
                      <p className="m-0 text-[12.5px] font-semibold text-foreground">{formatDate(e.data)}</p>
                      <span className="flex-shrink-0 whitespace-nowrap text-[11.5px] font-semibold text-focco-green-dark">
                        {presentes}/{total} presentes
                      </span>
                    </div>
                    {e.conteudoTrabalhado && <p className="m-0 text-[11.5px] text-muted">{e.conteudoTrabalhado}</p>}
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border-subtle">
                      <div className="h-full rounded-full bg-focco-green" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-text-tertiary">Registrado por {e.registradoPor.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-[18px] grid items-start gap-[18px] lg:grid-cols-2">
        <Card>
          <div className="border-b border-border-subtle px-[18px] py-4">
            <p className="m-0 text-sm font-bold text-foreground">Dados da célula</p>
          </div>
          <dl className="space-y-2 px-[18px] py-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Dia/turno</dt>
              <dd className="text-right text-foreground">
                {celula.diaSemana ? DIA_SEMANA_LABELS[celula.diaSemana] : "—"}
                {celula.turno ? ` · ${TURNO_LABELS[celula.turno]}` : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Horário</dt>
              <dd className="text-foreground">{celula.horario ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Local</dt>
              <dd className="text-foreground">{celula.local ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Curso</dt>
              <dd className="text-foreground">{celula.curso ?? "—"}</dd>
            </div>
            {celula.observacoes && (
              <div>
                <dt className="text-muted">Observações</dt>
                <dd className="mt-1 text-foreground">{celula.observacoes}</dd>
              </div>
            )}
          </dl>
          {canEdit && (
            <div className="border-t border-border px-[18px] py-4">
              <CelulaStatusActions celulaId={celula.id} status={celula.status} />
            </div>
          )}
        </Card>

        <Card>
          <div className="border-b border-border-subtle px-[18px] py-4">
            <p className="m-0 text-sm font-bold text-foreground">Avisos temporários</p>
            <p className="mt-0.5 text-[11.5px] text-muted">Trocas de sala, cancelamentos e exceções pontuais.</p>
          </div>
          <div className="p-5">
            <AvisosSection celulaId={celula.id} avisos={celula.avisos} canEdit={canEdit} />
          </div>
        </Card>
      </div>
    </div>
  );
}
