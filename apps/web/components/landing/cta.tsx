"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NetworkStats } from "@/types/network.types";
import { formatNumber, formatTVS } from "@/lib/formatting";

gsap.registerPlugin(ScrollTrigger);

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

interface CTAProps {
  stats: NetworkStats | null;
}

export default function CTA({ stats }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ".cta-content",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const ctaStats = [
    {
      value: stats ? `${formatNumber(stats.totalOperators)}+` : "1,200+",
      label: "Operators Analyzed",
    },
    {
      value: stats ? formatTVS(stats.totalTVS) : "$5.8B+",
      label: "Assets Tracked",
    },
    {
      value: stats ? `${formatNumber(stats.totalAVS)}+` : "150+",
      label: "Services Monitored",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="cta-content relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-b from-[#1624564D] to-[#09090B] border border-[#27272A80] p-6 sm:p-10 md:p-16 lg:p-20 text-center">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 sm:mb-8 font-outfit leading-[1.2]">
              Start Monitoring Your Operators Today
            </h2>
            <p className="text-[#9F9FA9] text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 font-medium">
              Explore operator risk scores, track delegated assets, and discover
              the safest operators on EigenLayer — all for free.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 items-center px-4 sm:px-0">
              <Link
                href={`${dashboardUrl}/operator`}
                className="bg-[#155DFC] hover:bg-[#1249CC] text-white px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link
                href="https://docs.eigenwatch.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#18181B80] border border-[#3F3F46] hover:bg-[#27272A] text-white px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                View Documentation
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto border-t border-white/10 pt-10 sm:pt-14">
              {ctaStats.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center sm:items-start text-center sm:text-left"
                >
                  <h3 className="text-3xl sm:text-3xl md:text-4xl font-medium text-white mb-1 sm:mb-2 tabular-nums font-outfit tracking-tight">
                    {item.value}
                  </h3>
                  <p className="text-[#71717A] text-sm sm:text-base font-medium uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Background Gradient Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_50%_0%,_rgba(21,93,252,0.12)_0%,_transparent_50%)] pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
