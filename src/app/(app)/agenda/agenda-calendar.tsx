"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createReservaAction,
  deleteReservaAction,
  updateReservaAction,
  type AgendaActionState,
} from "@/lib/actions/agenda";
import { Button, Card, Field, FormError, Input, Select, Textarea } from "@/components/ui";
import { cn, DIA_SEMANA_LABELS } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";

const theme = getModuleTheme("agenda");

type Reserva = {
  id: string;
  celulaId: string;
  celulaNome: string;
  tipo: "aplicacao" | "preparacao";
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  sala: string;
  observacoes: string | null;
};

type Celula = { id: string; nome: string };

const DIAS = Object.entries(DIA_SEMANA_LABELS);
const DIA_ABREV: Record<string, string> = {
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom",
};
const START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT = 48;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

function minutesFromStart(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h - START_HOUR) * 60 + m;
}

function layoutDay(items: Reserva[]) {
  const sorted = [...items].sort(
    (a, b) => a.horaInicio.localeCompare(b.horaInicio) || a.horaFim.localeCompare(b.horaFim)
  );
  const laneEnds: string[] = [];
  const laned = sorted.map((item) => {
    let lane = laneEnds.findIndex((end) => end <= item.horaInicio);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.horaFim);
    } else {
      laneEnds[lane] = item.horaFim;
    }
    return { ...item, lane };
  });
  const totalLanes = Math.max(laneEnds.length, 1);
  return laned.map((item) => ({ ...item, totalLanes }));
}

