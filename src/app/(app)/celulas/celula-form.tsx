"use client";

import { useActionState, useState } from "react";
import { Button, Field, FormError, Input, Select, Textarea } from "@/components/ui";
import { DIA_SEMANA_LABELS, TURNO_LABELS } from "@/lib/utils";
import type { ActionState } from "@/lib/actions/celulas";

export function CelulaForm({
  action,
  defaultValues,
  submitLabel = "Salvar",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    nome?: string;
    tema?: string | null;
    curso?: string | null;
    diaSemana?: string | null;
    turno?: string | null;
    horario?: string | null;
    local?: string | null;
    observacoes?: string | null;
    descricaoPublica?: string | null;
    whatsappLink?: string | null;
    logoUrl?: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState<string | null>(null);

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setPreview(null);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />

      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- pré-visualização local do arquivo escolhido
          <img src={preview} alt="" className="h-16 w-16 rounded-xl border border-border object-cover" />
        ) : defaultValues?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- vem do R2/disco, não vale a pena otimizar
          <img src={defaultValues.logoUrl} alt="" className="h-16 w-16 rounded-xl border border-border object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border text-[10px] text-muted">
            Sem logo
          </div>
        )}
        <div>
          <label
            htmlFor="logo"
            className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border-subtle"
          >
            {defaultValues?.logoUrl ? "Trocar logo" : "Enviar logo"}
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onLogoChange}
            className="hidden"
            required={!defaultValues?.logoUrl}
          />
          <p className="mt-1 text-[11px] text-muted">PNG, JPG ou WEBP, até 3MB.</p>
        </div>
      </div>

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

      <p className="m-0 -mb-2 text-[11px] text-text-tertiary">
        Dia/turno/horário/sala normalmente vêm da Agenda (horário de célula) — só edite aqui pra um ajuste manual.
      </p>

      <Field label="Descrição da célula" htmlFor="descricaoPublica" error={state?.fieldErrors?.descricaoPublica?.[0]}>
        <Textarea
          id="descricaoPublica"
          name="descricaoPublica"
          rows={3}
          required
          defaultValue={defaultValues?.descricaoPublica ?? ""}
          placeholder="Conte do que se trata a célula — esse texto aparece na vitrine pública."
        />
      </Field>

      <Field label="Link do grupo (WhatsApp) — opcional" htmlFor="whatsappLink">
        <Input
          id="whatsappLink"
          name="whatsappLink"
          type="url"
          defaultValue={defaultValues?.whatsappLink ?? ""}
          placeholder="https://chat.whatsapp.com/..."
        />
      </Field>

      <Field label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={defaultValues?.observacoes ?? ""} />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
