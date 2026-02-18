"use client";

import { NavBar } from "@repo/ui/NavBar";

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

const navLinks = [
  { label: "Dashboard", href: `${dashboardUrl}` },
  { label: "Operator", href: `${dashboardUrl}/operator` },
  { label: "AVS", href: `${dashboardUrl}/avs` },
  { label: "Strategy", href: `${dashboardUrl}/strategy` },
];

import Link from "next/link";
import { Wallet } from "lucide-react";

export default function Header() {
  return (
    <NavBar
      logoHref="/"
      navLinks={navLinks}
      walletConnect={
        <Link href={dashboardUrl}>
          <button className="bg-[#155DFC] hover:bg-[#155DFC]/70 rounded-[10px] flex gap-[6px] px-[18px] py-[8px] text-white transition-colors">
            <Wallet size={16} className="my-auto" />
            <span className="text-[14px] font-medium">Connect Wallet</span>
          </button>
        </Link>
      }
    />
  );
}
