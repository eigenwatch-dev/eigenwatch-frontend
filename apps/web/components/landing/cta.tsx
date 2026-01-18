"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppKitButton, useAppKitAccount } from "@reown/appkit/react";

export default function CTA() {
  const { isConnected } = useAppKitAccount();
  return (
    <section className="py-20 px-4 md:px-8 bg-[#09090B]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-linear-to-b from-[#1624564D] to-[#09090B] border border-[#27272A80] p-12 md:p-20 text-center"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-normal text-white mb-6">
              Start Monitoring Your Operators Today
            </h2>
            <p className="text-[#9F9FA9] text-lg max-w-2xl mx-auto mb-10">
              Connect your wallet to view personalized risk insights, track your
              delegated operators, and receive real-time alerts.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 items-center">
              {!isConnected && <AppKitButton size="lg" />}
              <Link
                href="#"
                className="bg-[#18181B80] border border-[#3F3F46] hover:bg-[#18181B] text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                View Documentation
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-[#27272A80] pt-10">
              <div>
                <h3 className="text-3xl font-medium text-white mb-1">1,247+</h3>
                <p className="text-[#71717A] text-sm">Operators Tracked</p>
              </div>
              <div>
                <h3 className="text-3xl font-medium text-white mb-1">
                  2.4M ETH
                </h3>
                <p className="text-[#71717A] text-sm">Total Value Locked</p>
              </div>
              <div>
                <h3 className="text-3xl font-medium text-white mb-1">156+</h3>
                <p className="text-[#71717A] text-sm">Active AVS</p>
              </div>
            </div>
          </div>

          {/* Background Gradient Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial-gradient from-[#155DFC20] to-transparent opacity-50 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
