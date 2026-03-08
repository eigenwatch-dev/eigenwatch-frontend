"use client";

import { useState } from "react";
import { MessageSquarePlus, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "@/lib/auth-api";

const CATEGORIES = [
  { id: "missing_feature", label: "Missing feature" },
  { id: "data_quality", label: "Data quality" },
  { id: "usability", label: "Usability issue" },
  { id: "too_technical", label: "Too technical" },
  { id: "not_enough_data", label: "Not enough data" },
  { id: "other", label: "Other" },
] as const;

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory && !message.trim()) return;

    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: message.trim() && selectedCategory === "missing_feature"
          ? "FEATURE_REQUEST"
          : "GENERAL",
        category: selectedCategory || undefined,
        message: message.trim() || undefined,
        page_url: window.location.pathname,
      });
      setStep("success");
    } catch {
      // Silently fail — don't disrupt UX for feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setStep("form");
      setSelectedCategory(null);
      setMessage("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <MessageSquarePlus className="size-4 text-purple-500" />
                Share Feedback
              </DialogTitle>
              <DialogDescription>
                Your feedback shapes what we build next.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  What best describes your feedback?
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat.id ? null : cat.id,
                        )
                      }
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors duration-150 ${
                        selectedCategory === cat.id
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-highlight-border"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Textarea
                  placeholder="Tell us more (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] resize-none bg-background text-sm"
                  maxLength={2000}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={(!selectedCategory && !message.trim()) || isSubmitting}
                className="bg-purple-500 hover:bg-purple-500/90 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Send Feedback"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto size-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="size-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Thanks for your feedback
              </p>
              <p className="text-xs text-muted-foreground">
                We review every submission and prioritize features our users
                care about.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
