"use client";

import { LogOut, Copy, User, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import useAuthStore from "@/hooks/store/useAuthStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function UserDropdown() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { tier } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tierColor = {
    free: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    pro: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    enterprise: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    anonymous: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }[tier || "anonymous"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 gap-2 bg-[#18181B] border-white/10 hover:bg-[#27272A] hover:text-white text-white font-mono"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
          {truncatedAddress}
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#18181B] border-white/10 text-white"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Connected</p>
            <p className="text-xs leading-none text-muted-foreground font-mono">
              {truncatedAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuGroup>
          <div className="px-2 py-1.5">
            <div
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full w-fit border font-medium uppercase tracking-wider",
                tierColor,
              )}
            >
              {tier === "anonymous" ? "No Plan" : `${tier} Plan`}
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleCopyAddress}
            className="focus:bg-[#27272A] focus:text-white cursor-pointer"
          >
            <Copy className="mr-2 h-4 w-4" />
            <span>{copied ? "Copied!" : "Copy Address"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-[#27272A] focus:text-white cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
