import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { canManageAllCelulas, listCelulasForUser } from "@/lib/queries/celulas";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { CELULA_STATUS_LABELS, DIA_SEMANA_LABELS, TURNO_LABELS } from "@/lib/utils";

export default async function CelulasPage() {
  const session = await verifySession();
  const celulas = await listCelulasForUser(session);
  const canCreate = canManageAllCelulas(session);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Células</h1>
          <p className="text-sm text-muted">
            {canCreate
              ? "Cadastro e acompanhamento de todas as células do FOCCO."
              : "Células sob sua responsabilidade como articulador."}
          </p>
        </div>
        {canCreate && <LinkButton href="/celulas/nova">Nova célula</LinkButton>}
      </div>

      <Card>
        {celulas.length === 0 ? (
          <EmptyState
            title="Nenhuma célula cadastrada"
            description={
              canCreate
                ? "Comece cadastrando a primeira célula do programa."
                : "Você ainda não é articulador de nenhuma célula."
            }
            action={canCreate ? <LinkButton href="/celulas/nova">Nova célula</LinkButton> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Célula</th>
                  <th className="px-5 py-3 font-medium">Articulador</th>
                  <th className="px-5 py-3 font-medium">Quando</th>
                  <th className="px-5 py-3 font-medium">Local</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {celulas.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/celulas/${c.id}`} className="font-medium text-foreground hover:text-focco-green">
                        {c.nome}
                      </Link>
                      {c.tema && <p className="text-xs text-muted">{c.tema}</p>}
                    </td>
                    <td className="px-5 py-3 text-muted">{c.articuladorNome}</td>
                    <td className="px-5 py-3 text-muted">
                      {c.diaSemana ? DIA_SEMANA_LABELS[c.diaSemana] : "—"}
                      {c.turno ? ` · ${TURNO_LABELS[c.turno]}` : ""}
                      {c.horario ? ` · ${c.horario}` : ""}
                    </td>
                    <td className="px-5 py-3 text-muted">{c.local ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge value={c.status} label={CELULA_STATUS_LABELS[c.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
