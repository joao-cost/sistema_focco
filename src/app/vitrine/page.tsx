import Image from "next/image";
import Link from "next/link";
import { listVitrineCelulas } from "@/lib/queries/vitrine";
import { DIA_SEMANA_LABELS, TURNO_LABELS, cn } from "@/lib/utils";

export const metadata = {
  title: "Células FOCCO — UNEMAT Sinop",
  description: "Conheça as células cooperativas em atividade no FOCCO e entre no grupo da sua área.",
};

// Sem isso, o Next.js tenta pré-renderizar essa página estaticamente no
// build (não usa cookies/sessão como as páginas autenticadas, que já são
// dinâmicas por causa disso) — e falha, porque tentaria consultar o banco
// de dados real durante o `next build` (só temos um Postgres fake nesse
// momento, ver Dockerfile). A vitrine sempre precisa buscar as células mais
// recentes a cada request de qualquer forma.
export const dynamic = "force-dynamic";

export default async function VitrinePage() {
  const celulasList = await listVitrineCelulas();

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between bg-focco-navy px-6 py-4 sm:px-10">
        <Image src="/brand/logo-focco.png" alt="FOCCO" width={160} height={56} priority className="h-10 w-auto" />
        <Link href="/login" className="text-xs font-semibold text-white/70 hover:text-white">
          Acessar o sistema →
        </Link>
      </div>
      <div className="focco-accent-bar h-[5px]" />

      <div className="relative overflow-hidden bg-gradient-to-b from-focco-green-pale to-white px-6 py-14 text-center sm:py-16">
        <div className="absolute -top-10 -left-10 h-40 w-40 rotate-[18deg] rounded-[36px] bg-focco-blue opacity-10" />
        <div className="absolute top-5 -right-12 h-44 w-44 -rotate-[16deg] rounded-[40px] bg-focco-orange opacity-10" />
        <div className="absolute -bottom-8 left-1/3 h-24 w-24 rotate-[12deg] rounded-[22px] bg-focco-pink opacity-10" />
        <div className="relative">
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-focco-navy sm:text-4xl">
            Conectando estudantes.
            <br />
            Construindo conhecimento.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
            O FOCCO é o programa de aprendizagem cooperativa da UNEMAT, câmpus Sinop. Conheça as células em
            atividade e entre no grupo da sua área.
          </p>
        </div>
      </div>

      <div className="mx-auto mb-12 max-w-[280px] rounded-2xl border border-border p-5 text-center">
        <p className="m-0 mb-1.5 text-[13px] font-bold text-focco-navy">Nosso Instagram</p>
        <p className="m-0 mb-3.5 text-[11.5px] leading-relaxed text-muted">
          Siga-nos para acompanhar as novidades, eventos e fotos do FOCCO em Sinop.
        </p>
        <a
          href="https://www.instagram.com/focco.sinop/"
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-lg bg-focco-pink px-5 py-2 text-xs font-semibold text-white hover:bg-focco-pink-dark"
        >
          Acessar perfil
        </a>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16 sm:px-8">
        <h2 className="mb-7 text-center text-xl font-bold text-focco-navy">Células oferecidas</h2>
        {celulasList.length === 0 ? (
          <p className="text-center text-sm text-muted">Nenhuma célula divulgada no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {celulasList.map((c) => (
              <div
                key={c.id}
                className={cn("flex flex-col overflow-hidden rounded-2xl border bg-white", c.accent.border)}
              >
                <div className={cn("h-[5px]", c.accent.bg)} />
                <div className="flex h-[150px] w-full items-center justify-center bg-gray-100 text-xs text-muted">
                  Foto da célula
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="m-0 text-sm font-bold text-focco-navy">{c.nome}</p>
                  <p className={cn("m-0 text-[11.5px] font-semibold", c.accent.text)}>
                    Articulador(a): {c.articuladorNome}
                  </p>
                  {c.descricaoPublica && (
                    <p className="m-0 text-[11.5px] leading-relaxed text-muted">{c.descricaoPublica}</p>
                  )}
                  <p className="mt-1 text-[11px] text-[#98A2B3]">
                    {c.diaSemana ? DIA_SEMANA_LABELS[c.diaSemana] : "—"}
                    {c.turno ? ` · ${TURNO_LABELS[c.turno]}` : ""}
                    {c.horario ? ` · ${c.horario}` : ""}
                    {c.local ? ` · ${c.local}` : ""}
                  </p>
                  {c.whatsappLink && (
                    <a
                      href={c.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mt-2.5 rounded-lg py-2 text-center text-xs font-semibold text-white",
                        c.accent.bg
                      )}
                    >
                      Entrar no grupo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-focco-navy px-6 py-8 text-center">
        <div className="mb-3.5 flex items-center justify-center gap-5">
          <Image
            src="/brand/logo-focco.png"
            alt="FOCCO"
            width={120}
            height={42}
            className="h-8 w-auto brightness-0 invert opacity-85"
          />
          <Image
            src="/brand/logo-unemat.png"
            alt="UNEMAT"
            width={120}
            height={52}
            className="h-8 w-auto brightness-0 invert opacity-55"
          />
        </div>
        <p className="m-0 text-[11.5px] text-white/45">Iniciativa FOCCO · UNEMAT · Formação de Células Cooperativas</p>
      </div>
    </div>
  );
}
