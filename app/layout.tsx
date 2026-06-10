import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEOTAJIB // Quant Engine",
  description: "Algorithmic trading system dashboard — isneotajibmakingmoney?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
