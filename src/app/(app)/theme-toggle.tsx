"use client";

import { useState } from "react";

const STORAGE_KEY = "focco-theme";

function readInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage bloqueado (modo privado etc.) — cai pra preferência do sistema.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a.5.5 0 0 0-.6-.66A9.5 9.5 0 1 0 21.16 15.1a.5.5 0 0 0-.66-.6Z" />
    </svg>
  );
}

/** Alterna entre claro/escuro manualmente (sobrescreve a preferência do sistema, guarda em localStorage). */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(readInitialTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // sem problema — só não persiste entre sessões nesse navegador.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border-subtle hover:text-foreground"
    >
      <span suppressHydrationWarning>{theme === "dark" ? <SunIcon /> : <MoonIcon />}</span>
    </button>
  );
}
