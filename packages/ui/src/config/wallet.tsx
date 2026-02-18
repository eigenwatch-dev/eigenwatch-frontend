import { createStorage, createConfig, http } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  mainnet,
  arbitrum,
  base,
  scroll,
  polygon,
  optimism,
} from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [mainnet, arbitrum, base, scroll, polygon, optimism];

// Custom cookie storage to set domain dynamically for subdomain sharing and local dev
const customCookieStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    const value =
      document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)")?.pop() ||
      "";
    return value ? value : null;
  },

  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    let cookieString = `${key}=${value}; path=/; SameSite=Lax;`;

    // Only add domain if it's not a bare hostname like 'localhost'
    if (hostname.includes(".")) {
      const parts = hostname.split(".");
      const rootDomain = parts.slice(-2).join(".");
      cookieString += ` domain=.${rootDomain};`;
    }

    if (process.env.NODE_ENV === "production") {
      cookieString += " secure;";
    }

    document.cookie = cookieString;
  },

  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    let cookieDomain = "";
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const parts = hostname.split(".");
      cookieDomain = `domain=.${parts.slice(-2).join(".")};`;
    } else {
      cookieDomain = "domain=localhost;";
    }
    document.cookie = `${key}=; ${cookieDomain} path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: customCookieStorage,
    key: "shared-connector" as any,
  }) as any,
  ssr: true,
  projectId,
  networks,
});

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "EigenWatch",
    projectId,
  },
);

// Explicitly add connectors to the wagmi config following Step 1 guidelines
export const config = createConfig({
  chains: networks as any,
  storage: createStorage({
    storage: customCookieStorage,
    key: "shared-connector" as any,
  }),
  ssr: true,
  connectors,
  transports: Object.fromEntries(networks.map((chain) => [chain.id, http()])),
});
