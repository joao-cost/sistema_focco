import { z } from "zod";

export const celulaSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome da célula."),
  tema: z.string().trim().optional().or(z.literal("")),
  curso: z.string().trim().optional().or(z.literal("")),
  articuladorId: z.uuid("Selecione um articulador."),
  diaSemana: z
    .enum(["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"])
    .optional()
    .or(z.literal("")),
  turno: z.enum(["manha", "tarde", "noite"]).optional().or(z.literal("")),
  horario: z.string().trim().optional().or(z.literal("")),
  local: z.string().trim().optional().or(z.literal("")),
  observacoes: z.string().trim().optional().or(z.literal("")),
});

export const celulandoSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome do celulando."),
  email: z.email("E-mail inválido.").optional().or(z.literal("")),
  matricula: z.string().trim().optional().or(z.literal("")),
  curso: z.string().trim().optional().or(z.literal("")),
  telefone: z.string().trim().optional().or(z.literal("")),
});

export const encontroSchema = z.object({
  data: z.iso.date("Informe uma data válida."),
  conteudoTrabalhado: z.string().trim().optional().or(z.literal("")),
  duracaoMinutos: z.coerce.number().int().positive().optional(),
  processamentoGrupo: z.string().trim().optional().or(z.literal("")),
  observacoes: z.string().trim().optional().or(z.literal("")),
});

export const avisoSchema = z.object({
  celulaId: z.uuid().optional().or(z.literal("")),
  data: z.iso.date("Informe uma data válida."),
  horario: z.string().trim().optional().or(z.literal("")),
  mensagem: z.string().trim().min(5, "Descreva o aviso."),
  validadeAte: z.iso.date("Informe a validade."),
});

export const userSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome."),
  email: z.email("E-mail inválido."),
  role: z.enum(["coordenacao", "facilitador", "articulador"]),
  curso: z.string().trim().optional().or(z.literal("")),
  telefone: z.string().trim().optional().or(z.literal("")),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres.").optional().or(z.literal("")),
});

export function emptyToUndefined(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}
