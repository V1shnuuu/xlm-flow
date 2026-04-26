import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "StellarPay Lite",
  description: "A modern Stellar Testnet dApp for payments, funding, and wallet insights."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
