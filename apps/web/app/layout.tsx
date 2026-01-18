import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/contexts/theme-context";
import WalletProvider from "../../../packages/ui/src/providers/wallet";
import { headers } from "next/headers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eigenwatch.xyz"),
  title: {
    default: "EigenWatch",
    template: "%s | EigenWatch",
  },
  description:
    "The risk intelligence layer for Ethereum new trust economy helping delegators, operators, agents and AVSs make smarter, data-backed decisions.",
  keywords: [
    "Risk",
    "intelligence layer",
    "Ethereum",
    "trust economy",
    "delegators",
    "operators",
    "AVSs",
    "agents",
  ],
  authors: [{ name: "EigenWatch Team" }],
  creator: "EigenWatch",
  publisher: "EigenWatch",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "The Risk intelligence layer for Ethereum",
    description:
      "The risk intelligence layer for Ethereum new trust economy helping delegators, operators, agents and AVSs make smarter, data-backed decisions.",
    url: "https://eigenwatch.xyz",
    siteName: "Eigenwatch",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EigenWatch - Risk Intelligence Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EigenWatch",
    description:
      "See the unseen in restaking. Real-time risk intelligence for EigenCloud and x402. Minimal. Modular. Trustless.",
    site: "@eigenwatch",
    creator: "@eigenwatch",
    images: ["/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <WalletProvider cookies={cookies}>
            <Header />
            <main className="min-h-screen pt-16.25">{children}</main>
            <Footer />
          </WalletProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "EigenWatch",
              url: "https://eigenwatch.xyz",
              logo: "https://eigenwatch.xyz/logo.png",
              sameAs: ["https://twitter.com/eigenwatch"],
              description:
                "The risk intelligence layer for Ethereum new trust economy helping delegators, operators, agents and AVSs make smarter, data-backed decisions.",
            }),
          }}
        />
      </body>
    </html>
  );
}
