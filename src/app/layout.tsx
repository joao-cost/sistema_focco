import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema FOCCO",
  description: "Gestão de células de aprendizagem cooperativa do FOCCO/UNEMAT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
