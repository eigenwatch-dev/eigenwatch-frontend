"use client";

import { NavBar } from "@repo/ui/NavBar";

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

const navLinks = [
  { label: "Operators", href: `${dashboardUrl}/operator` },
  { label: "AVS", href: `${dashboardUrl}/avs` },
  { label: "Strategy", href: `${dashboardUrl}/strategy` },
  { label: "Docs", href: "https://docs.eigenwatch.xyz" },
];

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Header() {
  return (
    <NavBar
      logoHref="/"
      navLinks={navLinks}
      walletConnect={
        <Link href={`${dashboardUrl}/operator`}>
          <button className="bg-[#155DFC] hover:bg-[#1249CC] rounded-xl flex items-center gap-2 px-6 py-2.5 text-white transition-all duration-200 shadow-lg shadow-[#155DFC]/20">
            <span className="text-sm sm:text-base font-semibold">
              Get Started
            </span>
            <ArrowRight size={18} />
          </button>
        </Link>
      }
    />
  );
}
