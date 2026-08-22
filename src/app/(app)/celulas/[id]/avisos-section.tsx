"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Textarea } from "@/components/ui";
import { formatDate, todayISO } from "@/lib/utils";
import { createAvisoAction, type ActionState } from "@/lib/actions/celulas";

type Aviso = {
  id: string;
  data: string;
  horario: string | null;
  mensagem: string;
  validadeAte: string;
};

export function AvisosSection({
  celulaId,
  avisos,
  canEdit,
}: {
  celulaId: string;
  avisos: Aviso[];
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(createAvisoAction, undefined as ActionState);

  return (
    <div className="space-y-4">
      {avisos.length === 0 ? (
        <p className="text-sm text-muted">Nenhum aviso temporário ativo para esta célula.</p>
      ) : (
        <ul className="space-y-2">
          {avisos.map((a) => (
            <li key={a.id} className="rounded-lg border border-focco-orange/30 bg-focco-orange/5 px-3 py-2 text-sm">
              <p className="font-medium text-foreground">
                {formatDate(a.data)}
                {a.horario ? ` · ${a.horario}` : ""}
              </p>
              <p className="text-muted">{a.mensagem}</p>
              <p className="text-xs text-muted">Válido até {formatDate(a.validadeAte)}</p>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form action={formAction} className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <input type="hidden" name="celulaId" value={celulaId} />
          <FormError message={state?.error} />
          <Field label="Data" htmlFor="data" error={state?.fieldErrors?.data?.[0]}>
            <Input id="data" name="data" type="date" required defaultValue={todayISO()} />
          </Field>
          <Field label="Horário" htmlFor="horario">
            <Input id="horario" name="horario" placeholder="Ex: 15h às 17h" />
          </Field>
          <Field label="Válido até" htmlFor="validadeAte" error={state?.fieldErrors?.validadeAte?.[0]}>
            <Input id="validadeAte" name="validadeAte" type="date" required defaultValue={todayISO()} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mensagem" htmlFor="mensagem" error={state?.fieldErrors?.mensagem?.[0]}>
              <Textarea
                id="mensagem"
                name="mensagem"
                rows={2}
                required
                placeholder="Ex: Hoje a célula será na sala X por motivo de reunião."
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Salvando..." : "Registrar aviso"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
