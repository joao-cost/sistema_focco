import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCelulaDetail, listArticuladores } from "@/lib/queries/celulas";
import { updateCelulaAction } from "@/lib/actions/celulas";
import { Card, CardHeader } from "@/components/ui";
import { CelulaForm } from "../../celula-form";

export default async function EditarCelulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const result = await getCelulaDetail(id, session);
  if (!result || !result.canEdit) notFound();

  const { celula } = result;
  const articuladores = await listArticuladores();
  const boundAction = updateCelulaAction.bind(null, celula.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Editar célula</h1>
      <Card>
        <CardHeader title={celula.nome} />
        <div className="p-5">
          <CelulaForm
            action={boundAction}
            articuladores={articuladores}
            defaultValues={celula}
            submitLabel="Salvar alterações"
          />
        </div>
      </Card>
    </div>
  );
}
