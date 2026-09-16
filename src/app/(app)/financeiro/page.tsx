import { requireRole } from "@/lib/dal";
import {
  getSaldoCaixa,
  getVaquinhaDoMes,
  listActiveUsers,
  listCompras,
  listMovimentacoes,
  listVaquinhaCompetencias,
  nextCompetencia,
} from "@/lib/queries/financeiro";
import { PageHeaderBand, StatCard } from "@/components/ui";
import { VaquinhaSection } from "./vaquinha-section";
import { ComprasSection } from "./compras-section";
import { MovimentacaoSection } from "./movimentacao-section";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  await requireRole("coordenacao", "facilitador");
  const { mes } = await searchParams;

  const competencias = await listVaquinhaCompetencias();
  const competenciaAtual = mes || competencias[0] || nextCompetencia();

  const [saldo, pagamentos, usuarios, compras, movimentacoes] = await Promise.all([
    getSaldoCaixa(),
    getVaquinhaDoMes(competenciaAtual),
    listActiveUsers(),
    listCompras(),
    listMovimentacoes(),
  ]);

  return (
    <div>
      <PageHeaderBand
        module="financeiro"
        title="Financeiro"
        description="Vaquinha mensal, compras divididas e caixa — visível só para coordenação e facilitadores."
      />

      <div className="mb-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <StatCard label="Saldo em caixa" value={`R$ ${saldo.saldo.toFixed(2)}`} accent="verde" />
        <StatCard label="Recebido em vaquinhas" value={`R$ ${saldo.recebidoVaquinha.toFixed(2)}`} accent="azul" />
        <StatCard label="Recebido em compras" value={`R$ ${saldo.recebidoCompras.toFixed(2)}`} accent="laranja" />
      </div>

      <div className="flex flex-col gap-[18px]">
        <VaquinhaSection
          competencia={competenciaAtual}
          competencias={competencias.length > 0 ? competencias : [competenciaAtual]}
          pagamentos={pagamentos}
          proximaCompetenciaSugerida={nextCompetencia()}
        />
        <ComprasSection compras={compras} usuarios={usuarios} />
        <MovimentacaoSection movimentacoes={movimentacoes} />
      </div>
    </div>
  );
}
