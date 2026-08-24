import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone para uma imagem Docker enxuta (ver Dockerfile).
  // Só faz sentido fora da Vercel: lá o próprio build já cuida do tracing
  // de arquivos, e o modo "standalone" conflita com esse processo (causa
  // "ENOENT: next-server.js.nft.json" no build). A Vercel define a env var
  // VERCEL=1 automaticamente durante o build.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
