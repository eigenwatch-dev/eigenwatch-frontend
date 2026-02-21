"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Shield, BarChart3, Eye } from "lucide-react";
import { BiPulse } from "react-icons/bi";
import SpotlightCard from "../ui/spotlight-card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NetworkStats } from "@/types/network.types";
import { formatNumber, formatTVS } from "@/lib/formatting";

gsap.registerPlugin(ScrollTrigger);

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

interface HeroStatsProps {
  title: string;
  value: string;
  stat: string;
  icon: React.ElementType;
  color: { badge: string; badgeBorder: string; icon: string };
}

function buildHeroStats(stats: NetworkStats | null): HeroStatsProps[] {
  return [
    {
      title: "Operators Analyzed",
      value: stats ? formatNumber(stats.totalOperators) : "1,200+",
      stat: "Full coverage of the network",
      icon: Eye,
      color: {
        badge: "#16245680",
        badgeBorder: "#193CB84D",
        icon: "#2B7FFF",
      },
    },
    {
      title: "Assets Tracked",
      value: stats ? formatTVS(stats.totalTVS) : "$5.8B+",
      stat: "In delegated value monitored",
      icon: BarChart3,
      color: {
        badge: "#032E1580",
        badgeBorder: "#0166304D",
        icon: "#00C950",
      },
    },
    {
      title: "AVS Monitored",
      value: stats ? formatNumber(stats.totalAVS) : "150+",
      stat: "Services under watch",
      icon: BiPulse,
      color: {
        badge: "#3C036680",
        badgeBorder: "#6E11B04D",
        icon: "#AD46FF",
      },
    },
    {
      title: "Risk Assessments",
      value: stats ? `${formatNumber(stats.totalOperators * 2300)}+` : "2.8M+",
      stat: "Daily scores computed",
      icon: Shield,
      color: {
        badge: "#46190180",
        badgeBorder: "#973C004D",
        icon: "#FE9A00",
      },
    },
  ];
}

interface HeroProps {
  stats: NetworkStats | null;
}

const Hero = ({ stats }: HeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const heroStats = buildHeroStats(stats);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".hero-stat-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.3,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-linear-to-b from-[#1624564D] via-[#09090B] to-[#09090B] pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div ref={headingRef} className="max-w-7xl mx-auto mb-16 sm:mb-20">
        <div className="rounded-full bg-[#18181BCC] flex items-center gap-2.5 w-fit px-4 py-2 mx-auto border border-[#27272A80] mb-8">
          <span className="rounded-full w-2 h-2 bg-[#00C950] block shrink-0 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-[#D4D4D8] tracking-tight">
            Live Risk Monitoring for EigenLayer
          </span>
        </div>

        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl pb-1 sm:pb-2 text-transparent font-medium tracking-tight leading-[1.1] sm:leading-[1.15] bg-linear-to-b from-[#ffffff] via-[#F4F4F5] to-[#9F9FA9] bg-clip-text font-outfit">
            Risk Intelligence for
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl py-1 sm:py-2 text-transparent font-medium tracking-tight leading-[1.1] sm:leading-[1.15] mb-6 bg-linear-to-b from-[#ffffff] via-[#F4F4F5] to-[#9F9FA9] bg-clip-text font-outfit">
            EigenLayer Operators
          </h1>
          <p className="text-base sm:text-lg text-[#9F9FA9] max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Monitor operator performance, track risk metrics, and make informed
            decisions with real-time data analysis across the EigenLayer
            ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link
              href={`${dashboardUrl}/operator`}
              className="bg-[#155DFC] hover:bg-[#1249CC] text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors duration-200 px-6 sm:px-8 py-3 text-sm sm:text-base"
            >
              <span>Explore Operators</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="https://docs.eigenwatch.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white border border-[#3F3F46] bg-[#18181B80] px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors duration-200 hover:bg-[#27272A] text-center text-sm sm:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 px-2 sm:px-0">
        {heroStats.map((stat, index) => (
          <div
            key={index}
            className="hero-stat-card bg-[#18181B80] border border-[#27272A80] rounded-xl overflow-clip backdrop-blur-sm"
          >
            <SpotlightCard
              className="p-5 sm:p-5 lg:p-6 pb-2"
              spotlightColor="rgba(160,190,253,0.19)"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm text-[#9F9FA9] leading-tight font-medium uppercase tracking-wider">
                  {stat.title}
                </h4>
                <div
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center shrink-0 ml-2 shadow-inner"
                  style={{
                    borderColor: stat.color.badgeBorder,
                    backgroundColor: stat.color.badge,
                    color: stat.color.icon,
                  }}
                >
                  <stat.icon size={16} className="sm:w-5 sm:h-5" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-2xl lg:text-3xl font-medium mb-1.5 sm:mb-2 tabular-nums font-outfit tracking-tight">
                {stat.value}
              </h2>
              <span className="text-xs sm:text-sm text-[#71717B] mb-3 sm:mb-4 block leading-snug font-medium">
                {stat.stat}
              </span>
            </SpotlightCard>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
