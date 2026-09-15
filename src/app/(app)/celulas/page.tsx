import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { canManageAllCelulas, listCelulasForUser } from "@/lib/queries/celulas";
import { Badge, Card, EmptyState, LinkButton, PageHeaderBand } from "@/components/ui";
import { CELULA_STATUS_LABELS, DIA_SEMANA_LABELS, TURNO_LABELS } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default async function CelulasPage() {
  const session = await verifySession();
  const celulas = await listCelulasForUser(session);
  const canCreate = canManageAllCelulas(session);
  const theme = getModuleTheme("celulas");

  return (
    <div>
      {canCreate && (
        <div className="mb-3 flex justify-end">
          <LinkButton href="/celulas/nova">Nova célula</LinkButton>
        </div>
      )}

      <PageHeaderBand
        module="celulas"
        title="Células"
        description={
          canCreate
            ? "Cadastro e acompanhamento de todas as células do FOCCO."
            : "Células sob sua responsabilidade como articulador."
        }
      />

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
                <tr className={cn(theme.bg, "border-b", theme.border)}>
                  {["Célula", "Articulador", "Dia / Turno / Horário", "Local", "Status"].map((h) => (
                    <th
                      key={h}
                      className={cn(theme.text, "px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide")}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {celulas.map((c) => (
                  <tr key={c.id} className="border-b border-[#F2F4F7] last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/celulas/${c.id}`} className="font-semibold text-foreground hover:text-focco-blue">
                        {c.nome}
                      </Link>
                      {c.tema && <p className="text-xs text-muted">{c.tema}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-[#344054]">{c.articuladorNome}</td>
                    <td className="px-5 py-3.5 text-[#344054]">
                      {c.diaSemana ? DIA_SEMANA_LABELS[c.diaSemana] : "—"}
                      {c.turno ? ` · ${TURNO_LABELS[c.turno]}` : ""}
                      {c.horario ? ` · ${c.horario}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-[#344054]">{c.local ?? "—"}</td>
                    <td className="px-5 py-3.5">
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
