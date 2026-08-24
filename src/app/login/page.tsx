import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-focco-navy px-4 py-12">
      {/* Glows de fundo nas cores da marca — sutis, só pra dar profundidade */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-focco-green/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-16 h-[28rem] w-[28rem] rounded-full bg-focco-blue/20 blur-[110px]" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-focco-pink/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 -z-10 rounded-full bg-focco-green/25 blur-2xl" />
            <Image
              src="/brand/logo-focco.png"
              alt="FOCCO — Formação de Células Cooperativas"
              width={200}
              height={70}
              priority
              className="h-auto w-44"
            />
          </div>
          <p className="text-sm font-medium tracking-wide text-white/70">
            Formação de Células Cooperativas
          </p>
          <p className="text-xs text-white/40">UNEMAT — Câmpus Sinop</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/40">
          <div className="focco-accent-bar h-1.5" />
          <div className="p-7">
            <h1 className="mb-1 text-lg font-semibold text-foreground">Entrar</h1>
            <p className="mb-6 text-sm text-muted">
              Acesse com o e-mail e senha cadastrados pela coordenação.
            </p>
            <LoginForm callbackUrl={callbackUrl ?? "/"} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center opacity-60">
          <Image
            src="/brand/logo-unemat.png"
            alt="UNEMAT"
            width={140}
            height={61}
            className="h-auto w-32 brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
}
