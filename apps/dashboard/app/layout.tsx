import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "./Provider";
import { NavBar } from "@repo/ui/NavBar";
import WalletProvider from "../../../packages/ui/src/providers/wallet";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { EmailNudgeBanner } from "@/components/auth/EmailNudgeBanner";
import { WalletButton } from "@/components/wallet/WalletButton";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Operator", href: "/operator" },
  { label: "AVS", href: "/avs" },
  { label: "Strategy", href: "/strategy" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://dashboard.eigenwatch.xyz"),
  title: {
    default: "EigenWatch Dashboard",
    template: "%s | EigenWatch Dashboard",
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
    "dashboard",
    "analytics",
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
    title: "EigenWatch Dashboard - Risk Intelligence",
    description:
      "Real-time risk intelligence and analytics for EigenLayer operators, AVSs, and strategies.",
    url: "https://dashboard.eigenwatch.xyz",
    siteName: "EigenWatch Dashboard",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EigenWatch Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EigenWatch Dashboard",
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

import Clarity from "@/components/shared/Clarity";
import { FeedbackFAB } from "@/components/feedback";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased bg-background text-foreground`}>
        <WalletProvider>
          <AppProvider>
            <AuthProvider>
                <div className="flex flex-col w-full h-screen">
                  <NavBar
                    logoHref={
                      process.env.NEXT_PUBLIC_WEBSITE_URL ||
                      "http://localhost:3000"
                    }
                    navLinks={navLinks}
                    isDashboard={true}
                    walletConnect={<WalletButton />}
                  />
                  <div className="w-full flex flex-col h-full overflow-y-auto pt-[65px]">
                    <EmailNudgeBanner />
                    <div className="max-w-[1440px] w-full mx-auto flex flex-col h-full px-4 sm:px-6 md:px-10 lg:px-[108px]">
                      <React.Suspense
                        fallback={
                          <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                          </div>
                        }
                      >
                        {children}
                      </React.Suspense>
                    </div>
                  </div>
                </div>
                <FeedbackFAB />
            </AuthProvider>
          </AppProvider>
        </WalletProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EigenWatch Dashboard",
              url: "https://dashboard.eigenwatch.xyz",
              description:
                "Real-time risk intelligence and analytics for EigenLayer operators, AVSs, and strategies.",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://dashboard.eigenwatch.xyz/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Clarity />
      </body>
    </html>
  );
}
