import { verifySession } from "@/lib/dal";
import { canManageAllCelulas, listAllCelulas } from "@/lib/queries/celulas";
import { PageHeaderBand } from "@/components/ui";
import { CelulasList } from "./celulas-list";

export default async function CelulasPage() {
  const session = await verifySession();
  const celulas = await listAllCelulas();
  const podeEditarTudo = canManageAllCelulas(session);

  const comPermissao = celulas.map((c) => ({
    ...c,
    canEdit: podeEditarTudo || c.articuladorId === session.user.id,
  }));

  return (
    <div>
      <PageHeaderBand
        module="celulas"
        title="Células"
        description="Cadastro e acompanhamento de todas as células do FOCCO."
      />
      <CelulasList celulas={comPermissao} meuUserId={session.user.id} />
    </div>
  );
}
