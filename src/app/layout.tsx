import type { Metadata, Viewport } from "next";
import { Figtree, Nunito } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/shell/service-worker-register";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["600", "700", "800", "900"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "órbitaGO",
  description: "Sua vida, subindo de nível. Finanças e tarefas com ofensivas, missões e o Cobre torcendo por você.",
  // `manifest.ts` já injeta o <link rel="manifest">; `icon.png`/`apple-icon.png`
  // (convenção de arquivo) já injetam favicon e apple-touch-icon automaticamente.
  appleWebApp: {
    capable: true,
    title: "órbitaGO",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#161310" },
  ],
};

// Aplica o tema antes da hidratação (sem flash). Lê o store persistido.
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('orbita:ui')||'{}');var t=(s.state&&s.state.theme)||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${nunito.variable} ${figtree.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Material Symbols Rounded (FILL 1, wght 600) — mesmo eixo do design. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display -- ícones precisam de "block" para não piscar o nome da ligadura */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,1,0&display=block"
        />
      </head>
      <body className="min-h-full bg-bg text-ink" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
