import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerador Profissional de Roteiros",
  description: "Gere roteiros profissionais para vídeos, documentários e histórias usando IA avançada",
  keywords: ["roteiro", "IA", "gerador", "vídeo", "documentário", "história"],
  authors: [{ name: "Nardoto" }],
  themeColor: "#1F2937",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
