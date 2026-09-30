import type { MetadataRoute } from "next";

/**
 * Web App Manifest (App Router). Next.js gera `/manifest.webmanifest` e já
 * injeta o `<link rel="manifest">` no `<head>` automaticamente.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "órbitaGO",
    short_name: "órbitaGO",
    description: "Sua vida, subindo de nível. Finanças e tarefas com ofensivas, missões e o Cobre torcendo por você.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EE",
    theme_color: "#20B878",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
