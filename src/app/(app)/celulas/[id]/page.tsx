import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCelulaDetail } from "@/lib/queries/celulas";
import { Badge, Card, CardHeader, LinkButton } from "@/components/ui";
import {
  CELULA_STATUS_LABELS,
  DIA_SEMANA_LABELS,
  TURNO_LABELS,
  formatDate,
} from "@/lib/utils";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{celula.nome}</h1>
            <Badge value={celula.status} label={CELULA_STATUS_LABELS[celula.status]} />
          </div>
          <p className="text-sm text-muted">
            {celula.tema && <>{celula.tema} · </>}
            Articulador: {celula.articulador.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && <LinkButton href={`/celulas/${celula.id}/editar`} variant="secondary">Editar</LinkButton>}
          {canEdit && <LinkButton href={`/celulas/${celula.id}/encontros/novo`}>Registrar encontro</LinkButton>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Celulandos" description={`${celulandosAtivos} ativo(s) de ${celula.celulandos.length} cadastrados`} />
            <div className="p-5">
              <CelulandosSection celulaId={celula.id} celulandos={celula.celulandos} canEdit={canEdit} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Últimos encontros" description="Histórico de encontros e frequência registrada." />
            <div className="divide-y divide-border">
              {celula.encontros.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">Nenhum encontro registrado ainda.</p>
              ) : (
                celula.encontros.map((e) => {
                  const presentes = e.presencas.filter((p) => p.presente).length;
                  return (
                    <div key={e.id} className="px-5 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{formatDate(e.data)}</p>
                        <span className="text-xs text-muted">
                          {presentes}/{e.presencas.length} presentes
                        </span>
                      </div>
                      {e.conteudoTrabalhado && <p className="mt-1 text-muted">{e.conteudoTrabalhado}</p>}
                      <p className="mt-1 text-xs text-muted">Registrado por {e.registradoPor.name}</p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Dados da célula" />
            <dl className="space-y-2 px-5 py-4 text-sm">
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
              <div className="border-t border-border px-5 py-4">
                <CelulaStatusActions celulaId={celula.id} status={celula.status} />
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Avisos temporários" description="Trocas de sala, cancelamentos e exceções pontuais." />
            <div className="p-5">
              <AvisosSection celulaId={celula.id} avisos={celula.avisos} canEdit={canEdit} />
            </div>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted">
        <Link href="/celulas" className="hover:text-focco-green">
          ← Voltar para todas as células
        </Link>
      </p>
    </div>
  );
}
