import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/shell/service-worker-register";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "órbitaGO",
  description: "Seu dia em um lugar só: agenda, lembretes, tarefas e finanças.",
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
  // Sem isso, `env(safe-area-inset-*)` resolve pra 0 mesmo em telas com notch/
  // home indicator — o header e o bottom-nav dependem dele.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0F" },
  ],
};

// Aplica o tema antes da hidratação (sem flash). Lê o store persistido.
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('orbita:ui')||'{}');var t=(s.state&&s.state.theme)||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Material Symbols Rounded — contorno por padrão; `.icon-fill` usa o eixo FILL. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display -- ícones precisam de "block" para não piscar o nome da ligadura */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block"
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
