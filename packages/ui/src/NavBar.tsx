"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavBarProps {
  logoHref?: string;
  navLinks?: NavLink[];
  activePath?: string;
  walletConnect?: React.ReactNode;
}

const menuVariants = {
  initial: {
    y: "-100%",
  },
  animate: {
    y: "0%",
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    y: "-100%",
    transition: {
      duration: 0.3,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export function NavBar({
  logoHref = "/",
  navLinks = [],
  activePath,
  walletConnect,
}: NavBarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPath = activePath || pathname;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090B]/80 backdrop-blur-md border-b border-white/10 w-full">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Logo */}
        <div className="flex my-auto">
          <Link href={logoHref}>
            <Image
              src={"/assets/png/eigenwatch.png"}
              alt="logo"
              width={147}
              height={43}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex my-auto gap-8">
          {navLinks.map((route, index) => {
            const isActive =
              route.href === "/"
                ? currentPath === route.href
                : currentPath.startsWith(route.href);
            return (
              <Link key={index} href={route.href}>
                <button
                  className={`flex h-10 py-2 transition-all duration-300 ${
                    isActive
                      ? "px-6 rounded-[20px] bg-[#1C398E33]"
                      : "bg-transparent"
                  }`}
                >
                  <span
                    className={`text-[16px] my-auto ${
                      isActive ? "text-white" : "text-[#9F9FA9]"
                    }`}
                  >
                    {route.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* Desktop Connect Button */}
        <div className="hidden md:flex my-auto">
          {/* <ConnectButton /> */}
          {/* <AppKitButton /> */}
          {walletConnect}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 my-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="md:hidden absolute inset-0 top-16.25 bg-[#09090B] w-full h-screen border-t border-white/5 flex flex-col p-4"
          >
            <div className="space-y-4">
              {navLinks.map((link, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className="block text-[#A1A1AA] hover:text-white transition-colors py-2 text-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={itemVariants}>
                <div className="mt-4">
                  {/* <ConnectButton /> */}
                  {/* <AppKitButton size="md" /> */}
                  {walletConnect}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
