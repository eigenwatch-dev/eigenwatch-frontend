import { createConfig, http } from "wagmi";
import {
  mainnet,
  arbitrum,
  base,
  scroll,
  polygon,
  optimism,
  baseSepolia,
} from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [
  mainnet,
  arbitrum,
  base,
  scroll,
  polygon,
  optimism,
  baseSepolia,
] as const;

export const config = createConfig({
  chains: networks,
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "EigenWatch",
        description: "EigenWatch Dashboard",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://dashboard.eigenwatch.xyz",
        icons: ["https://dashboard.eigenwatch.xyz/favicon.png"],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [scroll.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [baseSepolia.id]: http(),
  },
});
