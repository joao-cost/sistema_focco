import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export const ROLE_LABELS: Record<string, string> = {
  coordenacao: "Coordenação",
  facilitador: "Facilitador",
  articulador: "Articulador",
};

export const CELULA_STATUS_LABELS: Record<string, string> = {
  ativa: "Ativa",
  inativa: "Inativa",
  encerrada: "Encerrada",
};

export const CELULANDO_STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  desistente: "Desistente",
};

export const DIA_SEMANA_LABELS: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const TURNO_LABELS: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
