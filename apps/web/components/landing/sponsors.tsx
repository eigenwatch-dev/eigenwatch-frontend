"use client";

import Image from "next/image";
import SpotlightCard from "../ui/spotlight-card";

export default function Sponsors() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#09090B] max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-center flex-col sm:flex-row gap-12 sm:gap-20">
        <div className="flex items-center gap-4 flex-col sm:flex-row">
          <h4 className="text-[#9F9FA9] text-base font-medium">Powered by:</h4>
          <div className="rounded-lg overflow-clip bg-card w-42 h-18 border border-border">
            <SpotlightCard
              className="p-4"
              spotlightColor="rgba(160,190,253,0.19)"
            >
              <Image
                src="/images/eigencloud.png"
                alt="Eigen Cloud Logo"
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            </SpotlightCard>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-col sm:flex-row">
          <h4 className="text-[#9F9FA9] text-base font-medium">
            Incubated by:
          </h4>
          <div className="rounded-lg overflow-clip bg-card w-42 h-18 border border-border">
            <SpotlightCard
              className="p-4"
              spotlightColor="rgba(160,190,253,0.19)"
            >
              <Image
                src="/images/fracton.png"
                alt="Fracton Ventures Logo"
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
