"use client";

import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Bell,
  CreditCard,
  Monitor,
  AlertTriangle,
} from "lucide-react";

export type SettingsSection =
  | "profile"
  | "emails"
  | "notifications"
  | "subscription"
  | "sessions"
  | "danger-zone";

interface SettingsSidebarProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

const SECTIONS: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { id: "emails", label: "Emails", icon: <Mail className="h-4 w-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: <CreditCard className="h-4 w-4" />,
  },
  { id: "sessions", label: "Sessions", icon: <Monitor className="h-4 w-4" /> },
];

const DANGER_SECTION = {
  id: "danger-zone" as SettingsSection,
  label: "Danger Zone",
  icon: <AlertTriangle className="h-4 w-4" />,
};

export function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-48 shrink-0">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => onChange(section.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left",
              active === section.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {section.icon}
            {section.label}
          </button>
        ))}

        {/* Danger Zone — separated with a divider */}
        <div className="my-2 border-t border-border" />
        <button
          onClick={() => onChange(DANGER_SECTION.id)}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left",
            active === DANGER_SECTION.id
              ? "bg-red-500/10 text-red-500"
              : "text-red-500/70 hover:text-red-500 hover:bg-red-500/5",
          )}
        >
          {DANGER_SECTION.icon}
          {DANGER_SECTION.label}
        </button>
      </nav>

      {/* Mobile top tabs */}
      <div className="flex md:hidden overflow-x-auto gap-1 pb-2 border-b border-border">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => onChange(section.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              active === section.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {section.icon}
            {section.label}
          </button>
        ))}

        {/* Danger Zone on mobile */}
        <button
          onClick={() => onChange(DANGER_SECTION.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
            active === DANGER_SECTION.id
              ? "bg-red-500/10 text-red-500"
              : "text-red-500/70 hover:text-red-500",
          )}
        >
          {DANGER_SECTION.icon}
          {DANGER_SECTION.label}
        </button>
      </div>
    </>
  );
}
