import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  // Payment status
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  CONFIRMING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  EXPIRED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  // Tiers
  FREE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  PRO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  // Feedback
  POSITIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  NEGATIVE: "bg-red-500/10 text-red-500 border-red-500/20",
  GENERAL: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  INLINE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PAYWALL: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  FEATURE_REQUEST: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  // Payment methods
  CRYPTO_DIRECT: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  CHAINRAILS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        statusColors[status] || "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
