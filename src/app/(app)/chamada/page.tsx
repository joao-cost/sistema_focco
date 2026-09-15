import { requireRole } from "@/lib/dal";
import { getChamadaDoDia, listChamadasAnteriores } from "@/lib/queries/chamadas";
import { Card, PageHeaderBand } from "@/components/ui";
import { cn, formatDate, todayISO } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";
import { ChamadaForm } from "./chamada-form";

export default async function ChamadaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  await requireRole("coordenacao", "facilitador");
  const { data: dataParam } = await searchParams;
  const data = dataParam || todayISO();
  const theme = getModuleTheme("chamada");

  const [bolsistas, chamadasAnteriores] = await Promise.all([
    getChamadaDoDia(data),
    listChamadasAnteriores(),
  ]);

  return (
    <div>
      <PageHeaderBand
        module="chamada"
        title="Chamada"
        description="Registre a presença dos bolsistas ativos na reunião do dia."
      />

      <div className="grid items-start gap-[18px] lg:grid-cols-[2fr_1fr]">
        <ChamadaForm data={data} bolsistas={bolsistas} />

        <Card>
          <div className={cn(theme.bg, "border-b px-[18px] py-3.5", theme.border)}>
            <p className={cn(theme.text, "m-0 text-sm font-bold")}>Chamadas anteriores</p>
          </div>
          {chamadasAnteriores.length === 0 ? (
            <p className="px-[18px] py-6 text-sm text-muted">Nenhuma chamada registrada ainda.</p>
          ) : (
            <div className="divide-y divide-[#F7F8FA]">
              {chamadasAnteriores.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-[18px] py-3">
                  <span className="text-[12.5px] text-[#344054]">{formatDate(c.data)}</span>
                  <span className="text-xs font-semibold text-focco-green-dark">
                    {c.presentes}/{c.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
