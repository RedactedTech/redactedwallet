import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redacted Wallet",
  description: "Privacy-focused Solana memecoin trading with rotating ephemeral wallets",
  openGraph: {
    title: "Redacted Wallet",
    description: "Privacy-focused Solana memecoin trading with rotating ephemeral wallets",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Redacted Wallet - 1 Wallet. A thousand masks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redacted Wallet",
    description: "Privacy-focused Solana memecoin trading with rotating ephemeral wallets",
    images: ["/opengraph-image.png"],
  },
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
