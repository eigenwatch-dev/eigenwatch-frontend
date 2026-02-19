"use client";

import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProUpgradeCardProps {
  feature: string;
  description?: string;
}

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeatureComingSoonModal } from "@/components/shared/FeatureComingSoonModal";

export function ProUpgradeCard({ feature, description }: ProUpgradeCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleUpgrade = () => {
    setShowModal(true);
  };

  const handleLearnMore = () => {
    router.push("/settings#subscription");
  };

  return (
    <>
      <Card className="border-border bg-card max-w-sm">
        <CardContent className="p-6 text-center space-y-3">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Pro Feature
            </h3>
            <p className="text-sm text-muted-foreground">
              {description || `Unlock ${feature} with a Pro subscription.`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" className="w-full" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      <FeatureComingSoonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName="Pro Plan"
        benefits="Full risk analysis, detailed strategy tables, delegator intelligence, commission behavior history, operator comparison tools, watchlist with alerts, and priority API access."
      />
    </>
  );
}

const BLUR_MAP = {
  light: "blur-[2px]",
  medium: "blur-sm",
  heavy: "blur-md",
} as const;

interface ProGateProps {
  children: React.ReactNode;
  isLocked: boolean;
  feature: string;
  description?: string;
  variant?: "overlay" | "inline";
  blurIntensity?: "light" | "medium" | "heavy";
}

export function ProGate({
  children,
  isLocked,
  feature,
  description,
  variant = "overlay",
  blurIntensity = "medium",
}: ProGateProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  const blurClass = BLUR_MAP[blurIntensity];

  if (variant === "inline") {
    return (
      <div className="relative">
        <div className={`${blurClass} pointer-events-none select-none`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${blurClass} pointer-events-none select-none`}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <ProUpgradeCard feature={feature} description={description} />
      </div>
    </div>
  );
}

export function ProBadge() {
  return (
    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[10px]">
      PRO
    </Badge>
  );
}
