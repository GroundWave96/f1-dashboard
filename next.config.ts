import type { NextConfig } from "next";
import { execSync } from "node:child_process";

/**
 * Versão desta publicação (o commit). Vai para dentro do código do site e para /version.json: quando os
 * dois deixam de bater, saiu uma versão nova e o site avisa quem está com ele aberto.
 */
function appVersion() {
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA.slice(0, 12);
  try {
    return execSync("git rev-parse --short=12 HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_VERSION: appVersion() },
  // Site 100% estático (pasta out/), publicado no Cloudflare Pages; a API fica em functions/
  output: "export",
  images: {
    // Sem servidor não há otimização de imagens: elas vêm direto da origem
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
      },
    ],
  },
};

export default nextConfig;