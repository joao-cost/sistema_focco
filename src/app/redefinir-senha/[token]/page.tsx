import Image from "next/image";
import Link from "next/link";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";
import { hashToken } from "@/lib/tokens";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

export default async function RedefinirSenhaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [record] = await db
    .select({ id: passwordResetTokens.id })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-focco-navy px-4 py-12">
      <div className="absolute -top-10 -right-10 h-36 w-36 rotate-[20deg] rounded-[28px] bg-focco-blue opacity-15" />
      <div className="absolute -bottom-12 -left-8 h-40 w-40 -rotate-[15deg] rounded-[32px] bg-focco-green opacity-15" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo-focco.png"
            alt="FOCCO — Formação de Células Cooperativas"
            width={200}
            height={70}
            priority
            className="mb-5 h-auto w-44"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-surface shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <div className="focco-accent-bar h-[5px]" />
          <div className="p-7">
            {record ? (
              <>
                <h1 className="mb-1 text-lg font-semibold text-foreground">Defina sua senha</h1>
                <p className="mb-6 text-sm text-muted">Escolha uma senha com pelo menos 6 caracteres.</p>
                <RedefinirSenhaForm token={token} />
              </>
            ) : (
              <>
                <h1 className="mb-1 text-lg font-semibold text-foreground">Link inválido ou expirado</h1>
                <p className="mb-6 text-sm text-muted">
                  Esse link já foi usado, expirou (validade de 1 hora) ou não existe. Solicite um novo.
                </p>
                <Link
                  href="/esqueci-senha"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-focco-green px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-focco-green/20 transition-all hover:bg-focco-green-dark"
                >
                  Solicitar novo link
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
