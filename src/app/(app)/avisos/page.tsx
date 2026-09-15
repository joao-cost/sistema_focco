import { verifySession } from "@/lib/dal";
import { listAllAvisos, listCelulasForUser } from "@/lib/queries/celulas";
import { Card, EmptyState, PageHeaderBand } from "@/components/ui";
import { formatDate, todayISO, cn } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";
import { AvisoForm } from "./aviso-form";

export default async function AvisosPage() {
  const session = await verifySession();
  const [avisos, celulas] = await Promise.all([listAllAvisos(), listCelulasForUser(session)]);
  const hoje = todayISO();
  const theme = getModuleTheme("avisos");
  const vigentes = avisos.filter((a) => a.validadeAte >= hoje);
  const vencidos = avisos.filter((a) => a.validadeAte < hoje);

  return (
    <div>
      <PageHeaderBand
        module="avisos"
        title="Avisos temporários"
        description="Lance trocas de sala, cancelamentos pontuais e outros avisos com vigência definida."
      />

      <div className="grid items-start gap-[18px] lg:grid-cols-[1fr_1.3fr]">
        <Card className="p-5">
          <p className={cn(theme.text, "m-0 mb-4 text-sm font-bold")}>Novo aviso</p>
          <AvisoForm celulas={celulas.map((c) => ({ id: c.id, nome: c.nome }))} />
        </Card>

        <div className="flex flex-col gap-[18px]">
          <Card>
            <div className={cn(theme.bg, "flex items-center gap-2 border-b border-[#F2F4F7] px-[18px] py-3.5")}>
              <span className="h-1.5 w-1.5 rounded-full bg-focco-green" />
              <p className={cn(theme.text, "m-0 text-sm font-bold")}>Vigentes</p>
            </div>
            {vigentes.length === 0 ? (
              <EmptyState title="Nenhum aviso vigente" />
            ) : (
              <div className="divide-y divide-[#F7F8FA]">
                {vigentes.map((a) => (
                  <div key={a.id} className="px-[18px] py-3.5">
                    <div className="mb-1.5 flex items-start justify-between gap-2.5">
                      <p className="m-0 text-[12.5px] font-semibold text-foreground">
                        {a.celula ? a.celula.nome : "Geral"}
                        {a.horario ? ` · ${a.horario}` : ""}
                      </p>
                      <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-focco-green-pale px-2.5 py-1 text-[11px] font-semibold text-focco-green-dark">
                        {formatDate(a.data)}
                      </span>
                    </div>
                    <p className="m-0 text-[11.5px] text-muted">{a.mensagem}</p>
                    <p className="mt-1 text-[10.5px] text-[#98A2B3]">
                      Válido até {formatDate(a.validadeAte)} · registrado por {a.registradoPor.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="opacity-75">
            <div className="flex items-center gap-2 border-b border-[#F2F4F7] px-[18px] py-3.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#98A2B3]" />
              <p className="m-0 text-sm font-bold text-muted">Vencidos</p>
            </div>
            {vencidos.length === 0 ? (
              <EmptyState title="Nenhum aviso vencido" />
            ) : (
              <div className="divide-y divide-[#F7F8FA]">
                {vencidos.map((a) => (
                  <div key={a.id} className="px-[18px] py-3.5">
                    <div className="mb-1.5 flex items-start justify-between gap-2.5">
                      <p className="m-0 text-[12.5px] font-semibold text-muted">
                        {a.celula ? a.celula.nome : "Geral"}
                        {a.horario ? ` · ${a.horario}` : ""}
                      </p>
                      <span className="flex-shrink-0 whitespace-nowrap text-[11px] text-[#98A2B3]">
                        {formatDate(a.data)}
                      </span>
                    </div>
                    <p className="m-0 text-[11.5px] text-[#98A2B3]">{a.mensagem}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
