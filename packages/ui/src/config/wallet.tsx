import { http, createConfig } from "wagmi";
import {
  mainnet,
  arbitrum,
  base,
  scroll,
  polygon,
  optimism,
  baseSepolia,
} from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

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

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        rainbowWallet,
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "EigenWatch",
    projectId,
  },
);

export const config = createConfig({
  connectors,
  chains: networks,
  ssr: true,
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
