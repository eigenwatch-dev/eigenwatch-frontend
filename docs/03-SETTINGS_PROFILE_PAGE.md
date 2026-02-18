# Frontend Settings & Profile Page

**Version:** 1.0
**Scope:** Dashboard app — `/settings` route with profile, email management, preferences, and session management
**Depends on:** Backend docs `02-AUTHENTICATION_SYSTEM.md`, `03-PRO_FREE_GATING.md`
**Reference:** The Graph's settings page (email management, notification preferences)

---

## Overview

The `/settings` page is where authenticated users manage their profile, email addresses, notification preferences, and subscription. It is only accessible to authenticated users — unauthenticated visitors are redirected to connect their wallet.

---

## Route & Access Control

**Route:** `/settings`
**File:** `apps/dashboard/app/settings/page.tsx`

**Access:** Requires authentication. If user is not authenticated:
- Redirect to home page with a toast: "Connect your wallet to access settings"
- Or show a centered card: "Connect your wallet to manage your settings" with a "Connect Wallet" button

---

## Page Layout

Sidebar navigation on the left, content area on the right. On mobile, sidebar collapses to a top tab bar.

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  Profile     │  [Active section content]                     │
│  Emails      │                                               │
│  Notifications│                                              │
│  Subscription │                                              │
│  Sessions    │                                               │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│  Danger Zone                                                  │
│  Delete Account                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Sections

### 1. Profile Section

**Purpose:** Display wallet identity and basic profile info.

```
┌─────────────────────────────────────────────────────────────┐
│  Profile                                                     │
│                                                              │
│  Wallet Address                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  0x1234567890abcdef1234567890abcdef12345678  📋     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Display Name (optional)                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  My Operator Name                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Member Since                                                │
│  January 15, 2026                                            │
│                                                              │
│  Account Tier                                                │
│  ┌──────────────────────────┐                               │
│  │  🟢 Free Plan            │  [Upgrade to Pro →]           │
│  └──────────────────────────┘                               │
│                                                              │
│  [Save Changes]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Fields:**
- **Wallet Address:** Read-only, with copy button. Full address displayed (not truncated).
- **Display Name:** Optional, editable. Stored in user DB. Used nowhere currently but future-proofing for social features.
- **Member Since:** Read-only. Formatted date from `user.created_at`.
- **Account Tier:** Badge showing current tier + upgrade CTA for free users.

---

### 2. Emails Section

**Purpose:** Manage email addresses — add, verify, remove, set primary.

This is the most important section. Users who skipped email during onboarding land here from nudge banners.

```
┌─────────────────────────────────────────────────────────────┐
│  Email Addresses                                             │
│                                                              │
│  Manage your email addresses for notifications and alerts.   │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  user@example.com          ✅ Verified    ⭐ Primary  ✕ ││
│  ├─────────────────────────────────────────────────────────┤│
│  │  backup@example.com        ⏳ Unverified  [Verify]   ✕ ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  new@email.com                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  [Add Email]                                                 │
│                                                              │
│  ── OR if no emails at all ──                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📧  No email addresses added                           ││
│  │                                                          ││
│  │  Add an email to receive risk alerts, watchlist          ││
│  │  notifications, and important account updates.           ││
│  │                                                          ││
│  │  ┌───────────────────────────────────────┐              ││
│  │  │  your@email.com                       │              ││
│  │  └───────────────────────────────────────┘              ││
│  │  [Add Email Address]                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Behaviors:**
- **Add email:** Input + button. On submit → POST `/auth/email/add` → shows verification code input inline
- **Verify email:** "Verify" button next to unverified emails → sends new code → inline 6-digit input
- **Remove email:** ✕ button with confirmation dialog ("Are you sure? This email will no longer receive notifications.")
- **Set primary:** Click star icon on a verified email to make it primary. Primary email receives all notifications.
- **Limit:** Max 3 email addresses per account
- **Inline verification:** After adding an email, the row expands to show a 6-digit code input, same as onboarding flow

---

### 3. Notifications Section

**Purpose:** Control what notifications are sent and where.

```
┌─────────────────────────────────────────────────────────────┐
│  Notification Preferences                                    │
│                                                              │
│  Choose what you'd like to be notified about.                │
│                                                              │
│  Risk Alerts                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Operator risk level changes              [Toggle: ON]  ││
│  │  Slashing events detected                 [Toggle: ON]  ││
│  │  Significant TVS changes (>10%)           [Toggle: OFF] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Watchlist                                            PRO    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Daily watchlist summary                  [Toggle: OFF] ││
│  │  Watchlist operator status changes        [Toggle: OFF] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Product Updates                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  New features and product announcements   [Toggle: ON]  ││
│  │  EigenWatch newsletter                    [Toggle: OFF] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ⚠️ Email required for notifications.                        │
│     Add an email in the Emails section above.                │
│                                                              │
│  [Save Preferences]                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Behaviors:**
- Toggle switches (shadcn `Switch` component)
- Watchlist notifications are pro-only — show `<ProBadge />` and disable toggles for free users
- If no verified email, show warning and disable all toggles
- Save via PUT `/user/preferences`
- Notification categories match what the backend supports

---

### 4. Subscription Section

**Purpose:** Show current plan and upgrade path.

```
┌─────────────────────────────────────────────────────────────┐
│  Subscription                                                │
│                                                              │
│  Current Plan                                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  Free Plan                                               ││
│  │                                                          ││
│  │  • View operator summaries and aggregates                ││
│  │  • Basic risk level indicators                           ││
│  │  • Public data access                                    ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  Pro Plan                                      $XX/mo   ││
│  │                                                          ││
│  │  ✓ Full risk analysis & scores                           ││
│  │  ✓ Detailed strategy & allocation tables                 ││
│  │  ✓ Delegator intelligence                                ││
│  │  ✓ Commission behavior history                           ││
│  │  ✓ Operator comparison tools                             ││
│  │  ✓ Watchlist with alerts                                 ││
│  │  ✓ Priority API access                                   ││
│  │                                                          ││
│  │  [Upgrade to Pro]                                        ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  For Enterprise plans, contact sales@eigenwatch.xyz          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Note:** The actual payment/upgrade flow is out of scope for this document. The "Upgrade to Pro" button will initially link to a contact form or Stripe checkout page (TBD). For now, it can open a "Coming Soon" modal or link to a typeform/waitlist.

