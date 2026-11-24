import type { MetadataRoute } from "next";

/**
 * Web App Manifest (App Router). Next.js gera `/manifest.webmanifest` e já
 * injeta o `<link rel="manifest">` no `<head>` automaticamente.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "órbitaGO",
    short_name: "órbitaGO",
    description: "Seu dia em um lugar só: agenda, lembretes, tarefas e finanças.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F4F6",
    theme_color: "#F4F4F6",
    icons: [
      // Gerados por scripts/generate-icons.mjs (marca: planeta + anel + satélite em tile escuro).
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
