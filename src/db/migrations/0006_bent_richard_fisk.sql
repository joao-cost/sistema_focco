CREATE TYPE "public"."movimentacao_tipo" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TABLE "compra_participantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compra_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"valor_devido" numeric(10, 2) NOT NULL,
	"pago" boolean DEFAULT false NOT NULL,
	"data_pagamento" date
);
--> statement-breakpoint
CREATE TABLE "compras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"descricao" varchar(255) NOT NULL,
	"valor_total" numeric(10, 2) NOT NULL,
	"data" date NOT NULL,
	"registrado_por_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movimentacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "movimentacao_tipo" NOT NULL,
	"descricao" varchar(255) NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"data" date NOT NULL,
	"registrado_por_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vaquinha_pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competencia" varchar(7) NOT NULL,
	"user_id" uuid NOT NULL,
	"valor_esperado" numeric(10, 2) NOT NULL,
	"pago" boolean DEFAULT false NOT NULL,
	"valor_pago" numeric(10, 2),
	"data_pagamento" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compra_participantes" ADD CONSTRAINT "compra_participantes_compra_id_compras_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_participantes" ADD CONSTRAINT "compra_participantes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compras" ADD CONSTRAINT "compras_registrado_por_id_users_id_fk" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_registrado_por_id_users_id_fk" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaquinha_pagamentos" ADD CONSTRAINT "vaquinha_pagamentos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;