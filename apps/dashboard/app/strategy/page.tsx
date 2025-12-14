import { ComingSoon } from "@/components/shared/ComingSoon";
import { TrendingUp } from "lucide-react";

export default function StrategyPage() {
  return (
    <ComingSoon
      title="Strategy Explorer"
      description="Discover and compare different restaking strategies. Analyze yields, risk profiles, and asset allocation opportunities."
      icon={<TrendingUp className="h-12 w-12 text-primary mb-4" />}
    />
  );
}
