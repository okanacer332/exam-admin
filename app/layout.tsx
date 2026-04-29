import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papirus AI Admin | Operasyon Paneli",
  description: "Papirus AI kullanÄ±cÄ±, kredi, log ve paket operasyon paneli.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
