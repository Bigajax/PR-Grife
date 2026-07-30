import type { NextConfig } from "next";

// Slugs hardcoded de propósito: lista curta e estável. A fonte da hierarquia
// departamento → categorias é data/departments.ts — ao mudar lá, revise aqui.
const CATEGORIAS_ROUPAS = [
  "camisetas",
  "polos",
  "camisas",
  "calcas",
  "shorts",
  "jaquetas",
  "moletons-tricos",
];

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto enviadas pelo painel vivem no Storage do Supabase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Upload de foto do painel vai por Server Action (FormData). O teto de
      // validação no servidor é 8 MB; a folga cobre o overhead do multipart.
      bodySizeLimit: "9mb",
    },
  },
  async redirects() {
    return [
      // Todo o catálogo é masculino — a rota dedicada saiu.
      { source: "/masculino", destination: "/catalogo", permanent: true },
      // Marcas migraram para debaixo do catálogo.
      { source: "/marca/:slug", destination: "/catalogo/marca/:slug", permanent: true },
      // URLs antigas de categoria viram departamento + query.
      // tenis/perfumes/acessorios não redirecionam: viraram departamentos com o mesmo slug.
      ...CATEGORIAS_ROUPAS.map((c) => ({
        source: `/catalogo/${c}`,
        destination: `/catalogo/roupas?categoria=${c}`,
        permanent: true,
      })),
      { source: "/catalogo/bones", destination: "/catalogo/acessorios?categoria=bones", permanent: true },
    ];
  },
};

export default nextConfig;
