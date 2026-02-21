"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, Layers, BarChart3 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

const features = [
  {
    icon: Shield,
    title: "Risk Scoring",
    description:
      "Every operator scored across multiple risk dimensions with confidence intervals.",
    color: "#00C950",
  },
  {
    icon: Layers,
    title: "7 Analysis Tabs",
    description:
      "Overview, Strategies, AVS, Delegators, Allocations, Commission, and Risk Analysis.",
    color: "#2B7FFF",
  },
  {
    icon: BarChart3,
    title: "Pro Insights",
    description:
      "Unlock detailed analytics, concentration metrics, and predictive indicators.",
    color: "#AD46FF",
  },
];

export default function OperatorDiscovery() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".discovery-content", {
        scrollTrigger: {
          trigger: ".discovery-content",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        x: -30,
        duration: 0.6,
        ease: "power2.out",
      });

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top 85%",
              end: "bottom 20%",
              scrub: 1,
            },
            y: -20,
            opacity: 1,
            ease: "none",
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="discovery-content space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mb-6 font-outfit leading-tight">
                Deep-Dive Into Any Operator
              </h2>
              <p className="text-[#9F9FA9] text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
                Every operator on EigenLayer, analyzed and scored. Browse
                real-time risk assessments, performance metrics, and delegation
                data — all in one place.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="rounded-lg w-9 h-9 sm:w-10 sm:h-10 border flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      borderColor: `${feature.color}4D`,
                      backgroundColor: `${feature.color}1A`,
                      color: feature.color,
                    }}
                  >
                    <feature.icon
                      size={16}
                      className="sm:w-[18px] sm:h-[18px]"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm sm:text-base mb-0.5 sm:mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-[#9F9FA9] text-xs sm:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={`${dashboardUrl}/operator`}
              className="inline-flex items-center gap-2 bg-[#155DFC] hover:bg-[#1249CC] text-white rounded-xl font-medium transition-colors duration-200 px-6 sm:px-8 py-3 text-sm sm:text-base"
            >
              <span>Explore Operators</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right: Product Screenshot */}
          <div
            ref={imageRef}
            className="relative max-w-2xl mx-auto lg:max-w-none"
          >
            {/* Browser frame */}
            <div className="rounded-xl border border-white/10 bg-[#18181B] overflow-hidden shadow-2xl">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#1C1C1F]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-sm" />
                </div>
                <div className="flex-1 mx-4 sm:mx-10 md:mx-16">
                  <div className="bg-[#09090B] rounded-md px-3 py-1.5 text-[10px] sm:text-xs text-[#71717A] text-center font-mono truncate border border-white/5">
                    dashboard.eigenwatch.xyz/operator
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <Image
                src="/images/operatorlist.png"
                alt="EigenWatch Operator Dashboard showing real-time risk scores, AVS participation, and delegation data"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority={false}
              />
            </div>

            {/* Ambient glow behind the screenshot */}
            <div className="absolute -inset-6 sm:-inset-8 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(21,93,252,0.08)_0%,_transparent_70%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
