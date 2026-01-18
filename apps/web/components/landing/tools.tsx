"use client";

import { motion } from "motion/react";
import {
  Shield,
  TrendingUp,
  Bell,
  LayoutDashboard,
  Search,
  BellRing,
  ChartBar,
} from "lucide-react";
import SpotlightCard from "../ui/spotlight-card";

const tools = [
  {
    title: "Risk Assessment",
    value: "Risk Assessment",
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
    value: "Performance Analytics",
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
    value: "Risk Alerts",
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
    value: "Portfolio Dashboard",
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
    value: "Operator Discovery",
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
    value: "Custom Notifications",
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
  return (
    <section className="py-20 px-4 md:px-8 bg-[#09090B]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-normal text-white mb-4"
          >
            Powerful Risk Monitoring Tools
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#9F9FA9] text-lg"
          >
            Everything you need to monitor and manage risk across the EigenLayer
            ecosystem
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#18181B80] border-[1.33px] border-[#27272A80] rounded-[14px] hover:border-[#27272A] transition-colors overflow-clip"
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
                <h3 className="text-xl font-medium text-white mb-3">
                  {tool.value}
                </h3>
                <p className="text-[#9F9FA9] text-sm leading-relaxed">
                  {tool.stat}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
