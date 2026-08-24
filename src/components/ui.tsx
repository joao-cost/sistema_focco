import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-sm shadow-black/[0.03]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
} as const;

const BUTTON_VARIANTS = {
  primary:
    "bg-focco-green text-white shadow-sm shadow-focco-green/20 hover:bg-focco-green-dark",
  secondary: "border border-border bg-surface text-foreground hover:bg-gray-50",
  ghost: "text-foreground hover:bg-gray-100",
  danger: "bg-focco-red text-white shadow-sm shadow-focco-red/20 hover:bg-focco-red-dark",
} as const;

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        BUTTON_SIZES[size],
        BUTTON_VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98]",
        BUTTON_SIZES[size],
        BUTTON_VARIANTS[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

const FIELD_BASE =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-focco-blue focus:outline-none focus:ring-2 focus:ring-focco-blue/25";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_BASE, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_BASE, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD_BASE, className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-focco-red">{error}</p>}
    </div>
  );
}

// Chips usando a paleta oficial FOCCO (tom pálido de fundo + tom escuro no
// texto, mesma lógica das cores nomeadas em paleta.png).
const BADGE_STYLES: Record<string, string> = {
  ativa: "bg-focco-green-pale text-focco-green-dark",
  ativo: "bg-focco-green-pale text-focco-green-dark",
  inativa: "bg-gray-100 text-gray-700",
  inativo: "bg-gray-100 text-gray-700",
  encerrada: "bg-gray-200 text-gray-600",
  desistente: "bg-focco-red-pale text-focco-red-dark",
  coordenacao: "bg-focco-blue-pale text-focco-blue-dark",
  facilitador: "bg-focco-orange-pale text-focco-orange-dark",
  articulador: "bg-focco-green-pale text-focco-green-dark",
};

export function Badge({ value, label }: { value: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        BADGE_STYLES[value] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

const STAT_ACCENTS = ["focco-green", "focco-blue", "focco-orange", "focco-pink"] as const;

export function StatTile({
  label,
  value,
  description,
  accent = 0,
}: {
  label: string;
  value: string | number;
  description?: string;
  /** Índice (0-3) na sequência de cores da marca — dá variedade visual num grid de tiles. */
  accent?: number;
}) {
  const color = STAT_ACCENTS[accent % STAT_ACCENTS.length];
  return (
    <Card className="relative overflow-hidden p-5 pl-6">
      <span
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: `var(--${color})` }}
      />
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    </Card>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-focco-red/25 bg-focco-red-pale/60 px-3.5 py-2.5 text-sm font-medium text-focco-red-dark">
      {message}
    </div>
  );
}
