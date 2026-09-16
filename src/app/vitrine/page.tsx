import Image from "next/image";
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

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.05.8.82-2.97-.2-.3a8.2 8.2 0 1 1 6.91 3.8Zm4.5-6.13c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.12-.56.12-.17.25-.65.8-.79.96-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Fundo decorativo — fitas fluidas coloridas na diagonal, inspirado na
 * textura oficial do FOCCO (camiseta/identidade visual), não nos blocos
 * geométricos do protótipo original. Mais "cheio" e vibrante de propósito.
 */
function DecorRibbons() {
  const RIBBONS = [
    { d: "M -100 780 C 150 620, 250 500, 420 430 S 680 260, 950 40", color: "var(--focco-green)", w: 26, o: 0.55 },
    { d: "M -60 850 C 200 700, 320 560, 480 480 S 760 300, 1050 90", color: "var(--focco-orange)", w: 22, o: 0.55 },
    { d: "M -40 900 C 260 760, 380 610, 540 520 S 830 330, 1150 130", color: "var(--focco-blue)", w: 20, o: 0.5 },
    { d: "M 0 950 C 300 820, 430 650, 600 560 S 900 360, 1220 170", color: "var(--focco-red)", w: 16, o: 0.45 },
    { d: "M 950 -80 C 780 120, 700 240, 640 360 S 500 600, 260 760", color: "var(--focco-pink)", w: 24, o: 0.4 },
    { d: "M 1250 -60 C 1080 140, 980 280, 900 400 S 720 660, 460 820", color: "var(--focco-green)", w: 14, o: 0.35 },
    { d: "M 1350 100 C 1150 280, 1050 420, 960 540 S 760 780, 520 920", color: "var(--focco-orange)", w: 10, o: 0.35 },
  ];
  const HAIRLINES = [
    "M -100 200 C 300 100, 700 300, 1300 150",
    "M -100 450 C 400 350, 800 550, 1300 400",
    "M -100 650 C 350 750, 750 550, 1300 680",
    "M 200 -50 C 350 250, 250 550, 450 950",
    "M 900 -50 C 800 250, 950 550, 800 950",
  ];

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
    >
      {HAIRLINES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="white" strokeWidth={1} opacity={0.07} />
      ))}
      {RIBBONS.map((r, i) => (
        <path
          key={i}
          d={r.d}
          fill="none"
          stroke={r.color}
          strokeWidth={r.w}
          strokeLinecap="round"
          opacity={r.o}
        />
      ))}
    </svg>
  );
}

export default async function VitrinePage() {
  const celulasList = await listVitrineCelulas();

  return (
    <div className="relative min-h-screen overflow-hidden bg-focco-navy">
      <DecorRibbons />

      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        {/* Painel principal — logo/tagline + Instagram, tudo num card só (igual a vitrine anterior) */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-focco-navy-deep/60 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
          <div className="grid gap-8 sm:grid-cols-2 sm:items-center sm:divide-x sm:divide-white/10">
            <div className="flex flex-col items-center text-center sm:pr-8">
              <Image src="/brand/logo-focco.png" alt="FOCCO" width={200} height={70} priority className="mb-5 h-auto w-48" />
              <p className="text-lg font-bold leading-snug text-white sm:text-xl">
                Conectando estudantes.
                <br />
                Construindo conhecimento.
              </p>
            </div>
            <div className="text-center sm:pl-8 sm:text-left">
              <div className="mb-3 flex items-center justify-center gap-2.5 sm:justify-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-focco-orange to-focco-pink text-white">
                  <InstagramIcon />
                </div>
                <p className="text-lg font-bold text-white">
                  Nosso <span className="bg-gradient-to-r from-focco-orange to-focco-pink bg-clip-text text-transparent">Instagram</span>
                </p>
              </div>
              <p className="mb-5 text-[13px] leading-relaxed text-white/60">
                Siga-nos para acompanhar todas as novidades, eventos e fotos do projeto FOCCO em Sinop.
              </p>
              <a
                href="https://www.instagram.com/focco.sinop/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-focco-orange to-focco-pink px-7 py-3 text-sm font-bold text-white shadow-lg shadow-focco-pink/20 transition-transform hover:scale-[1.02]"
              >
                Acessar Perfil
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Células oferecidas */}
        <div className="mt-14">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-white">Células oferecidas</h2>
          <div className="focco-accent-bar mt-3 mb-9 h-[3px] w-16 rounded-full" />

          {celulasList.length === 0 ? (
            <p className="text-sm text-white/60">Nenhuma célula divulgada no momento.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {celulasList.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20"
                >
                  <div className={cn("h-[6px]", c.accent.bg)} />
                  <div
                    className={cn(
                      "flex h-[140px] w-full items-center justify-center text-sm font-semibold text-white/90",
                      c.accent.bg
                    )}
                  >
                    Foto da célula
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <p className="m-0 text-[15px] font-bold text-focco-navy">{c.nome}</p>
                    <p className={cn("m-0 text-xs font-bold uppercase tracking-wide", c.accent.text)}>
                      Articulador(a): {c.articuladorNome}
                    </p>
                    {c.descricaoPublica && (
                      <p className="m-0 text-[12.5px] leading-relaxed text-muted">{c.descricaoPublica}</p>
                    )}
                    {(c.diaSemana || c.horario || c.local) && (
                      <span
                        className={cn(
                          "mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold",
                          c.accent.bgSoft,
                          c.accent.text
                        )}
                      >
                        <ClockIcon />
                        {c.diaSemana ? DIA_SEMANA_LABELS[c.diaSemana] : "—"}
                        {c.turno ? ` · ${TURNO_LABELS[c.turno]}` : ""}
                        {c.horario ? ` · ${c.horario}` : ""}
                        {c.local ? ` · ${c.local}` : ""}
                      </span>
                    )}
                    {c.whatsappLink && (
                      <a
                        href={c.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01]",
                          c.accent.bg
                        )}
                      >
                        <WhatsAppIcon />
                        Entrar no grupo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-16 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center">
          <div className="flex items-center gap-5">
            <Image
              src="/brand/logo-focco.png"
              alt="FOCCO"
              width={100}
              height={35}
              className="h-7 w-auto brightness-0 invert opacity-85"
            />
            <Image
              src="/brand/logo-unemat.png"
              alt="UNEMAT"
              width={100}
              height={44}
              className="h-7 w-auto brightness-0 invert opacity-55"
            />
          </div>
          <p className="m-0 text-[11.5px] text-white/40">Iniciativa FOCCO · UNEMAT · Formação de Células Cooperativas</p>
        </div>
      </div>
    </div>
  );
}
