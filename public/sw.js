// Service worker mínimo pro Sistema FOCCO ser instalável (PWA).
//
// O sistema é 100% dependente de dados ao vivo do banco — não faz sentido
// (nem seria seguro) cachear páginas autenticadas pra uso offline de
// verdade. O que esse SW faz:
//   1. Cacheia o "app shell" estático (ícones, manifest, fontes, assets do
//      Next.js gerados no build) — deixa recarregamentos mais rápidos.
//   2. Em navegação (troca de página) sem rede, mostra uma tela de
//      "sem conexão" simples em vez do erro feio do navegador.
//   3. Nunca intercepta requisições de API/Server Actions — sempre vão
//      direto pra rede, pra nunca mostrar dado desatualizado sem avisar.

const CACHE_NAME = "focco-shell-v1";
const APP_SHELL = ["/manifest.json", "/offline.html", "/brand/logo-focco.png", "/brand/logo-unemat.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // nunca intercepta mutações (Server Actions)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação (o usuário abrindo/trocando de página): sempre tenta a rede
  // primeiro (dado sempre fresco); só cai pra tela offline se a rede falhar.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html").then((res) => res ?? Response.error()))
    );
    return;
  }

  // Assets estáticos gerados no build (JS/CSS com hash no nome) e ícones:
  // cache-first, já que o conteúdo nunca muda pra uma mesma URL com hash.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return res;
          })
      )
    );
    return;
  }

  // Qualquer outra coisa (dados, imagens de célula, etc.) — direto pra rede.
});
