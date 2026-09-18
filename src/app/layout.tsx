import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Método 6 Meses - Aprende Inglés Escuchando",
  description: "Descubre cómo dominar el inglés en 6 meses con nuestra metodología de inmersión auditiva. 30 minutos al día, sin gramática aburrida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
