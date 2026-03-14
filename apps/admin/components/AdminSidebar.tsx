"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { useAdminStore } from "@/hooks/store/useAdminStore";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Feedback", href: "/feedback", icon: MessageSquare },
  { label: "Beta Program", href: "/beta", icon: FlaskConical },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAdminStore((s) => s.logout);

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-30">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <Image
          src="/assets/png/eigenwatch.png"
          alt="EigenWatch"
          width={28}
          height={28}
        />
        <span className="text-sm font-semibold text-sidebar-foreground">
          EigenWatch <span className="text-muted-foreground font-normal">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
