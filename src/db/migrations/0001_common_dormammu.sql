CREATE TYPE "public"."dia_semana" AS ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');--> statement-breakpoint
CREATE TYPE "public"."turno" AS ENUM('manha', 'tarde', 'noite');--> statement-breakpoint
CREATE TABLE "avisos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"celula_id" uuid,
	"data" date NOT NULL,
	"horario" varchar(60),
	"mensagem" text NOT NULL,
	"validade_ate" date NOT NULL,
	"registrado_por_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "celulas" ALTER COLUMN "dia_semana" SET DATA TYPE "public"."dia_semana" USING "dia_semana"::"public"."dia_semana";--> statement-breakpoint
ALTER TABLE "celulas" ALTER COLUMN "horario" SET DATA TYPE varchar(60);--> statement-breakpoint
ALTER TABLE "celulas" ADD COLUMN "turno" "turno";--> statement-breakpoint
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_celula_id_celulas_id_fk" FOREIGN KEY ("celula_id") REFERENCES "public"."celulas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_registrado_por_id_users_id_fk" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;