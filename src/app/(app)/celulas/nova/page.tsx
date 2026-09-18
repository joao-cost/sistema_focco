import { verifySession } from "@/lib/dal";
import { createCelulaAction } from "@/lib/actions/celulas";
import { Card, CardHeader } from "@/components/ui";
import { CelulaForm } from "../celula-form";

export default async function NovaCelulaPage() {
  await verifySession();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Nova célula</h1>
      <Card>
        <CardHeader title="Dados da célula" description="Você vira o articulador dessa célula automaticamente." />
        <div className="p-5">
          <CelulaForm action={createCelulaAction} submitLabel="Cadastrar célula" />
        </div>
      </Card>
    </div>
  );
}
