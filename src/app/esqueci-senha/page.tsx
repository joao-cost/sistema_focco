import Image from "next/image";
import Link from "next/link";
import { EsqueciSenhaForm } from "./esqueci-senha-form";

export default function EsqueciSenhaPage() {
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
            <h1 className="mb-1 text-lg font-semibold text-foreground">Esqueci minha senha</h1>
            <p className="mb-6 text-sm text-muted">
              Informe seu e-mail cadastrado — enviaremos um link pra você definir uma nova senha.
            </p>
            <EsqueciSenhaForm />
            <Link
              href="/login"
              className="mt-5 block text-center text-sm font-medium text-focco-blue hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
