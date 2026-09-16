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
  descricaoPublica: z.string().trim().optional().or(z.literal("")),
  whatsappLink: z.url("Link inválido.").optional().or(z.literal("")),
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

export const bolsaSchema = z.object({
  articuladorId: z.uuid("Selecione um articulador."),
  categoria: z.enum(["integral", "parcial"]),
  vigenciaInicio: z.iso.date("Informe a data de início."),
  vigenciaFim: z.iso.date("Informe a data de fim."),
});

export const relatorioSchema = z.object({
  data: z.iso.date("Informe a data do relatório."),
  status: z.enum(["entregue", "atrasado"]),
});

export const chamadaSchema = z.object({
  data: z.iso.date("Informe a data da reunião."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome."),
  telefone: z.string().trim().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z.string().min(6, "A nova senha deve ter ao menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const vaquinhaMesSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/, "Formato inválido (AAAA-MM)."),
  valorEsperado: z.coerce.number().positive("Informe um valor válido."),
});

export const marcarPagamentoSchema = z.object({
  valorPago: z.coerce.number().positive("Informe um valor válido.").optional(),
  dataPagamento: z.iso.date().optional().or(z.literal("")),
});

export const compraSchema = z.object({
  descricao: z.string().trim().min(3, "Informe a descrição."),
  valorTotal: z.coerce.number().positive("Informe um valor válido."),
  data: z.iso.date("Informe a data."),
  participantes: z.array(z.uuid()).min(1, "Selecione ao menos um participante."),
});

export const movimentacaoSchema = z.object({
  tipo: z.enum(["entrada", "saida"]),
  descricao: z.string().trim().min(3, "Informe a descrição."),
  valor: z.coerce.number().positive("Informe um valor válido."),
  data: z.iso.date("Informe a data."),
});

export const requestPasswordResetSchema = z.object({
  email: z.email("E-mail inválido."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export function emptyToUndefined(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}
