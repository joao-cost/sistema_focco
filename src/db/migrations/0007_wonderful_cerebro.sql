CREATE TYPE "public"."reserva_tipo" AS ENUM('aplicacao', 'preparacao');--> statement-breakpoint
CREATE TABLE "reservas_sala" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"celula_id" uuid NOT NULL,
	"tipo" "reserva_tipo" NOT NULL,
	"dia_semana" "dia_semana" NOT NULL,
	"hora_inicio" varchar(5) NOT NULL,
	"hora_fim" varchar(5) NOT NULL,
	"sala" varchar(100) NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservas_sala" ADD CONSTRAINT "reservas_sala_celula_id_celulas_id_fk" FOREIGN KEY ("celula_id") REFERENCES "public"."celulas"("id") ON DELETE cascade ON UPDATE no action;