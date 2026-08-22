"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SERIES_COLOR = "#2a78d6"; // azul — hue sequencial única (uma série, sem legenda)
const GRID_COLOR = "#e4e7ec";
const TEXT_COLOR = "#667085";

type Datum = { nome: string; total: number };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted">{payload[0].value} encontro(s)</p>
    </div>
  );
}

export function EncontrosChart({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke={GRID_COLOR} strokeDasharray="0" />
        <XAxis type="number" allowDecimals={false} tick={{ fill: TEXT_COLOR, fontSize: 12 }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nome"
          width={180}
          tick={{ fill: TEXT_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
        <Bar dataKey="total" fill={SERIES_COLOR} radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
