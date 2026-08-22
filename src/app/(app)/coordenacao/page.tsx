import { requireRole } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { Card, CardHeader, StatTile } from "@/components/ui";
import { EncontrosChart } from "@/components/encontros-chart";
import { formatDate } from "@/lib/utils";

export default async function CoordenacaoDashboardPage() {
  await requireRole("coordenacao");
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard da coordenação</h1>
        <p className="text-sm text-muted">Visão geral do programa FOCCO.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Células ativas"
          value={stats.celulasPorStatus.ativa}
          description={`${stats.totalCelulas} célula(s) no total`}
        />
        <StatTile label="Celulandos ativos" value={stats.celulandosAtivos} />
        <StatTile label="Articuladores ativos" value={stats.totalArticuladores} />
        <StatTile
          label="Encontros (últimos 30 dias)"
          value={stats.encontros30d}
          description={
            stats.taxaPresenca !== null ? `${stats.taxaPresenca}% de presença média` : "Sem registros de presença"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Encontros por célula" description="Total de encontros registrados em cada célula." />
          <div className="px-5 py-4">
            {stats.encontrosPorCelula.every((c) => c.total === 0) ? (
              <p className="text-sm text-muted">Nenhum encontro registrado ainda.</p>
            ) : (
              <EncontrosChart data={stats.encontrosPorCelula} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Avisos ativos" description="Trocas de sala e exceções pontuais em vigor." />
          <div className="divide-y divide-border">
            {stats.avisosAtivos.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">Nenhum aviso ativo no momento.</p>
            ) : (
              stats.avisosAtivos.map((a) => (
                <div key={a.id} className="px-5 py-3 text-sm">
                  <p className="font-medium text-foreground">
                    {formatDate(a.data)} {a.celula ? `· ${a.celula.nome}` : ""}
                  </p>
                  <p className="text-muted">{a.mensagem}</p>
                  <p className="text-xs text-muted">Válido até {formatDate(a.validadeAte)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Células inativas" value={stats.celulasPorStatus.inativa} />
        <StatTile label="Células encerradas" value={stats.celulasPorStatus.encerrada} />
        <StatTile
          label="Taxa de presença (30 dias)"
          value={stats.taxaPresenca !== null ? `${stats.taxaPresenca}%` : "—"}
        />
      </div>
    </div>
  );
}
