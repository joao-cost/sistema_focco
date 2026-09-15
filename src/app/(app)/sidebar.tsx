"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "./nav";
import { logoutAction } from "./logout-action";
import { Avatar, Button } from "@/components/ui";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/auth";

const SIDEBAR_WIDTH = 216;

export function Sidebar({
  role,
  userName,
  roleLabel,
  avatarUrl,
}: {
  role: UserRole;
  userName: string;
  roleLabel: string;
  avatarUrl?: string | null;
}) {
  const [open, setOpen] = useState(true);

  // Em telas pequenas (celular), a sidebar começa fechada — evita o
  // conteúdo aparecer espremido na primeira renderização. Não dá pra saber
  // a largura da tela no server-render (SSR sempre assume desktop, senão
  // o HTML do servidor diverge do cliente), então ajusta uma única vez
  // logo após montar no navegador — daqui pra frente não persegue
  // redimensionamento em tempo real.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ajuste único pós-hidratação a partir de window.innerWidth, sem isso não dá pra saber a largura da tela no SSR
    if (window.innerWidth < 768) setOpen(false);
  }, []);

  // No celular, a sidebar é um drawer sobreposto (não empurra o conteúdo) —
  // fecha sozinho ao navegar ou ao tocar fora dela.
  function closeOnMobile() {
    if (window.innerWidth < 768) setOpen(false);
  }

  return (
    <>
      {/* Fundo escurecido atrás do drawer — só no celular, só quando aberto */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Hamburguer — fixo, sempre visível/clicável, acompanha a borda da sidebar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Recolher menu" : "Expandir menu"}
        aria-expanded={open}
        style={{ left: open ? SIDEBAR_WIDTH - 34 : 18 }}
        className="fixed top-[18px] z-50 flex h-[38px] w-[38px] flex-col items-center justify-center gap-1 rounded-[10px] border border-border bg-surface shadow-sm shadow-focco-navy/10 transition-[left] duration-200 ease-out"
      >
        <span className="h-0.5 w-4 rounded-full bg-foreground" />
        <span className="h-0.5 w-4 rounded-full bg-foreground" />
        <span className="h-0.5 w-4 rounded-full bg-foreground" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-shrink-0 flex-col overflow-hidden whitespace-nowrap bg-surface transition-[width,padding] duration-200 ease-out md:static md:z-auto",
          open ? "w-[216px] border-r border-border px-3.5 py-[22px]" : "w-0 border-r-0 px-0 py-[22px]"
        )}
      >
        <Image
          src="/brand/logo-focco.png"
          alt="FOCCO"
          width={200}
          height={70}
          priority
          className="ml-1.5 mb-1.5 h-auto w-24"
        />
        <div className="focco-accent-bar mb-5 h-[3px] rounded-full" />

        <Nav role={role} onNavigate={closeOnMobile} />

        <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-4">
          <Link
            href="/perfil"
            onClick={closeOnMobile}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-1 hover:opacity-80"
          >
            <Avatar name={userName} imageUrl={avatarUrl} />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-foreground">{userName}</p>
              <p className="text-[10.5px] text-muted">{roleLabel}</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
        <form action={logoutAction} className="mt-3">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-0.5 text-muted">
            Sair
          </Button>
        </form>
      </aside>
    </>
  );
}
