"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Smartphone, Sparkles } from "lucide-react";

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export const DesktopOnlyGuard = ({ children }: DesktopOnlyGuardProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // 1024px is standard 'lg' breakpoint in Tailwind
      setIsMobile(window.innerWidth < 1024);
      setIsReady(true);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isReady) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 max-w-sm w-full text-center space-y-8">
          <div className="flex justify-center flex-col items-center gap-4">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Smartphone className="h-10 w-10 text-muted-foreground opacity-50 absolute -right-2 -top-2 rotate-12" />
                <Monitor className="h-12 w-12 text-primary" />
              </div>
              <Sparkles className="absolute -left-4 -bottom-4 h-6 w-6 text-purple-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Desktop Only Experience
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The EigenWatch risk dashboard is currently optimized for large
                screens to ensure you have the best visibility into complex
                data.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
            <p className="text-sm font-medium text-primary">
              Mobile App Coming Soon
            </p>
            <p className="text-xs text-muted-foreground">
              We&apos;re building a beautiful mobile experience. For now, please
              login from your desktop.
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-50">
            EigenWatch &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
