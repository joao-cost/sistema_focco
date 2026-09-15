import { requireRole } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { Card, CardHeader, PageHeaderBand, StatCard, StatTile } from "@/components/ui";
import { EncontrosChart } from "@/components/encontros-chart";
import { formatDate } from "@/lib/utils";

export default async function CoordenacaoDashboardPage() {
  await requireRole("coordenacao", "facilitador");
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeaderBand module="dashboard" title="Dashboard da coordenação" description="Visão geral do programa FOCCO." />

      <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Células ativas" value={stats.celulasPorStatus.ativa} accent="verde" />
        <StatCard label="Celulandos ativos" value={stats.celulandosAtivos} accent="azul" />
        <StatCard label="Articuladores" value={stats.totalArticuladores} accent="laranja" />
        <StatCard label="Encontros (30d)" value={stats.encontros30d} accent="rosa" />
        <StatCard
          label="Taxa de presença"
          value={stats.taxaPresenca !== null ? `${stats.taxaPresenca}%` : "—"}
          accent="vermelho"
        />
      </div>

      <div className="grid gap-[18px] lg:grid-cols-3">
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
                <div key={a.id} className="border-l-[3px] border-focco-green px-4 py-3 text-sm">
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

      <div className="mt-[18px] grid gap-4 sm:grid-cols-3">
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
