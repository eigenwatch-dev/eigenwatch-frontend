// lib/formatting.ts
/**
 * Format utilities for EigenWatch operator data
 */

/**
 * Format ETH values from wei (string) to readable ETH
 */
export const formatEther = (weiValue: string | number): string => {
  if (!weiValue) return "0 ETH";
  const ethValue = parseFloat(weiValue.toString()) / 1e18;

  if (ethValue === 0) return "0 ETH";
  if (ethValue < 0.0001) return "<0.0001 ETH";
  if (ethValue < 1) return `${ethValue.toFixed(4)} ETH`;
  if (ethValue < 1000) return `${ethValue.toFixed(2)} ETH`;
  if (ethValue < 1000000) return `${(ethValue / 1000).toFixed(2)}K ETH`;
  return `${(ethValue / 1000000).toFixed(2)}M ETH`;
};

/**
 * Format USD value with proper notation
 */
export const formatUSD = (value: number | string | null | undefined): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (!numValue || isNaN(numValue) || numValue === 0) return "$0";
  if (numValue < 0.01) return "<$0.01";
  if (numValue < 1000) return `$${numValue.toFixed(2)}`;
  if (numValue < 1000000) return `$${(numValue / 1000).toFixed(1)}K`;
  if (numValue < 1000000000) return `$${(numValue / 1000000).toFixed(1)}M`;
  return `$${(numValue / 1000000000).toFixed(1)}B`;
};

/**
 * Format addresses for display
 */
export const formatAddress = (address: string, chars: number = 6): string => {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Format commission from bips to percentage
 */
export const formatCommission = (bips: number): string => {
  return `${(bips / 100).toFixed(2)}%`;
};

/**
 * Format relative time
 */
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

/**
 * Format percentage with color coding
 */
export const getPercentageColor = (
  value: number,
  inverted: boolean = false
): string => {
  if (inverted) {
    if (value >= 80) return "text-red-500";
    if (value >= 50) return "text-yellow-500";
    return "text-green-500";
  }

  if (value >= 80) return "text-green-500";
  if (value >= 50) return "text-yellow-500";
  return "text-red-500";
};

/**
 * Calculate ETH to USD (with mock exchange rate)
 */
export const ethToUSD = (
  ethAmount: number,
  exchangeRate: number = 2400
): number => {
  return ethAmount * exchangeRate;
};

/**
 * Format risk level with colors
 */
export const getRiskColor = (level: string): string => {
  switch (level.toUpperCase()) {
    case "LOW":
      return "text-green-500 bg-green-500/10 border-green-500/20";
    case "MEDIUM":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    case "HIGH":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    default:
      return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  }
};

/**
 * Format operational days to human readable
 */
export const formatOperationalDays = (days: number): string => {
  if (days === 0) return "0 days";
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${months}m`;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format large numbers with abbreviations
 */
export const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};
