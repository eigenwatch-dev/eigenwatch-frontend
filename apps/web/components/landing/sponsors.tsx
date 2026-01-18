"use client";

import Image from "next/image";
import ParallaxBall from "../ui/parallax-ball";
import SpotlightCard from "../ui/spotlight-card";

export default function Sponsors() {
  return (
    <section className="py-20 px-4 md:px-8 bg-[#09090B] max-w-7xl mx-auto w-full relative">
      <ParallaxBall />
      <div className="flex items-center justify-center flex-col md:flex-row gap-20">
        <div className="flex items-center gap-4 flex-col md:flex-row">
          <h4 className="text-[#9F9FA9] text-lg font-medium">Powered by:</h4>
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

        <div className="flex items-center gap-4 flex-col md:flex-row">
          <h4 className="text-[#9F9FA9] text-lg font-medium">Incubated by:</h4>
          <div className="rounded-lg overflow-clip bg-card w-42 h-18 border border-border">
            <SpotlightCard
              className="p-4"
              spotlightColor="rgba(160,190,253,0.19)"
            >
              <Image
                src="/images/fracton.png"
                alt="Eigen Cloud Logo"
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
