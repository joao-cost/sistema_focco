import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/esqueci-senha", "/redefinir-senha", "/vitrine"];

// Domínio público da vitrine (focco.hyperdynamis.com) — mesma aplicação,
// mesmo deploy, mas só a vitrine é servida ali: nenhuma outra rota (nem
// /login) fica acessível nesse host, mesmo por URL direta. A equipe acessa
// o sistema pelo domínio "de verdade" (DOMAIN / AUTH_URL), não por um link
// visível na vitrine pública.
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN;

export default auth((req) => {
  const { nextUrl } = req;
  const host = req.headers.get("host")?.split(":")[0];

  if (PUBLIC_DOMAIN && host === PUBLIC_DOMAIN) {
    if (nextUrl.pathname === "/vitrine") return NextResponse.next();
    return NextResponse.rewrite(new URL("/vitrine", nextUrl));
  }

  const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuth || isPublic) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Restringe /coordenacao/**, /usuarios/** e /financeiro/** a coordenação
  // e facilitador (articulador não gerencia usuários, dashboard geral nem
  // vê dados financeiros).
  const staffOnlyPaths = ["/coordenacao", "/usuarios", "/financeiro"];
  if (
    staffOnlyPaths.some((p) => nextUrl.pathname.startsWith(p)) &&
    !["coordenacao", "facilitador"].includes(req.auth.user?.role ?? "")
  ) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Além dos internos do Next.js, exclui qualquer arquivo estático servido
  // de public/ (extensão de arquivo na URL) — sem isso, o otimizador de
  // imagens do Next.js (/_next/image) recebe o HTML de redirecionamento
  // pro /login em vez do arquivo real ao tentar buscar internamente uma
  // imagem pública (ex: logo da tela de login) sem sessão autenticada.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
