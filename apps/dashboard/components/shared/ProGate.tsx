"use client";

import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProUpgradeCardProps {
  feature: string;
  description?: string;
}

export function ProUpgradeCard({ feature, description }: ProUpgradeCardProps) {
  return (
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
          <Button size="sm" className="w-full">
            Upgrade to Pro
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProGateProps {
  children: React.ReactNode;
  isLocked: boolean;
  feature: string;
  description?: string;
}

export function ProGate({
  children,
  isLocked,
  feature,
  description,
}: ProGateProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
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
