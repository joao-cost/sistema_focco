import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCelulaDetail } from "@/lib/queries/celulas";
import { Card, CardHeader } from "@/components/ui";
import { EncontroForm } from "./encontro-form";

export default async function NovoEncontroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const result = await getCelulaDetail(id, session);
  if (!result || !result.canEdit) notFound();

  const { celula } = result;
  const celulandosAtivos = celula.celulandos.filter((c) => c.status === "ativo");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Registrar encontro — {celula.nome}</h1>
      <Card>
        <CardHeader title="Novo encontro" description="Registre o conteúdo trabalhado e a frequência dos celulandos." />
        <div className="p-5">
          <EncontroForm celulaId={celula.id} celulandos={celulandosAtivos} />
        </div>
      </Card>
    </div>
  );
}
