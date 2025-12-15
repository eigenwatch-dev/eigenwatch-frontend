"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type ParallaxBallProps = {
  ballNum?: 1 | 2 | 3 | 4;
};

const ballPositions = [
  // ball 1: right/top
  {
    base: "-right-[160px] -top-[150px]",
    lg: "lg:-right-[130px] lg:-top-[230px]",
  },
  // ball 2: left/about 150vh
  {
    base: "-left-[160px] top-[150vh]",
    lg: "lg:-left-[130px] lg:top-[150vh]",
  },
  // ball 3: right/about 300vh
  {
    base: "-right-[160px] top-[300vh]",
    lg: "lg:-right-[130px] lg:top-[300vh]",
  },
  // ball 4: left/about 450vh
  {
    base: "-left-[160px] top-[450vh]",
    lg: "lg:-left-[130px] lg:top-[450vh]",
  },
];

function ParallaxBall({ ballNum = 1 }: ParallaxBallProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function handleScroll() {
      setOffset(window.scrollY * 0.2);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clamp ballNum between 1 and 4
  const ballIndex = Math.max(0, Math.min(3, (ballNum ?? 1) - 1));
  const pos = ballPositions[ballIndex];

  return (
    <Image
      src="/assets/ball-webpage.avif"
      alt={`parallax-ball-${ballNum}`}
      width={600}
      height={600}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: "transform",
      }}
      className={`absolute ${pos?.lg} ${pos?.base} ball-bounce -z-10
        w-75 h-75
        sm:w-100 sm:h-100
        md:w-125 md:h-125
        lg:w-150 lg:h-150`}
      priority
    />
  );
}

export default ParallaxBall;
