import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone para uma imagem Docker enxuta (ver Dockerfile).
  output: "standalone",
};

export default nextConfig;
