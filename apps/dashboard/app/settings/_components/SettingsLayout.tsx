"use client";

import { useState, useEffect, useCallback } from "react";
import { SettingsSidebar, SettingsSection } from "./SettingsSidebar";
import { ProfileSection } from "./ProfileSection";
import { EmailsSection } from "./EmailsSection";
import { NotificationsSection } from "./NotificationsSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { SessionsSection } from "./SessionsSection";
import { DangerZone } from "./DangerZone";

const VALID_SECTIONS: SettingsSection[] = [
  "profile",
  "emails",
  "notifications",
  "subscription",
  "sessions",
  "danger-zone",
];

function getHashSection(): SettingsSection {
  if (typeof window === "undefined") return "profile";
  const hash = window.location.hash.replace("#", "");
  return VALID_SECTIONS.includes(hash as SettingsSection)
    ? (hash as SettingsSection)
    : "profile";
}

export function SettingsLayout() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  // Read hash on mount
  useEffect(() => {
    setActiveSection(getHashSection());
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const onHashChange = () => setActiveSection(getHashSection());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleSectionChange = useCallback((section: SettingsSection) => {
    window.location.hash = section;
    setActiveSection(section);
  }, []);

  return (
    <div className="py-[45px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, email preferences, and notifications.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <SettingsSidebar
          active={activeSection}
          onChange={handleSectionChange}
        />

        <div className="flex-1 min-w-0 space-y-6">
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "emails" && <EmailsSection />}
          {activeSection === "notifications" && <NotificationsSection />}
          {activeSection === "subscription" && <SubscriptionSection />}
          {activeSection === "sessions" && <SessionsSection />}
          {activeSection === "danger-zone" && <DangerZone />}
        </div>
      </div>
    </div>
  );
}
