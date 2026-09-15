import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; "senha-redefinida"?: string }>;
}) {
  const { callbackUrl, "senha-redefinida": senhaRedefinida } = await searchParams;
  const successBanner = senhaRedefinida ? (
    <div className="mb-4 rounded-lg border border-focco-green/25 bg-focco-green-pale/60 px-3.5 py-2.5 text-sm font-medium text-focco-green-dark">
      Senha atualizada! Já pode entrar com a nova senha.
    </div>
  ) : null;

  return (
    <div className="min-h-screen">
      {/* Desktop (≥760px): split-screen navy | formulário */}
      <div className="hidden min-h-screen md:flex">
        <div className="relative flex w-[42%] min-w-[340px] flex-col items-center justify-center gap-6 bg-focco-navy p-10">
          <Image src="/brand/logo-focco.png" alt="FOCCO" width={150} height={53} priority className="h-auto w-[150px]" />
          <div className="max-w-[280px] text-center">
            <p className="m-0 text-[13px] font-semibold tracking-wide text-white/80">
              Formação de Células Cooperativas
            </p>
            <p className="mt-1.5 text-[11.5px] text-white/45">UNEMAT · Câmpus Sinop</p>
          </div>
          <Image
            src="/brand/logo-unemat.png"
            alt="UNEMAT"
            width={86}
            height={38}
            className="absolute bottom-8 h-auto w-[86px] brightness-0 invert opacity-55"
          />
        </div>
        <div className="w-1 bg-gradient-to-b from-focco-green via-focco-blue via-focco-orange to-focco-pink" />
        <div className="flex flex-1 flex-col items-center justify-center p-10">
          <div className="w-full max-w-[340px]">
            <h1 className="mb-1.5 text-[22px] font-bold text-focco-navy">Entrar</h1>
            <p className="mb-7 text-[13px] text-muted">
              Acesse com o e-mail e senha cadastrados pela coordenação.
            </p>
            {successBanner}
            <LoginForm callbackUrl={callbackUrl ?? "/"} variant="desktop" />
          </div>
        </div>
      </div>

      {/* Mobile (<760px): fundo navy + card branco */}
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-focco-navy px-5 py-8 md:hidden">
        <div className="absolute -top-10 -right-10 h-36 w-36 rotate-[20deg] rounded-[28px] bg-focco-green opacity-15" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 -rotate-[15deg] rounded-[32px] bg-focco-blue opacity-15" />
        <Image
          src="/brand/logo-focco.png"
          alt="FOCCO"
          width={130}
          height={46}
          priority
          className="relative z-10 mb-6 h-auto w-[130px]"
        />
        <div className="relative z-10 w-full max-w-[320px] overflow-hidden rounded-2xl bg-surface shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <div className="focco-accent-bar h-[5px]" />
          <div className="p-[22px]">
            <h1 className="mb-1 text-[17px] font-bold text-focco-navy">Entrar</h1>
            <p className="mb-[18px] text-xs text-muted">Acesse com seu e-mail institucional.</p>
            {successBanner}
            <LoginForm callbackUrl={callbackUrl ?? "/"} variant="mobile" />
          </div>
        </div>
        <Image
          src="/brand/logo-unemat.png"
          alt="UNEMAT"
          width={70}
          height={31}
          className="relative z-10 mt-[18px] h-auto w-[70px] brightness-0 invert opacity-50"
        />
      </div>
    </div>
  );
}
