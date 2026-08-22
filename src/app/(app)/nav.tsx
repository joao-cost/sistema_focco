"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/auth";

const ALL_LINKS = [
  { href: "/celulas", label: "Células", roles: ["coordenacao", "facilitador", "articulador"] },
  { href: "/avisos", label: "Avisos", roles: ["coordenacao", "facilitador", "articulador"] },
  { href: "/coordenacao", label: "Dashboard", roles: ["coordenacao"] },
  { href: "/usuarios", label: "Usuários", roles: ["coordenacao"] },
] as const;

export function Nav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const links = ALL_LINKS.filter((l) => (l.roles as readonly string[]).includes(role));

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-focco-green/15 text-focco-green"
                : "text-muted hover:bg-gray-100 hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
