"use client";

import { useState, useEffect } from "react";
import { getSessions, revokeSession, revokeAllSessions } from "@/lib/auth-api";
import { UserSession } from "@/types/auth.types";
import { Monitor, Loader2, X } from "lucide-react";

function parseUserAgent(ua?: string): string {
  if (!ua) return "Unknown device";
  const parts: string[] = [];
  if (ua.includes("Chrome") && !ua.includes("Edg")) parts.push("Chrome");
  else if (ua.includes("Firefox")) parts.push("Firefox");
  else if (ua.includes("Safari") && !ua.includes("Chrome"))
    parts.push("Safari");
  else if (ua.includes("Edg")) parts.push("Edge");
  else parts.push("Browser");

  if (ua.includes("Windows")) parts.push("Windows");
  else if (ua.includes("Mac OS")) parts.push("macOS");
  else if (ua.includes("Linux")) parts.push("Linux");
  else if (ua.includes("Android")) parts.push("Android");
  else if (ua.includes("iPhone") || ua.includes("iPad")) parts.push("iOS");

  return parts.join(" \u00B7 ");
}

function maskIp(ip?: string): string {
  if (!ip) return "—";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  return ip.replace(/:[\da-f]+:[\da-f]+$/i, ":x:x");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionsSection() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // Silently fail
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      await revokeAllSessions();
      setSessions((prev) => prev.filter((s) => s.is_current));
    } catch {
      // Silently fail
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Active Sessions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your active sessions across devices.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          <div className="rounded-md border border-border divide-y divide-border">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {session.is_current && (
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      )}
                      <span className="text-sm text-foreground">
                        {session.is_current
                          ? "Current Session"
                          : parseUserAgent(session.user_agent)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {session.is_current && (
                        <span>{parseUserAgent(session.user_agent)}</span>
                      )}
                      <span>
                        Last active: {timeAgo(session.last_active_at)}
                      </span>
                      <span>IP: {maskIp(session.ip_address)}</span>
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => handleRevoke(session.id)}
                    disabled={revokingId === session.id}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {otherSessions.length > 0 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="inline-flex items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {revokingAll ? "Revoking..." : "Revoke All Other Sessions"}
          </button>
        )}
      </div>
    </div>
  );
}