---

### 5. Sessions Section

**Purpose:** View and manage active sessions.

```
┌─────────────────────────────────────────────────────────────┐
│  Active Sessions                                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🟢 Current Session                                      ││
│  │  Chrome · macOS · Last active: Now                       ││
│  │  IP: 192.168.x.x                                        ││
│  ├─────────────────────────────────────────────────────────┤│
│  │  Firefox · Windows · Last active: 2 days ago             ││
│  │  IP: 10.0.x.x                              [Revoke]     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [Revoke All Other Sessions]                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Behaviors:**
- List sessions from GET `/user/sessions`
- Current session marked with green dot, cannot be revoked individually
- "Revoke" button on other sessions → DELETE `/user/sessions/:id`
- "Revoke All" → DELETE `/user/sessions` (all except current)
- Show user-agent parsed info (browser + OS)
- Show masked IP address for privacy

---

### 6. Danger Zone

At the bottom of the settings page, outside the section navigation:

```
┌─────────────────────────────────────────────────────────────┐
│  Danger Zone                                                 │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Delete Account                                              │
│  Permanently delete your account and all associated data.    │
│  This action cannot be undone.                               │
│                                                              │
│  [Delete Account]  (red/destructive button)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Confirmation dialog: "Type DELETE to confirm"
- On confirm → DELETE `/user/account` → logout → redirect to home

---

## Routing to Settings

### NavBar Integration

Add "Settings" to the user dropdown menu (see `02-AUTH_ONBOARDING_FLOW.md` UserMenu component):

```
┌──────────────────────┐
│  0x1234...abcd ▾     │
├──────────────────────┤
│  Free Plan           │
│  ──────────────────  │
│  ⚙ Settings         │
│  🔌 Disconnect       │
└──────────────────────┘
```

### Direct Links from Nudge Banners

The email nudge banner "Add Email" button links to `/settings` (scrolled to emails section) or opens the auth modal's email step.

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `SettingsPage` | `app/settings/page.tsx` | Server component, auth check |
| `SettingsLayout` | `app/settings/_components/SettingsLayout.tsx` | Sidebar + content layout |
| `ProfileSection` | `app/settings/_components/ProfileSection.tsx` | Wallet info, display name, tier |
| `EmailsSection` | `app/settings/_components/EmailsSection.tsx` | Email CRUD with inline verification |
| `NotificationsSection` | `app/settings/_components/NotificationsSection.tsx` | Toggle preferences |
| `SubscriptionSection` | `app/settings/_components/SubscriptionSection.tsx` | Plan display + upgrade CTA |
| `SessionsSection` | `app/settings/_components/SessionsSection.tsx` | Active sessions list |
| `DangerZone` | `app/settings/_components/DangerZone.tsx` | Account deletion |
| `SettingsSidebar` | `app/settings/_components/SettingsSidebar.tsx` | Section navigation |

---

## API Endpoints Used

| Endpoint | Method | Section |
|----------|--------|---------|
| `/auth/me` | GET | Profile (load user data) |
| `/user/profile` | PUT | Profile (update display name) |
| `/auth/email/add` | POST | Emails (add new email) |
| `/auth/email/verify` | POST | Emails (verify with code) |
| `/auth/email/remove` | DELETE | Emails (remove email) |
| `/auth/email/set-primary` | PUT | Emails (set primary email) |
| `/user/preferences` | GET/PUT | Notifications |
| `/user/sessions` | GET/DELETE | Sessions |
| `/user/account` | DELETE | Danger Zone |

---

## Implementation Phases

### Phase 1: Route & Layout
1. Create `/settings` route with auth guard
2. Create settings layout with sidebar navigation
3. Create Profile section (read-only initially, then editable)

### Phase 2: Email Management
4. Create Emails section with add/verify/remove functionality
5. Integrate inline 6-digit verification
6. Wire to backend email endpoints

### Phase 3: Notifications & Subscription
7. Create Notifications section with toggle switches
8. Create Subscription section with plan comparison
9. Pro-gate watchlist notification toggles

### Phase 4: Sessions & Danger Zone
10. Create Sessions section
11. Create Danger Zone with confirmation dialog
12. Wire revoke/delete endpoints

---

## File Changes Summary

| File | Change |
|------|--------|
| `app/settings/page.tsx` | **New** — settings page with auth guard |
| `app/settings/_components/SettingsLayout.tsx` | **New** — sidebar + content layout |
| `app/settings/_components/ProfileSection.tsx` | **New** — profile info |
| `app/settings/_components/EmailsSection.tsx` | **New** — email management |
| `app/settings/_components/NotificationsSection.tsx` | **New** — notification prefs |
| `app/settings/_components/SubscriptionSection.tsx` | **New** — plan display |
| `app/settings/_components/SessionsSection.tsx` | **New** — session management |
| `app/settings/_components/DangerZone.tsx` | **New** — account deletion |
| `app/settings/_components/SettingsSidebar.tsx` | **New** — section nav |
| `components/auth/UserMenu.tsx` | Add Settings link to dropdown |
| NavBar config | Add `/settings` to dashboard nav links |
