"use client";

import Link from "next/link";
// import MacScreen from "../ui/mac-screen";
import { motion } from "motion/react";
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react";
import { IconType } from "react-icons";
import { BiPulse } from "react-icons/bi";
import SpotlightCard from "../ui/spotlight-card";

interface HeroStatsProps {
  title: string;
  value: number | string;
  stat: string;
  icon: IconType;
  color: { badge: string; badgeBorder: string; icon: string };
}

const heroStats: HeroStatsProps[] = [
  {
    title: "Total Operators",
    value: 1247,
    stat: "+12% this month",
    icon: Users,
    color: {
      badge: "#16245680",
      badgeBorder: "#193CB84D",
      icon: "#2B7FFF",
    },
  },
  {
    title: "Total Value Locked",
    value: "2.4M ETH",
    stat: "≈ $5.8B USD",
    icon: TrendingUp,
    color: {
      badge: "#032E1580",
      badgeBorder: "#0166304D",
      icon: "#00C950",
    },
  },
  {
    title: "Active AVS",
    value: 156,
    stat: "Across ecosystems",
    icon: BiPulse,
    color: {
      badge: "#3C036680",
      badgeBorder: "#6E11B04D",
      icon: "#AD46FF",
    },
  },
  {
    title: "Avg Risk Score",
    value: "28%",
    stat: "Low risk average",
    icon: Shield,
    color: {
      badge: "#46190180",
      badgeBorder: "#973C004D",
      icon: "#FE9A00",
    },
  },
];

const Hero = () => {
  return (
    <section className="bg-linear-to-b from-[#1624564D] via-[#09090B] to-[#09090B] pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto mb-20">
        <div className="rounded-full bg-[#18181BCC] flex items-center gap-2 w-fit pr-3 p-1 mx-auto border border-[#27272A80] mb-6">
          <span className="rounded-full w-2 h-2 bg-[#00C950] block" />

          <span className="text-sm md:text-md font-medium text-[#D4D4D8]">
            Live Risk Monitoring for EigenLayer{" "}
          </span>
        </div>

        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl lg:text-7xl pb-3 text-transparent font-normal bg-linear-to-b from-[#ffffff] via-[#F4F4F5] to-[#9F9FA9] bg-clip-text"
          >
            Risk Monitoring for
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl lg:text-7xl p-3 text-transparent font-normal mb-5.5 bg-linear-to-b from-[#ffffff] via-[#F4F4F5] to-[#9F9FA9] bg-clip-text"
          >
            EigenLayer Operators
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-[#9F9FA9] max-w-3xl mx-auto mb-10.5"
          >
            Monitor operator performance, track risk metrics, and make informed
            decisions with real-time data analysis for EigenLayer's AVS
            ecosystem.
          </motion.p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="bg-[#155DFC] hover:bg-[#7214FF80] text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors duration-300 px-8 py-3"
            >
              <span>Explore Operators</span>
              <ArrowRight size={20} />
            </Link>

            <Link
              href=""
              className="text-white border-[1.33px] border-[#3F3F46] bg-[#18181B80] px-8 py-3 rounded-xl cursor-pointer font-medium transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full mx-auto flex items-center flex-wrap gap-6 justify-center"
      >
        {heroStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="min-w-75.5 max-w-75.5 bg-[#18181B80] border-[1.33px] border-[#27272A80] flex-1 rounded-[14px] overflow-clip"
          >
            <SpotlightCard
              className="p-6 pb-0.5"
              spotlightColor="rgba(160,190,253,0.19)"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-[#9F9FA9]">{stat.title}</h4>
                <div
                  className="rounded-full w-10 aspect-square border-[1.33px] flex items-center justify-center"
                  style={{
                    borderColor: stat.color.badgeBorder,
                    backgroundColor: stat.color.badge,
                    color: stat.color.icon,
                  }}
                >
                  <stat.icon size={20} />
                </div>
              </div>
              <h2 className="text-3xl mb-3">{stat.value}</h2>
              <span className="text-sm text-[#71717B] mb-5 block">
                {stat.stat}
              </span>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Hero;