export function AgendaCalendar({ reservas, celulas }: { reservas: Reserva[]; celulas: Celula[] }) {
  const [selecionada, setSelecionada] = useState<Reserva | "nova" | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const porDia = useMemo(() => {
    const map = new Map<string, ReturnType<typeof layoutDay>>();
    for (const [dia] of DIAS) {
      map.set(dia, layoutDay(reservas.filter((r) => r.diaSemana === dia)));
    }
    return map;
  }, [reservas]);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <div className={cn(theme.bg, "flex flex-wrap items-center justify-between gap-3 border-b px-[18px] py-3.5", theme.border)}>
          <div>
            <p className={cn(theme.text, "m-0 text-sm font-bold")}>Grade semanal</p>
            <p className="m-0 text-[11px] text-text-tertiary">
              Recorrente — vale toda semana, até alguém editar ou excluir.
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setSelecionada("nova")}>
            + Nova reserva
          </Button>
        </div>

        {aviso && (
          <div className="flex items-center justify-between gap-3 border-b border-focco-orange-pale bg-focco-orange-pale/60 px-[18px] py-2.5 text-xs font-medium text-focco-orange-dark">
            <span>{aviso}</span>
            <button type="button" onClick={() => setAviso(null)} className="font-semibold underline-offset-2 hover:underline">
              Ok
            </button>
          </div>
        )}

        <div className="flex gap-3 border-b border-border-subtle px-[18px] py-2.5 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-focco-blue" /> Horário de célula
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-focco-orange bg-focco-orange-pale" /> Horário de preparação
          </span>
        </div>

        <div className="overflow-x-auto p-[18px]">
          <div className="grid min-w-[760px] grid-cols-[52px_repeat(7,1fr)] gap-1">
            <div />
            {DIAS.map(([dia, label]) => (
              <div key={dia} className="pb-1.5 text-center text-xs font-semibold text-foreground" title={label}>
                {DIA_ABREV[dia]}
              </div>
            ))}

            <div className="relative" style={{ height: TOTAL_HEIGHT }}>
              {hours.map((h) => (
                <span
                  key={h}
                  className="absolute right-1 -translate-y-1/2 text-[10px] text-text-tertiary"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                >
                  {String(h).padStart(2, "0")}h
                </span>
              ))}
            </div>

            {DIAS.map(([dia]) => (
              <div
                key={dia}
                className="relative rounded-md bg-surface-subtle"
                style={{
                  height: TOTAL_HEIGHT,
                  backgroundImage: `repeating-linear-gradient(to bottom, var(--border-subtle) 0, var(--border-subtle) 1px, transparent 1px, transparent ${HOUR_HEIGHT}px)`,
                }}
              >
                {(porDia.get(dia) ?? []).map((r) => {
                  const top = (minutesFromStart(r.horaInicio) / 60) * HOUR_HEIGHT;
                  const height = Math.max(((minutesFromStart(r.horaFim) - minutesFromStart(r.horaInicio)) / 60) * HOUR_HEIGHT, 18);
                  const width = 100 / r.totalLanes;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelecionada(r)}
                      className={cn(
                        "absolute overflow-hidden rounded-md px-1.5 py-1 text-left text-[10px] leading-tight shadow-sm transition-opacity hover:opacity-90",
                        r.tipo === "aplicacao"
                          ? "bg-focco-blue text-white"
                          : "border border-focco-orange bg-focco-orange-pale text-focco-orange-dark"
                      )}
                      style={{ top, height, left: `${r.lane * width}%`, width: `calc(${width}% - 2px)` }}
                      title={`${r.celulaNome} · ${r.sala} · ${r.horaInicio}–${r.horaFim}`}
                    >
                      <p className="m-0 truncate font-semibold">{r.celulaNome}</p>
                      <p className="m-0 truncate opacity-90">
                        {r.sala} · {r.horaInicio}–{r.horaFim}
                      </p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {selecionada && (
        <ReservaForm
          initial={selecionada === "nova" ? undefined : selecionada}
          celulas={celulas}
          onCancel={() => setSelecionada(null)}
          onSaved={(warning) => {
            setSelecionada(null);
            if (warning) setAviso(warning);
          }}
        />
      )}
    </div>
  );
}

function ReservaForm({
  initial,
  celulas,
  onCancel,
  onSaved,
}: {
  initial?: Reserva;
  celulas: Celula[];
  onCancel: () => void;
  onSaved: (warning?: string) => void;
}) {
  const action = initial ? updateReservaAction.bind(null, initial.id) : createReservaAction;
  const [state, formAction, pending] = useActionState<AgendaActionState, FormData>(action, undefined);
  const [tipo, setTipo] = useState<"aplicacao" | "preparacao">(initial?.tipo ?? "aplicacao");
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onSaved(state?.warning);
    }
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  return (
    <Card>
      <div className={cn(theme.bg, "flex items-center justify-between gap-3 border-b px-[18px] py-3.5", theme.border)}>
        <p className={cn(theme.text, "m-0 text-sm font-bold")}>{initial ? "Editar reserva" : "Nova reserva"}</p>
        <button type="button" onClick={onCancel} className="text-xs font-semibold text-text-secondary hover:underline">
          Fechar
        </button>
      </div>

      <form action={formAction} className="grid gap-4 p-[18px] sm:grid-cols-2">
        <FormError message={state?.error} />

        <Field label="Célula" htmlFor="celulaId" error={state?.fieldErrors?.celulaId?.[0]}>
          <Select id="celulaId" name="celulaId" required defaultValue={initial?.celulaId ?? ""}>
            <option value="" disabled>
              Selecione...
            </option>
            {celulas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tipo" htmlFor="tipo">
          <Select
            id="tipo"
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "aplicacao" | "preparacao")}
          >
            <option value="aplicacao">Horário de célula</option>
            <option value="preparacao">Horário de preparação (sala C1)</option>
          </Select>
        </Field>

        <Field label="Dia da semana" htmlFor="diaSemana" error={state?.fieldErrors?.diaSemana?.[0]}>
          <Select id="diaSemana" name="diaSemana" required defaultValue={initial?.diaSemana ?? ""}>
            <option value="" disabled>
              Selecione...
            </option>
            {DIAS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        {tipo === "aplicacao" ? (
          <Field label="Sala" htmlFor="sala" error={state?.fieldErrors?.sala?.[0]}>
            <Input id="sala" name="sala" required defaultValue={initial?.sala ?? ""} placeholder="Ex: I1" />
          </Field>
        ) : (
          <Field label="Sala">
            <Input value="C1 (fixo para preparação)" disabled />
          </Field>
        )}

        <Field label="Hora início" htmlFor="horaInicio" error={state?.fieldErrors?.horaInicio?.[0]}>
          <Input id="horaInicio" name="horaInicio" type="time" required defaultValue={initial?.horaInicio ?? ""} />
        </Field>
        <Field label="Hora fim" htmlFor="horaFim" error={state?.fieldErrors?.horaFim?.[0]}>
          <Input id="horaFim" name="horaFim" type="time" required defaultValue={initial?.horaFim ?? ""} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Observações" htmlFor="observacoes">
            <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={initial?.observacoes ?? ""} />
          </Field>
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          {initial && (
            <form
              action={async () => {
                await deleteReservaAction(initial.id);
                onSaved();
              }}
            >
              <Button type="submit" variant="danger">
                Excluir
              </Button>
            </form>
          )}
        </div>
      </form>
    </Card>
  );
}
