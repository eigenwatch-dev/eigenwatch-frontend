"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

export function FeedbackFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 transition-all duration-200 hover:border-purple-500/30 hover:bg-purple-500/5"
        aria-label="Share feedback"
      >
        <MessageSquarePlus className="size-4 text-purple-500 shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs text-muted-foreground transition-all duration-200 group-hover:max-w-[120px] group-hover:text-foreground">
          Share Feedback
        </span>
      </button>

      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
