"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Select, Textarea } from "@/components/ui";
import { DIA_SEMANA_LABELS, TURNO_LABELS } from "@/lib/utils";
import type { ActionState } from "@/lib/actions/celulas";

type Articulador = { id: string; name: string; email: string };

export function CelulaForm({
  action,
  articuladores,
  defaultValues,
  submitLabel = "Salvar",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  articuladores: Articulador[];
  defaultValues?: {
    nome?: string;
    tema?: string | null;
    curso?: string | null;
    articuladorId?: string;
    diaSemana?: string | null;
    turno?: string | null;
    horario?: string | null;
    local?: string | null;
    observacoes?: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome da célula" htmlFor="nome" error={state?.fieldErrors?.nome?.[0]}>
          <Input id="nome" name="nome" required defaultValue={defaultValues?.nome} placeholder="Ex: MATENG" />
        </Field>
        <Field label="Tema / conteúdo" htmlFor="tema">
          <Input id="tema" name="tema" defaultValue={defaultValues?.tema ?? ""} placeholder="Ex: Matemática para Engenharia" />
        </Field>
        <Field label="Curso relacionado" htmlFor="curso">
          <Input id="curso" name="curso" defaultValue={defaultValues?.curso ?? ""} />
        </Field>
        <Field label="Articulador responsável" htmlFor="articuladorId" error={state?.fieldErrors?.articuladorId?.[0]}>
          <Select id="articuladorId" name="articuladorId" required defaultValue={defaultValues?.articuladorId ?? ""}>
            <option value="" disabled>
              Selecione...
            </option>
            {articuladores.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dia da semana" htmlFor="diaSemana">
          <Select id="diaSemana" name="diaSemana" defaultValue={defaultValues?.diaSemana ?? ""}>
            <option value="">—</option>
            {Object.entries(DIA_SEMANA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Turno" htmlFor="turno">
          <Select id="turno" name="turno" defaultValue={defaultValues?.turno ?? ""}>
            <option value="">—</option>
            {Object.entries(TURNO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Horário" htmlFor="horario">
          <Input
            id="horario"
            name="horario"
            defaultValue={defaultValues?.horario ?? ""}
            placeholder="Ex: 13h30 às 17h30"
          />
        </Field>
        <Field label="Sala / local" htmlFor="local">
          <Input id="local" name="local" defaultValue={defaultValues?.local ?? ""} placeholder="Ex: Sala C3" />
        </Field>
      </div>

      <Field label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={defaultValues?.observacoes ?? ""} />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
