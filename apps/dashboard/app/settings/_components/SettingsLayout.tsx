"use client";

import { useState } from "react";
import { SettingsSidebar, SettingsSection } from "./SettingsSidebar";
import { ProfileSection } from "./ProfileSection";
import { EmailsSection } from "./EmailsSection";
import { NotificationsSection } from "./NotificationsSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { SessionsSection } from "./SessionsSection";
import { DangerZone } from "./DangerZone";

export function SettingsLayout() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  return (
    <div className="py-[45px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, email preferences, and notifications.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <SettingsSidebar active={activeSection} onChange={setActiveSection} />

        <div className="flex-1 min-w-0 space-y-6">
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "emails" && <EmailsSection />}
          {activeSection === "notifications" && <NotificationsSection />}
          {activeSection === "subscription" && <SubscriptionSection />}
          {activeSection === "sessions" && <SessionsSection />}

          <DangerZone />
        </div>
      </div>
    </div>
  );
}
