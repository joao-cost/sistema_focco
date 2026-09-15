CREATE TYPE "public"."bolsa_categoria" AS ENUM('integral', 'parcial');--> statement-breakpoint
CREATE TYPE "public"."bolsa_status" AS ENUM('ativo', 'suspenso', 'encerrado');--> statement-breakpoint
CREATE TYPE "public"."documentacao_status" AS ENUM('completa', 'pendente');--> statement-breakpoint
CREATE TYPE "public"."relatorio_status" AS ENUM('entregue', 'atrasado');--> statement-breakpoint
CREATE TABLE "bolsa_relatorios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bolsa_id" uuid NOT NULL,
	"data" date NOT NULL,
	"status" "relatorio_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bolsas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"articulador_id" uuid NOT NULL,
	"categoria" "bolsa_categoria" NOT NULL,
	"vigencia_inicio" date NOT NULL,
	"vigencia_fim" date NOT NULL,
	"status" "bolsa_status" DEFAULT 'ativo' NOT NULL,
	"documentacao_status" "documentacao_status" DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chamada_presencas" (
	"chamada_id" uuid NOT NULL,
	"bolsa_id" uuid NOT NULL,
	"presente" boolean DEFAULT false NOT NULL,
	CONSTRAINT "chamada_presencas_chamada_id_bolsa_id_pk" PRIMARY KEY("chamada_id","bolsa_id")
);
--> statement-breakpoint
CREATE TABLE "chamadas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"registrado_por_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chamadas_data_unique" UNIQUE("data")
);
--> statement-breakpoint
ALTER TABLE "bolsa_relatorios" ADD CONSTRAINT "bolsa_relatorios_bolsa_id_bolsas_id_fk" FOREIGN KEY ("bolsa_id") REFERENCES "public"."bolsas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bolsas" ADD CONSTRAINT "bolsas_articulador_id_users_id_fk" FOREIGN KEY ("articulador_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chamada_presencas" ADD CONSTRAINT "chamada_presencas_chamada_id_chamadas_id_fk" FOREIGN KEY ("chamada_id") REFERENCES "public"."chamadas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chamada_presencas" ADD CONSTRAINT "chamada_presencas_bolsa_id_bolsas_id_fk" FOREIGN KEY ("bolsa_id") REFERENCES "public"."bolsas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chamadas" ADD CONSTRAINT "chamadas_registrado_por_id_users_id_fk" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;