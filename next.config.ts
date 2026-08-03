import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Web 100% estática: `next build` emite `out/` con HTML/CSS/JS planos,
  // sin servidor. El porqué, en docs/decisions/0001.
  output: "export",
};

export default nextConfig;
