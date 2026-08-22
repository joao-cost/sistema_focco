import { requireRole } from "@/lib/dal";
import { listArticuladores } from "@/lib/queries/celulas";
import { createCelulaAction } from "@/lib/actions/celulas";
import { Card, CardHeader } from "@/components/ui";
import { CelulaForm } from "../celula-form";

export default async function NovaCelulaPage() {
  await requireRole("coordenacao", "facilitador");
  const articuladores = await listArticuladores();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Nova célula</h1>
      <Card>
        <CardHeader title="Dados da célula" description="Preencha as informações básicas para cadastrar a célula." />
        <div className="p-5">
          <CelulaForm action={createCelulaAction} articuladores={articuladores} submitLabel="Cadastrar célula" />
        </div>
      </Card>
    </div>
  );
}
