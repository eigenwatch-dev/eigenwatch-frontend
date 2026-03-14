/**
 * Chain display helpers for Chainrails cross-chain payment UI.
 * Maps Chainrails chain identifiers to human-readable names and colors.
 */

export interface ChainInfo {
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  textColor: string;
}

const CHAIN_MAP: Record<string, ChainInfo> = {
  BASE_MAINNET: {
    name: "Base",
    shortName: "Base",
    color: "#0052FF",
    bgColor: "bg-[#0052FF]/10",
    textColor: "text-[#0052FF]",
  },
  ETHEREUM_MAINNET: {
    name: "Ethereum",
    shortName: "ETH",
    color: "#627EEA",
    bgColor: "bg-[#627EEA]/10",
    textColor: "text-[#627EEA]",
  },
  ARBITRUM_MAINNET: {
    name: "Arbitrum",
    shortName: "ARB",
    color: "#28A0F0",
    bgColor: "bg-[#28A0F0]/10",
    textColor: "text-[#28A0F0]",
  },
  OPTIMISM_MAINNET: {
    name: "Optimism",
    shortName: "OP",
    color: "#FF0420",
    bgColor: "bg-[#FF0420]/10",
    textColor: "text-[#FF0420]",
  },
  POLYGON_MAINNET: {
    name: "Polygon",
    shortName: "MATIC",
    color: "#8247E5",
    bgColor: "bg-[#8247E5]/10",
    textColor: "text-[#8247E5]",
  },
  AVALANCHE_MAINNET: {
    name: "Avalanche",
    shortName: "AVAX",
    color: "#E84142",
    bgColor: "bg-[#E84142]/10",
    textColor: "text-[#E84142]",
  },
  BSC_MAINNET: {
    name: "BNB Chain",
    shortName: "BNB",
    color: "#F0B90B",
    bgColor: "bg-[#F0B90B]/10",
    textColor: "text-[#F0B90B]",
  },
  // Testnets
  BASE_TESTNET: {
    name: "Base Sepolia",
    shortName: "Base",
    color: "#0052FF",
    bgColor: "bg-[#0052FF]/10",
    textColor: "text-[#0052FF]",
  },
  ARBITRUM_TESTNET: {
    name: "Arbitrum Sepolia",
    shortName: "ARB",
    color: "#28A0F0",
    bgColor: "bg-[#28A0F0]/10",
    textColor: "text-[#28A0F0]",
  },
  OPTIMISM_TESTNET: {
    name: "Optimism Sepolia",
    shortName: "OP",
    color: "#FF0420",
    bgColor: "bg-[#FF0420]/10",
    textColor: "text-[#FF0420]",
  },
};

const DEFAULT_CHAIN_INFO: ChainInfo = {
  name: "Unknown Chain",
  shortName: "???",
  color: "#6B7280",
  bgColor: "bg-gray-500/10",
  textColor: "text-gray-400",
};

export function getChainInfo(chainId: string): ChainInfo {
  return CHAIN_MAP[chainId] || { ...DEFAULT_CHAIN_INFO, name: chainId };
}

export function getChainName(chainId: string): string {
  return getChainInfo(chainId).name;
}

/**
 * Format a token amount from its smallest unit to human-readable form.
 * e.g., "1000500" with 6 decimals => "1.0005"
 */
export function formatTokenAmount(
  amount: string,
  decimals: number,
): string {
  const num = Number(amount) / Math.pow(10, decimals);
  // Use up to 6 decimal places, trimming trailing zeros
  return parseFloat(num.toFixed(6)).toString();
}
