import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  date,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Papel do usuário do sistema (staff). Celulandos NÃO fazem login. */
export const userRoleEnum = pgEnum("user_role", [
  "coordenacao",
  "facilitador",
  "articulador",
]);

export const celulaStatusEnum = pgEnum("celula_status", [
  "ativa",
  "inativa",
  "encerrada",
]);

export const celulandoStatusEnum = pgEnum("celulando_status", [
  "ativo",
  "inativo",
  "desistente",
]);

export const diaSemanaEnum = pgEnum("dia_semana", [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
]);

export const turnoEnum = pgEnum("turno", ["manha", "tarde", "noite"]);

// ---------------------------------------------------------------------------
// Usuários (Coordenação / Facilitador / Articulador)
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("articulador"),
  curso: varchar("curso", { length: 255 }),
  telefone: varchar("telefone", { length: 30 }),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Células
// ---------------------------------------------------------------------------

export const celulas = pgTable("celulas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tema: varchar("tema", { length: 255 }), // ex: disciplina/conteúdo foco da célula
  curso: varchar("curso", { length: 255 }),
  articuladorId: uuid("articulador_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: celulaStatusEnum("status").notNull().default("ativa"),
  diaSemana: diaSemanaEnum("dia_semana"),
  turno: turnoEnum("turno"),
  horario: varchar("horario", { length: 60 }), // ex: "13h30 às 17h30"
  local: varchar("local", { length: 255 }), // ex: "Sala C3"
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Facilitadores que acompanham cada célula (N:N — um facilitador acompanha várias células). */
export const celulaFacilitadores = pgTable(
  "celula_facilitadores",
  {
    celulaId: uuid("celula_id")
      .notNull()
      .references(() => celulas.id, { onDelete: "cascade" }),
    facilitadorId: uuid("facilitador_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.celulaId, t.facilitadorId] })]
);

// ---------------------------------------------------------------------------
// Celulandos (participantes da célula — não fazem login no sistema)
// ---------------------------------------------------------------------------

export const celulandos = pgTable("celulandos", {
  id: uuid("id").primaryKey().defaultRandom(),
  celulaId: uuid("celula_id")
    .notNull()
    .references(() => celulas.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  matricula: varchar("matricula", { length: 60 }),
  curso: varchar("curso", { length: 255 }),
  telefone: varchar("telefone", { length: 30 }),
  status: celulandoStatusEnum("status").notNull().default("ativo"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Encontros (reuniões da célula) e Presenças
// ---------------------------------------------------------------------------

export const encontros = pgTable("encontros", {
  id: uuid("id").primaryKey().defaultRandom(),
  celulaId: uuid("celula_id")
    .notNull()
    .references(() => celulas.id, { onDelete: "cascade" }),
  data: date("data").notNull(),
  conteudoTrabalhado: text("conteudo_trabalhado"),
  duracaoMinutos: integer("duracao_minutos"),
  processamentoGrupo: text("processamento_grupo"), // notas do pilar "processamento de grupo"
  observacoes: text("observacoes"),
  registradoPorId: uuid("registrado_por_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const presencas = pgTable(
  "presencas",
  {
    encontroId: uuid("encontro_id")
      .notNull()
      .references(() => encontros.id, { onDelete: "cascade" }),
    celulandoId: uuid("celulando_id")
      .notNull()
      .references(() => celulandos.id, { onDelete: "cascade" }),
    presente: boolean("presente").notNull().default(true),
    justificativa: text("justificativa"),
  },
  (t) => [primaryKey({ columns: [t.encontroId, t.celulandoId] })]
);

// ---------------------------------------------------------------------------
// Avisos temporários (substitui a aba "Observações Temporárias" da planilha)
// ---------------------------------------------------------------------------

export const avisos = pgTable("avisos", {
  id: uuid("id").primaryKey().defaultRandom(),
  celulaId: uuid("celula_id").references(() => celulas.id, {
    onDelete: "set null",
  }),
  data: date("data").notNull(), // dia a que se refere o aviso
  horario: varchar("horario", { length: 60 }),
  mensagem: text("mensagem").notNull(),
  validadeAte: date("validade_ate").notNull(),
  registradoPorId: uuid("registrado_por_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations (para queries aninhadas via Drizzle relational API)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  celulasComoArticulador: many(celulas),
  celulasComoFacilitador: many(celulaFacilitadores),
  encontrosRegistrados: many(encontros),
}));

export const celulasRelations = relations(celulas, ({ one, many }) => ({
  articulador: one(users, {
    fields: [celulas.articuladorId],
    references: [users.id],
  }),
  facilitadores: many(celulaFacilitadores),
  celulandos: many(celulandos),
  encontros: many(encontros),
  avisos: many(avisos),
}));

export const avisosRelations = relations(avisos, ({ one }) => ({
  celula: one(celulas, {
    fields: [avisos.celulaId],
    references: [celulas.id],
  }),
  registradoPor: one(users, {
    fields: [avisos.registradoPorId],
    references: [users.id],
  }),
}));

export const celulaFacilitadoresRelations = relations(
  celulaFacilitadores,
  ({ one }) => ({
    celula: one(celulas, {
      fields: [celulaFacilitadores.celulaId],
      references: [celulas.id],
    }),
    facilitador: one(users, {
      fields: [celulaFacilitadores.facilitadorId],
      references: [users.id],
    }),
  })
);

export const celulandosRelations = relations(celulandos, ({ one, many }) => ({
  celula: one(celulas, {
    fields: [celulandos.celulaId],
    references: [celulas.id],
  }),
  presencas: many(presencas),
}));

export const encontrosRelations = relations(encontros, ({ one, many }) => ({
  celula: one(celulas, {
    fields: [encontros.celulaId],
    references: [celulas.id],
  }),
  registradoPor: one(users, {
    fields: [encontros.registradoPorId],
    references: [users.id],
  }),
  presencas: many(presencas),
}));

export const presencasRelations = relations(presencas, ({ one }) => ({
  encontro: one(encontros, {
    fields: [presencas.encontroId],
    references: [encontros.id],
  }),
  celulando: one(celulandos, {
    fields: [presencas.celulandoId],
    references: [celulandos.id],
  }),
}));
