// packages/ui/src/providers/wallet.tsx

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { config } from "../config/wallet";

// Set up queryClient
const queryClient = new QueryClient();

function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletProvider;
