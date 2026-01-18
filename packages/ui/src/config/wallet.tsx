// packages/ui/src/config/wallet.tsx
import { createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  arbitrum,
  base,
  scroll,
  polygon,
  solana,
  optimism,
} from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
console.log(projectId);

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [
  mainnet,
  arbitrum,
  base,
  scroll,
  polygon,
  solana,
  optimism,
];

// Custom cookie storage to set domain dynamically for subdomain sharing and local dev
const customCookieStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    const value =
      document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)")?.pop() ||
      "";
    return value ? value : null;
  },
  // setItem: (key: string, value: string) => {
  //   if (typeof window === "undefined") return;
  //   let cookieDomain = "";
  //   const hostname = window.location.hostname;
  //   if (hostname !== "localhost" && hostname !== "127.0.0.1") {
  //     const parts = hostname.split(".");
  //     // For domains like app.com or dashboard.app.com, set to .app.com
  //     cookieDomain = `domain=.${parts.slice(-2).join(".")};`;
  //   } else {
  //     // For localhost, set explicitly to localhost (no dot) to ensure sharing across ports
  //     cookieDomain = "domain=localhost;";
  //   }
  //   // Use secure=true in production (requires HTTPS)
  //   // SameSite=Lax allows sharing across subdomains/ports for top-level navigation
  //   document.cookie = `${key}=${value}; ${cookieDomain} path=/; SameSite=Lax;${process.env.NODE_ENV === "production" ? " secure" : ""}`;
  // },

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
    key: "shared-connector",
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
