"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitFeedback, type FeedbackSentiment } from "@/lib/auth-api";

interface InlineFeedbackProps {
  sectionId: string;
  label?: string;
}

export function InlineFeedback({
  sectionId,
  label = "Was this helpful?",
}: InlineFeedbackProps) {
  const [phase, setPhase] = useState<"idle" | "negative-expand" | "done">(
    "idle",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUp, setFollowUp] = useState("");

  const handleVote = async (sentiment: FeedbackSentiment) => {
    if (sentiment === "NEGATIVE") {
      setPhase("negative-expand");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: "INLINE",
        sentiment,
        section_id: sectionId,
        page_url: window.location.pathname,
      });
    } catch {
      // Silent fail
    }
    setPhase("done");
    setIsSubmitting(false);
  };

  const handleNegativeSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: "INLINE",
        sentiment: "NEGATIVE",
        section_id: sectionId,
        message: followUp.trim() || undefined,
        page_url: window.location.pathname,
      });
    } catch {
      // Silent fail
    }
    setPhase("done");
    setIsSubmitting(false);
  };

  if (phase === "done") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3 text-green-500" />
        <span>Thanks for your feedback</span>
      </div>
    );
  }

  if (phase === "negative-expand") {
    return (
      <div className="space-y-2 max-w-xs">
        <Textarea
          placeholder="What could be better?"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          className="min-h-[60px] resize-none bg-background text-xs"
          maxLength={500}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase("idle")}
            className="text-xs h-7 text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleNegativeSubmit}
            disabled={isSubmitting}
            className="text-xs h-7 bg-purple-500 hover:bg-purple-500/90 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        <button
          onClick={() => handleVote("POSITIVE")}
          disabled={isSubmitting}
          className="p-1 rounded-md text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors duration-150"
          aria-label="Helpful"
        >
          <ThumbsUp className="size-3.5" />
        </button>
        <button
          onClick={() => handleVote("NEGATIVE")}
          disabled={isSubmitting}
          className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150"
          aria-label="Not helpful"
        >
          <ThumbsDown className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
