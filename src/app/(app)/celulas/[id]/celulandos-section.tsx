"use client";

import { useActionState } from "react";
import { Badge, Button, Field, FormError, Input } from "@/components/ui";
import { CELULANDO_STATUS_LABELS } from "@/lib/utils";
import { addCelulandoAction, setCelulandoStatusAction, type ActionState } from "@/lib/actions/celulas";

type Celulando = {
  id: string;
  nome: string;
  email: string | null;
  matricula: string | null;
  curso: string | null;
  status: string;
};

export function CelulandosSection({
  celulaId,
  celulandos,
  canEdit,
}: {
  celulaId: string;
  celulandos: Celulando[];
  canEdit: boolean;
}) {
  const boundAdd = addCelulandoAction.bind(null, celulaId);
  const [state, formAction, pending] = useActionState(boundAdd, undefined as ActionState);

  return (
    <div className="space-y-4">
      {celulandos.length === 0 ? (
        <p className="text-sm text-muted">Nenhum celulando cadastrado ainda.</p>
      ) : (
        <ul className="divide-y divide-border">
          {celulandos.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{c.nome}</p>
                <p className="text-xs text-muted">
                  {[c.curso, c.matricula, c.email].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge value={c.status} label={CELULANDO_STATUS_LABELS[c.status]} />
                {canEdit && c.status !== "desistente" && (
                  <form action={setCelulandoStatusAction.bind(null, celulaId, c.id, c.status === "ativo" ? "inativo" : "ativo")}>
                    <Button type="submit" variant="ghost" size="sm">
                      {c.status === "ativo" ? "Marcar inativo" : "Reativar"}
                    </Button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form action={formAction} className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <FormError message={state?.error} />
          <Field label="Nome" htmlFor="nome" error={state?.fieldErrors?.nome?.[0]}>
            <Input id="nome" name="nome" required placeholder="Nome do celulando" />
          </Field>
          <Field label="Curso" htmlFor="curso">
            <Input id="curso" name="curso" />
          </Field>
          <Field label="Matrícula" htmlFor="matricula">
            <Input id="matricula" name="matricula" />
          </Field>
          <Field label="E-mail" htmlFor="email" error={state?.fieldErrors?.email?.[0]}>
            <Input id="email" name="email" type="email" />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Adicionando..." : "Adicionar celulando"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
