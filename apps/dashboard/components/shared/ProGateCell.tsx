"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeatureComingSoonModal } from "@/components/shared/FeatureComingSoonModal";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProGateCellProps {
  children: React.ReactNode;
  isLocked: boolean;
  feature: string;
  description?: string;
}

export function ProGateCell({
  children,
  isLocked,
  feature,
  description,
}: ProGateCellProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    setShowModal(true);
  };

  const handleLearnMore = () => {
    router.push("/settings#subscription");
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative cursor-pointer group">
            <div className="blur-sm pointer-events-none select-none">
              {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 bg-card border-border p-4 space-y-3"
          side="top"
          align="center"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Pro Feature
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {description || `Unlock ${feature} with a Pro subscription.`}
          </p>
          <div className="space-y-2">
            <Button size="sm" className="w-full" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground h-8"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <FeatureComingSoonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName="Pro Plan"
        benefits="Full risk analysis, detailed strategy tables, delegator intelligence, commission behavior history, operator comparison tools, watchlist with alerts, and priority API access."
      />
    </>
  );
}
