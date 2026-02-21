"use client";

import { useEffect, useRef } from "react";
import {
  Shield,
  TrendingUp,
  Bell,
  ChartBar,
  Search,
  BellRing,
} from "lucide-react";
import SpotlightCard from "../ui/spotlight-card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const tools = [
  {
    title: "Risk Assessment",
    stat: "Comprehensive risk scoring system with real-time updates based on operator performance and AVS metrics.",
    icon: Shield,
    color: {
      badge: "#032E1580",
      badgeBorder: "#0166304D",
      icon: "#00C950",
    },
  },
  {
    title: "Performance Analytics",
    stat: "Track operator performance trends, uptime statistics, and delegation patterns over time.",
    icon: TrendingUp,
    color: {
      badge: "#16245680",
      badgeBorder: "#193CB84D",
      icon: "#2B7FFF",
    },
  },
  {
    title: "Risk Alerts",
    stat: "Get notified when risk scores change significantly or when operators require attention.",
    icon: Bell,
    color: {
      badge: "#46190180",
      badgeBorder: "#973C004D",
      icon: "#FE9A00",
    },
  },
  {
    title: "Portfolio Dashboard",
    stat: "Visualize your delegated stake distribution and overall portfolio risk exposure.",
    icon: ChartBar,
    color: {
      badge: "#3C036680",
      badgeBorder: "#6E11B04D",
      icon: "#AD46FF",
    },
  },
  {
    title: "Operator Discovery",
    stat: "Browse and filter operators by risk level, AVS participation, and delegation amount.",
    icon: Search,
    color: {
      badge: "#16245680",
      badgeBorder: "#193CB84D",
      icon: "#00C2FF",
    },
  },
  {
    title: "Custom Notifications",
    stat: "Set up personalized alerts for specific operators, AVS changes, or risk thresholds.",
    icon: BellRing,
    color: {
      badge: "#46080880",
      badgeBorder: "#9700004D",
      icon: "#FF3B30",
    },
  },
];

export default function Tools() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".tools-heading", {
        scrollTrigger: {
          trigger: ".tools-heading",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".tool-card", {
        scrollTrigger: {
          trigger: ".tool-card",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="tools-heading text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 font-outfit tracking-tight leading-tight">
            Powerful Risk Monitoring Tools
          </h2>
          <p className="text-[#9F9FA9] text-lg max-w-2xl mx-auto">
            Everything you need to monitor and manage risk across the EigenLayer
            ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="tool-card bg-[#18181B80] border-[1.33px] border-[#27272A80] rounded-[14px] hover:border-[#3F3F46] transition-colors duration-200 overflow-clip"
            >
              <SpotlightCard
                className="p-6"
                spotlightColor="rgba(160,190,253,0.19)"
              >
                <div
                  className="rounded-lg w-10 h-10 border-[1.33px] flex items-center justify-center mb-4"
                  style={{
                    borderColor: tool.color.badgeBorder,
                    backgroundColor: tool.color.badge,
                    color: tool.color.icon,
                  }}
                >
                  <tool.icon size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-outfit tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-[#9F9FA9] text-sm sm:text-base leading-relaxed font-medium">
                  {tool.stat}
                </p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
