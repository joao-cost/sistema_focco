import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";

export const metadata: Metadata = {
  title: "Sistema FOCCO",
  description: "Gestão de células de aprendizagem cooperativa do FOCCO/UNEMAT",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FOCCO",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1F3A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background">
        {/* Aplica o tema salvo (se houver) antes da primeira pintura — evita
            o "flash" do tema errado entre o HTML do servidor (sempre claro
            por padrão) e o JS do seletor de tema carregar. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('focco-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
