"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getModuleAccent, type ModuleKey } from "@/lib/theme";
import type { UserRole } from "@/auth";

const ALL_LINKS: { href: string; label: string; module: ModuleKey; roles: UserRole[] }[] = [
  { href: "/coordenacao", label: "Dashboard", module: "dashboard", roles: ["coordenacao", "facilitador"] },
  { href: "/celulas", label: "Células", module: "celulas", roles: ["coordenacao", "facilitador", "articulador"] },
  { href: "/bolsistas", label: "Bolsistas", module: "bolsistas", roles: ["coordenacao", "facilitador"] },
  { href: "/chamada", label: "Chamada", module: "chamada", roles: ["coordenacao", "facilitador"] },
  { href: "/avisos", label: "Avisos", module: "avisos", roles: ["coordenacao", "facilitador", "articulador"] },
  { href: "/usuarios", label: "Usuários", module: "usuarios", roles: ["coordenacao", "facilitador"] },
];

export function Nav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const links = ALL_LINKS.filter((l) => l.roles.includes(role));

  return (
    <nav className="flex flex-col gap-0.5">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const accent = getModuleAccent(link.module);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? cn(accent.bg, accent.text, "font-semibold") : "text-muted hover:bg-border-subtle hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
