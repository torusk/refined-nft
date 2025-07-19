import type { Metadata } from "next";
import "./globals.css";
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: "Refined NFT Interface",
  description: "A refined and modern NFT interface for Henkaku membership",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}