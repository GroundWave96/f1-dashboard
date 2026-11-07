import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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