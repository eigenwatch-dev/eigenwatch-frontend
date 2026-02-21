"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lerped smooth scroll
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let scrollTarget = window.scrollY;
    let currentScroll = window.scrollY;
    const ease = 0.08;
    let rafId: number;

    const onScroll = () => {
      scrollTarget = window.scrollY;
    };

    const update = () => {
      currentScroll += (scrollTarget - currentScroll) * ease;
      // Update ScrollTrigger with a refresh so elements track smoothly
      ScrollTrigger.update();
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(update);

    // Refresh ScrollTrigger after everything has loaded
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      ScrollTrigger.killAll();
    };
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}
