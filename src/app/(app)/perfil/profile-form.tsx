"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { Avatar, Button, Field, FormError, Input } from "@/components/ui";

export function ProfileForm({
  name,
  telefone,
  avatarUrl,
}: {
  name: string;
  telefone: string | null;
  avatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  const [preview, setPreview] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setPreview(null);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- pré-visualização local do arquivo escolhido, nunca é uma URL remota
          <img src={preview} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <Avatar name={name} imageUrl={avatarUrl} className="h-14 w-14 text-base" />
        )}
        <div>
          <label
            htmlFor="avatar"
            className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border-subtle"
          >
            Trocar foto
          </label>
          <input id="avatar" name="avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} className="hidden" />
          <p className="mt-1 text-[11px] text-muted">PNG, JPG ou WEBP, até 3MB.</p>
        </div>
      </div>

      <Field label="Nome" htmlFor="name" error={state?.fieldErrors?.name?.[0]}>
        <Input id="name" name="name" required defaultValue={name} />
      </Field>
      <Field label="Telefone" htmlFor="telefone">
        <Input id="telefone" name="telefone" defaultValue={telefone ?? ""} placeholder="(66) 9...." />
      </Field>

      {state?.success && (
        <p className="rounded-lg border border-focco-green/25 bg-focco-green-pale/60 px-3.5 py-2.5 text-sm font-medium text-focco-green-dark">
          {state.success}
        </p>
      )}
      <FormError message={state?.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
