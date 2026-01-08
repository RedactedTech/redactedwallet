import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redacted Wallet",
  description: "Privacy-focused Solana memecoin trading with rotating ephemeral wallets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-white">
        {children}
      </body>
    </html>
  );
}
