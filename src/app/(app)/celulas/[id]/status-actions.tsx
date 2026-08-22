"use client";

import { Button } from "@/components/ui";
import { changeCelulaStatusAction } from "@/lib/actions/celulas";

const OPTIONS = [
  { value: "ativa", label: "Ativa" },
  { value: "inativa", label: "Inativa" },
  { value: "encerrada", label: "Encerrada" },
] as const;

export function CelulaStatusActions({ celulaId, status }: { celulaId: string; status: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Status da célula</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.filter((o) => o.value !== status).map((o) => (
          <form key={o.value} action={changeCelulaStatusAction.bind(null, celulaId, o.value)}>
            <Button type="submit" variant="secondary" size="sm">
              Marcar como {o.label.toLowerCase()}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
