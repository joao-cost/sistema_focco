CREATE TYPE "public"."celula_status" AS ENUM('ativa', 'inativa', 'encerrada');--> statement-breakpoint
CREATE TYPE "public"."celulando_status" AS ENUM('ativo', 'inativo', 'desistente');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('coordenacao', 'facilitador', 'articulador');--> statement-breakpoint
CREATE TABLE "celula_facilitadores" (
	"celula_id" uuid NOT NULL,
	"facilitador_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "celula_facilitadores_celula_id_facilitador_id_pk" PRIMARY KEY("celula_id","facilitador_id")
);
--> statement-breakpoint
CREATE TABLE "celulandos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"celula_id" uuid NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255),
	"matricula" varchar(60),
	"curso" varchar(255),
	"telefone" varchar(30),
	"status" "celulando_status" DEFAULT 'ativo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "celulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"tema" varchar(255),
	"curso" varchar(255),
	"articulador_id" uuid NOT NULL,
	"status" "celula_status" DEFAULT 'ativa' NOT NULL,
	"dia_semana" varchar(30),
	"horario" varchar(30),
	"local" varchar(255),
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encontros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"celula_id" uuid NOT NULL,
	"data" date NOT NULL,
	"conteudo_trabalhado" text,
	"duracao_minutos" integer,
	"processamento_grupo" text,
	"observacoes" text,
	"registrado_por_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presencas" (
	"encontro_id" uuid NOT NULL,
	"celulando_id" uuid NOT NULL,
	"presente" boolean DEFAULT true NOT NULL,
	"justificativa" text,
	CONSTRAINT "presencas_encontro_id_celulando_id_pk" PRIMARY KEY("encontro_id","celulando_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'articulador' NOT NULL,
	"curso" varchar(255),
	"telefone" varchar(30),
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "celula_facilitadores" ADD CONSTRAINT "celula_facilitadores_celula_id_celulas_id_fk" FOREIGN KEY ("celula_id") REFERENCES "public"."celulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celula_facilitadores" ADD CONSTRAINT "celula_facilitadores_facilitador_id_users_id_fk" FOREIGN KEY ("facilitador_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celulandos" ADD CONSTRAINT "celulandos_celula_id_celulas_id_fk" FOREIGN KEY ("celula_id") REFERENCES "public"."celulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celulas" ADD CONSTRAINT "celulas_articulador_id_users_id_fk" FOREIGN KEY ("articulador_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encontros" ADD CONSTRAINT "encontros_celula_id_celulas_id_fk" FOREIGN KEY ("celula_id") REFERENCES "public"."celulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encontros" ADD CONSTRAINT "encontros_registrado_por_id_users_id_fk" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_encontro_id_encontros_id_fk" FOREIGN KEY ("encontro_id") REFERENCES "public"."encontros"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_celulando_id_celulandos_id_fk" FOREIGN KEY ("celulando_id") REFERENCES "public"."celulandos"("id") ON DELETE cascade ON UPDATE no action;