import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/esqueci-senha", "/redefinir-senha", "/vitrine"];

export default auth((req) => {
  const { nextUrl } = req;
  const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuth || isPublic) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Restringe /coordenacao/** a quem tem papel "coordenacao"
  if (
    nextUrl.pathname.startsWith("/coordenacao") &&
    req.auth.user?.role !== "coordenacao"
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
