import { ComingSoon } from "@/components/shared/ComingSoon";
import { Shield } from "lucide-react";

export default function AVSPage() {
  return (
    <ComingSoon
      title="AVS Explorer"
      description="Explore and analyze Active Validated Services on EigenLayer. View performance metrics, security parameters, and operator participation."
      icon={<Shield className="h-12 w-12 text-primary mb-4" />}
    />
  );
}
