/**
 * Tema visual por módulo — cada área do sistema tem uma cor de identidade
 * fixa (faixa de cabeçalho, bordas de card, cabeçalho de tabela, botão
 * primário, destaque de navegação ativo). Ver design_handoff_sistema_focco/README.md.
 */
export type ModuleKey =
  | "dashboard"
  | "celulas"
  | "bolsistas"
  | "chamada"
  | "avisos"
  | "usuarios"
  | "financeiro";

export type ModuleTheme = {
  /** Texto/título sobre fundo pálido do tema. */
  text: string;
  /** Fundo pálido (faixa de cabeçalho, cabeçalho de tabela). */
  bg: string;
  /** Borda de cards/tabelas no tom do tema. */
  border: string;
  /** Botão primário — fundo e hover. */
  primary: string;
  primaryHover: string;
  /** Formas decorativas abstratas da faixa de cabeçalho (3 cores, do THEMES do protótipo). */
  decor: [string, string, string];
};

const THEMES: Record<Exclude<ModuleKey, "dashboard">, ModuleTheme> = {
  celulas: {
    text: "text-focco-blue-dark",
    bg: "bg-focco-blue-pale",
    border: "border-focco-blue-pale",
    primary: "bg-focco-blue hover:bg-focco-blue-dark",
    primaryHover: "hover:bg-focco-blue-dark",
    decor: ["bg-focco-blue", "bg-focco-blue-dark", "bg-focco-blue"],
  },
  bolsistas: {
    text: "text-focco-pink-dark",
    bg: "bg-focco-pink-pale",
    border: "border-focco-pink-pale",
    primary: "bg-focco-pink hover:bg-focco-pink-dark",
    primaryHover: "hover:bg-focco-pink-dark",
    decor: ["bg-focco-pink", "bg-focco-pink-dark", "bg-focco-pink"],
  },
  chamada: {
    text: "text-focco-orange-dark",
    bg: "bg-focco-orange-pale",
    border: "border-focco-orange-pale",
    primary: "bg-focco-orange hover:bg-focco-orange-dark",
    primaryHover: "hover:bg-focco-orange-dark",
    decor: ["bg-focco-orange", "bg-focco-orange-dark", "bg-focco-orange"],
  },
  avisos: {
    text: "text-focco-red-dark",
    bg: "bg-focco-red-pale",
    border: "border-focco-red-pale",
    primary: "bg-focco-red hover:bg-focco-red-dark",
    primaryHover: "hover:bg-focco-red-dark",
    decor: ["bg-focco-red", "bg-focco-red-dark", "bg-focco-red"],
  },
  usuarios: {
    text: "text-focco-green-dark",
    bg: "bg-focco-green-pale",
    border: "border-focco-green-pale",
    primary: "bg-focco-green hover:bg-focco-green-dark",
    primaryHover: "hover:bg-focco-green-dark",
    decor: ["bg-focco-green", "bg-focco-green-dark", "bg-focco-green"],
  },
  // Reaproveita o verde de Usuários — dinheiro = verde é a associação mais
  // óbvia, e os dois não ficam lado a lado no menu.
  financeiro: {
    text: "text-focco-green-dark",
    bg: "bg-focco-green-pale",
    border: "border-focco-green-pale",
    primary: "bg-focco-green hover:bg-focco-green-dark",
    primaryHover: "hover:bg-focco-green-dark",
    decor: ["bg-focco-green", "bg-focco-green-dark", "bg-focco-green"],
  },
};

/** Dashboard não tem uma cor única — usa a faixa multicolor + texto navy fixo. */
export const DASHBOARD_THEME: ModuleTheme = {
  text: "text-foreground",
  bg: "bg-background",
  border: "border-border",
  primary: "bg-focco-green hover:bg-focco-green-dark",
  primaryHover: "hover:bg-focco-green-dark",
  decor: ["bg-focco-green", "bg-focco-blue", "bg-focco-orange"],
};

export function getModuleTheme(key: ModuleKey): ModuleTheme {
  if (key === "dashboard") return DASHBOARD_THEME;
  return THEMES[key];
}

/** Cor de destaque (só o nome do módulo) — usada pela sidebar pra pintar o item ativo. */
export function getModuleAccent(key: ModuleKey) {
  const t = getModuleTheme(key);
  return { text: t.text, bg: t.bg };
}
