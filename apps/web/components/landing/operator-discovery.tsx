"use client";

import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const operators = [
  {
    name: "Eigen Yields",
    id: "0x7232...",
    avs: "EigenDA",
    delegated: "45.2 ETH",
    riskScore: 15,
    change: -2,
    riskLevel: "Low Risk",
  },
  {
    name: "StakeWise",
    id: "0x8172...",
    avs: "EigenDA",
    delegated: "38.5 ETH",
    riskScore: 42,
    change: 1.5,
    riskLevel: "Medium Risk",
  },
  {
    name: "Lido Finance",
    id: "0x3341...",
    avs: "Multiple AVS",
    delegated: "18.8 ETH",
    riskScore: 15,
    change: -1,
    riskLevel: "Low Risk",
  },
  {
    name: "Rocket Pool",
    id: "0x4123...",
    avs: "EigenDA",
    delegated: "10.2 ETH",
    riskScore: 72,
    change: 12,
    riskLevel: "High Risk",
  },
];

export default function OperatorDiscovery() {
  const router = useRouter();
  return (
    <section className="py-20 px-4 md:px-8 bg-[#09090B]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-normal text-white mb-4"
          >
            Operator Discovery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#9F9FA9] text-lg"
          >
            Browse operators with real-time risk assessment and performance
            metrics
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-[#18181B80] border border-[#27272A80] rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-[#27272A80]">
            <h3 className="text-white font-medium">Your Delegated Operators</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#71717A] border-b border-[#27272A80]">
                  <th className="p-6 font-medium">Operator</th>
                  <th className="p-6 font-medium">ID</th>
                  <th className="p-6 font-medium">AVS</th>
                  <th className="p-6 font-medium">Delegated</th>
                  <th className="p-6 font-medium">Risk Score</th>
                  <th className="p-6 font-medium">Change</th>
                  <th className="p-6 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A80]">
                {operators.map((op, index) => (
                  <tr
                    key={index}
                    className="text-white hover:bg-[#27272A40] transition-colors"
                  >
                    <td className="p-6 font-medium">{op.name}</td>
                    <td className="p-6 text-[#A1A1AA]">{op.id}</td>
                    <td className="p-6 text-[#A1A1AA]">{op.avs}</td>
                    <td className="p-6 font-medium">{op.delegated}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{op.riskScore}%</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium
                            ${
                              op.riskLevel === "Low Risk"
                                ? "bg-[#032E15] text-[#00C950]"
                                : op.riskLevel === "Medium Risk"
                                  ? "bg-[#461901] text-[#FE9A00]"
                                  : "bg-[#460808] text-[#FF3B30]"
                            }`}
                        >
                          {op.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div
                        className={`flex items-center gap-1 text-xs font-medium
                          ${op.change < 0 ? "text-[#00C950]" : "text-[#FF3B30]"}`}
                      >
                        {op.change < 0 ? (
                          <>
                            <ArrowDownRight size={14} />
                            <span>{Math.abs(op.change)}% this week</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={14} />
                            <span>+{op.change}% this week</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="text-[#A1A1AA] hover:text-white text-xs transition-colors flex items-center gap-2">
                        <span>View</span>
                        <ArrowRight size={20} className="-rotate-45" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#27272A80] flex justify-between items-center text-xs text-[#71717A]">
            <span>Showing 4 of 1,247 operators</span>
            <button
              onClick={() => router.push("/operator")}
              className="px-4 py-2 rounded-lg border border-[#27272A] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
            >
              View All Operators
            </button>
          </div>
        </motion.div>

        <div className="flex justify-center gap-6 mt-8 text-[10px] text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C950]"></span>
            <span>Low Risk (0-20)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FE9A00]"></span>
            <span>Medium Risk (21-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
            <span>High Risk (61-100)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
