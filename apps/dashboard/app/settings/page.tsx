"use client";

import useAuthStore from "@/hooks/store/useAuthStore";
import { SettingsLayout } from "./_components/SettingsLayout";

export default function SettingsPage() {
  const { isRestoring } = useAuthStore();

  if (isRestoring) {
    return (
      <div className="h-full min-h-[60vh] flex items-center justify-center py-[45px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <SettingsLayout />;
}
