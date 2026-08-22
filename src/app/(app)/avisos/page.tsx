import { verifySession } from "@/lib/dal";
import { listAllAvisos, listCelulasForUser } from "@/lib/queries/celulas";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import { formatDate, todayISO } from "@/lib/utils";
import { AvisoForm } from "./aviso-form";

export default async function AvisosPage() {
  const session = await verifySession();
  const [avisos, celulas] = await Promise.all([listAllAvisos(), listCelulasForUser(session)]);
  const hoje = todayISO();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Avisos temporários</h1>
        <p className="text-sm text-muted">
          Trocas de sala, cancelamentos e exceções pontuais — substitui a antiga aba de observações
          temporárias da planilha.
        </p>
      </div>

      <Card>
        <CardHeader title="Novo aviso" />
        <div className="p-5">
          <AvisoForm celulas={celulas.map((c) => ({ id: c.id, nome: c.nome }))} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Histórico" description="Avisos mais recentes primeiro." />
        {avisos.length === 0 ? (
          <EmptyState title="Nenhum aviso registrado" />
        ) : (
          <ul className="divide-y divide-border">
            {avisos.map((a) => {
              const vencido = a.validadeAte < hoje;
              return (
                <li key={a.id} className={`px-5 py-3 text-sm ${vencido ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {formatDate(a.data)}
                      {a.horario ? ` · ${a.horario}` : ""}
                      {a.celula ? ` · ${a.celula.nome}` : " · Geral"}
                    </p>
                    <span className="text-xs text-muted">{vencido ? "Vencido" : "Ativo"}</span>
                  </div>
                  <p className="mt-1 text-muted">{a.mensagem}</p>
                  <p className="mt-1 text-xs text-muted">
                    Válido até {formatDate(a.validadeAte)} · registrado por {a.registradoPor.name}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
