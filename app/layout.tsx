import type { Metadata } from "next";
import { Oswald, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./components/ClientLayout";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Redacted - Privacy-Focused Solana Trading",
    template: "%s | Redacted"
  },
  description: "Privacy-focused Solana trading platform with ephemeral ghost wallets for anonymous trading. 1 Wallet. A thousand masks.",
  keywords: ["solana", "trading", "privacy", "anonymous", "ghost wallets", "crypto", "web3", "DeFi", "memecoin"],
  authors: [{ name: "Redacted Team", url: "https://github.com/RedactedTech" }],
  creator: "Redacted",
  publisher: "Redacted",
  metadataBase: new URL('https://redactedprotocol.dev'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    title: "Redacted - Privacy-Focused Solana Trading",
    description: "Privacy-focused Solana trading platform with ephemeral ghost wallets for anonymous trading.",
    type: "website",
    url: "https://redactedprotocol.dev",
    siteName: "Redacted",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Redacted - 1 Wallet. A thousand masks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RedactedWallet",
    creator: "@RedactedWallet",
    title: "Redacted - Privacy-Focused Solana Trading",
    description: "Privacy-focused Solana trading platform with ephemeral ghost wallets for anonymous trading.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${jetbrainsMono.variable}`}>
      <body className="text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
