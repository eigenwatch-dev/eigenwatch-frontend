// packages/ui/src/providers/wallet.tsx

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { projectId, wagmiAdapter } from "../config/wallet";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "EigenWatch",
  description:
    "The risk intelligence layer for Ethereum new trust economy helping delegators, operators, agents and AVSs make smarter, data-backed decisions.",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://eigenwatch.xyz",
  siteName: "EigenWatch",
  locale: "en_US",
  type: "website",
  author: "EigenWatch",
  publisher: "EigenWatch",
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
  logo: "",
  icons: ["https://eigenwatch.xyz/Images/logo.svg"],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

function WalletProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletProvider;
