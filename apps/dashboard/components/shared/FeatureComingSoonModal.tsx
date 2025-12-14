import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface FeatureComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  benefits: string;
}

export const FeatureComingSoonModal = ({
  isOpen,
  onClose,
  featureName,
  benefits,
}: FeatureComingSoonModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Coming Soon: {featureName}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-base">
            We&apos;re working hard to bring you this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-medium mb-2 text-sm text-foreground">What to expect:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {benefits}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
