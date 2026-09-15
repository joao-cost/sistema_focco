import { requireRole } from "@/lib/dal";
import { listBolsistas, listArticuladoresSemBolsa } from "@/lib/queries/bolsistas";
import { Card, EmptyState, PageHeaderBand } from "@/components/ui";
import { getModuleTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { BolsaForm } from "./bolsa-form";
import { BolsaCard } from "./bolsa-card";

export default async function BolsistasPage() {
  await requireRole("coordenacao", "facilitador");
  const [bolsistas, articuladoresSemBolsa] = await Promise.all([
    listBolsistas(),
    listArticuladoresSemBolsa(),
  ]);
  const theme = getModuleTheme("bolsistas");

  return (
    <div>
      <PageHeaderBand
        module="bolsistas"
        title="Bolsistas"
        description="Acompanhamento dos articuladores bolsistas do programa."
      />

      <Card className="mb-[18px] p-5">
        <p className={cn(theme.text, "m-0 mb-4 text-sm font-bold")}>Novo bolsista</p>
        <BolsaForm articuladores={articuladoresSemBolsa} />
      </Card>

      {bolsistas.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum bolsista cadastrado"
            description="Cadastre o primeiro bolsista acima."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-[14px]">
          {bolsistas.map((b) => (
            <BolsaCard key={b.id} bolsa={b} />
          ))}
        </div>
      )}
    </div>
  );
}
