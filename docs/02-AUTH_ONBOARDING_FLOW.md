# Frontend Authentication & Onboarding Flow

**Version:** 1.0
**Scope:** Dashboard app — wallet connection, SIWE sign-in, email collection, session management
**Depends on:** Backend docs `02-AUTHENTICATION_SYSTEM.md`, `06-API_ACCESS_TOKENS.md`
**Reference:** The Graph's auth flow (wallet connect → sign message → optional email)

---

## Overview

EigenWatch uses **wallet-first authentication**. The wallet address is the primary identifier. After connecting, users sign a SIWE (Sign-In with Ethereum) message to prove ownership, which generates a JWT session. Email collection is optional but nudged persistently.

---

## Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│                    UNAUTHENTICATED                       │
│  User browses freely. NavBar shows "Connect Wallet".    │
│  All data is free-tier. No gating applied yet.          │
└────────────────────┬────────────────────────────────────┘
                     │ Clicks "Connect Wallet"
                     ▼
┌─────────────────────────────────────────────────────────┐
│               STEP 1: WALLET CONNECTION                  │
│  AppKit modal opens (MetaMask, WalletConnect, etc.)     │
│  User selects wallet and connects.                      │
│  → We now have the wallet address (via wagmi hooks)     │
└────────────────────┬────────────────────────────────────┘
                     │ Wallet connected
                     ▼
┌─────────────────────────────────────────────────────────┐
│               STEP 2: SIWE SIGN MESSAGE                  │
│  Full-screen modal/dialog appears automatically.        │
│  Shows: "Sign in to EigenWatch"                         │
│  Explains: "Sign a message to verify wallet ownership"  │
│  Button: "Sign Message"                                 │
│  → Calls backend POST /auth/nonce to get SIWE message   │
│  → Wallet prompts user to sign                          │
│  → Sends signature to POST /auth/verify                 │
│  → Backend returns JWT access + refresh tokens          │
│  → Store access token in memory, refresh in httpOnly    │
└────────────────────┬────────────────────────────────────┘
                     │ Signed & verified
                     ▼
┌─────────────────────────────────────────────────────────┐
│           STEP 3: EMAIL COLLECTION (OPTIONAL)            │
│  Modal transitions to email collection step.            │
│  Shows: "Stay informed" / "Get alerts & updates"        │
│  Email input + checkboxes:                              │
│    ☐ Receive risk alerts for my watchlist                │
│    ☐ Receive EigenWatch product updates                  │
│  Buttons: "Continue" (submit) | "Skip for now"          │
│  If submitted → POST /auth/email/add                    │
│  → 6-digit verification code sent to email              │
└────────────────────┬─────────────┬──────────────────────┘
                     │ Submitted   │ Skipped
                     ▼             │
┌──────────────────────────────┐   │
│  STEP 3b: EMAIL VERIFICATION │   │
│  "Enter the 6-digit code"    │   │
│  Code input (6 boxes)        │   │
│  "Resend code" link          │   │
│  → POST /auth/email/verify   │   │
│  → Email marked verified     │   │
└──────────────┬───────────────┘   │
               │ Verified          │
               ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   AUTHENTICATED                          │
│  NavBar shows wallet avatar/address + dropdown.         │
│  Tier-based gating now active.                          │
│  If email was skipped → nudge banner appears.           │
└─────────────────────────────────────────────────────────┘
```

---

## Detailed Component Design

### Auth Modal — Multi-Step Dialog

**File:** `apps/dashboard/components/auth/AuthModal.tsx`

A single modal component that progresses through steps. Uses shadcn `Dialog` with internal step state.

```typescript
type AuthStep = 'sign' | 'email' | 'verify' | 'complete';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}
```

**Step transitions:**
- Modal opens automatically when wallet connects (detected via wagmi `useAccount` hook)
- `sign` → `email` on successful SIWE verification
- `email` → `verify` on email submission (or `complete` on skip)
- `verify` → `complete` on code verification
- `complete` → modal closes with brief success animation

**The modal should NOT be dismissible during the `sign` step** — if the user connected their wallet, they must sign or disconnect. The `email` step IS dismissible (skip allowed).

#### Step 1: Sign Message Screen

```
┌─────────────────────────────────────────┐
│                                         │
│        🔐 Sign in to EigenWatch         │
│                                         │
│   Verify your wallet ownership by       │
│   signing a message. This does not      │
│   cost any gas or make a transaction.   │
│                                         │
│   Connected: 0x1234...abcd              │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │        Sign Message             │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Use a different wallet                │
│                                         │
└─────────────────────────────────────────┘
```

- "Use a different wallet" disconnects and re-opens wallet selection
- Loading state on button while waiting for nonce + signature
- Error state if signature rejected: "Signature rejected. Please try again."

#### Step 2: Email Collection Screen

```
┌─────────────────────────────────────────┐
│                                         │
│        📧 Stay Informed                 │
│                                         │
│   Add your email to receive risk        │
│   alerts and important updates.         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ your@email.com                  │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ☐ Send me risk alerts for my          │
│     watchlist operators                 │
│   ☐ Send me EigenWatch product          │
│     updates and announcements           │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │          Continue               │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Skip for now                          │
│                                         │
└─────────────────────────────────────────┘
```

- Email input with validation (basic format check)
- Checkboxes are unchecked by default (opt-in, not opt-out)
- "Skip for now" is a text button, not prominent
- On "Continue" → POST email to backend, transition to verify step

#### Step 3: Email Verification Screen

```
┌─────────────────────────────────────────┐
│                                         │
│        ✉️ Verify Your Email             │
│                                         │
│   We sent a 6-digit code to            │
│   your@email.com                        │
│                                         │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│   │   │ │   │ │   │ │   │ │   │ │   │ │
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│                                         │
│   Didn't receive it? Resend code        │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │          Verify                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Skip for now                          │
│                                         │
└─────────────────────────────────────────┘
```

- 6 individual digit input boxes (auto-focus next on input)
- Auto-submit when all 6 digits entered
- "Resend code" with cooldown timer (60 seconds)
- "Skip for now" saves unverified email, can verify later in settings
- Error state: "Invalid code. Please try again." with shake animation

---

## Auth State Management

### Zustand Auth Store

**File:** `apps/dashboard/hooks/store/useAuthStore.ts`

```typescript
interface User {
  id: string;
  wallet_address: string;
  tier: 'free' | 'pro' | 'enterprise';
  email?: string;
  email_verified?: boolean;
  created_at: string;
}

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;  // true during SIWE flow
  tier: 'anonymous' | 'free' | 'pro' | 'enterprise';
  showAuthModal: boolean;
  authStep: 'sign' | 'email' | 'verify' | 'complete';

  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuthenticating: (val: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setAuthStep: (step: AuthState['authStep']) => void;
  logout: () => void;
}
```

### Token Management

- **Access token:** Stored in Zustand (memory only). 15-minute expiry. Attached to API requests via interceptor.
- **Refresh token:** Managed by backend as httpOnly cookie. Frontend calls `POST /auth/refresh` when access token expires.
- **Token refresh interceptor:** Add to the API client (axios/fetch wrapper) — on 401, attempt refresh, retry original request.

**File:** `apps/dashboard/lib/api.ts` (or wherever the API client lives)

```typescript
// Intercept 401 responses
// If 401 and not already refreshing:
//   1. Call POST /auth/refresh (cookie sent automatically)
//   2. On success: update access token in store, retry failed request
//   3. On failure: logout user, redirect to connect
```

### Silent Auth on App Load

**File:** `apps/dashboard/components/auth/AuthProvider.tsx`

Wraps the app. On mount:
1. Check if wallet is connected (wagmi `useAccount`)
2. If connected, attempt `POST /auth/refresh` to get new access token
3. If refresh succeeds → user is silently authenticated (no modal)
4. If refresh fails → user remains anonymous (wallet connected but not authenticated)

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    if (isConnected && address) {
      // Attempt silent refresh
      attemptSilentAuth();
    }
  }, [isConnected, address]);

  return <>{children}</>;
}
```

---

## Wallet Connection Integration

### Current Setup

The app already uses `@reown/appkit` with wagmi. The `<AppKitButton />` in the NavBar handles wallet connection UI.

### Changes Needed

1. **Listen for wallet connection events** to trigger SIWE flow:

```typescript
// In AuthProvider or a dedicated hook
const { address, isConnected } = useAccount();

useEffect(() => {
  if (isConnected && address && !isAuthenticated) {
    // Wallet just connected, check if we have a session
    const hasSession = await attemptSilentAuth();
    if (!hasSession) {
      // No existing session — open SIWE modal
      openAuthModal();
    }
  }
}, [isConnected, address]);
```

2. **Listen for wallet disconnection** to clear auth state:

```typescript
useEffect(() => {
  if (!isConnected) {
    logout();
  }
}, [isConnected]);
```

3. **"Use a different wallet"** in the sign step: calls wagmi's `disconnect()` then opens AppKit wallet selection.

---

## SIWE Implementation

### API Calls

```typescript
// apps/dashboard/actions/auth.ts (server actions) or lib/auth-api.ts (client-side)

// Step 1: Get nonce
async function getNonce(address: string): Promise<{ nonce: string; message: string }> {
  const res = await fetch(`${API_URL}/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ address }),
  });
  return res.json();
}

// Step 2: Verify signature
async function verifySignature(
  address: string,
  signature: string,
  message: string
): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ address, signature, message }),
    credentials: 'include', // for httpOnly refresh cookie
  });
  return res.json();
}

// Step 3: Refresh token
async function refreshToken(): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'X-API-Key': API_KEY },
    credentials: 'include',
  });
  return res.json();
}
```

### Signing with wagmi

```typescript
import { useSignMessage } from 'wagmi';

const { signMessageAsync } = useSignMessage();

async function handleSign() {
  const { message } = await getNonce(address);
  const signature = await signMessageAsync({ message });
  const { access_token, user } = await verifySignature(address, signature, message);
  setAccessToken(access_token);
  setUser(user);
  setAuthStep('email');
}
```

---

## Email Nudging System

If the user skips email collection, we need to periodically remind them.

### Nudge Banner

**File:** `apps/dashboard/components/auth/EmailNudgeBanner.tsx`

A dismissible banner that appears at the top of the page (below NavBar):

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📧 Add your email to receive risk alerts and updates.  [Add Email] │  ✕
└─────────────────────────────────────────────────────────────────────┘
```

**Display rules:**
- Show only for authenticated users without a verified email
- Dismissible (stores dismissal timestamp in localStorage)
- Re-appears after 7 days if still no email
- Does NOT show on first session (user just signed up, give them space)
- "Add Email" opens the email step of the auth modal (or navigates to `/settings`)

### Nudge in Settings

The `/settings` page prominently shows an "Add Email" section at the top if no email is set. See doc `03-SETTINGS_PROFILE_PAGE.md`.

---

## NavBar Auth State

### Current: `<AppKitButton />`

The AppKit button already handles connect/disconnect UI. After SIWE auth, we should enhance the connected state.

### Enhanced Connected State

Replace or wrap `<AppKitButton />` to show:

**Unauthenticated (no wallet):**
```
┌──────────────────┐
│  Connect Wallet   │
└──────────────────┘
```

**Wallet connected but not signed in (edge case — should auto-trigger SIWE):**
```
┌──────────────────┐
│    Sign In        │
└──────────────────┘
```

**Authenticated:**
```
┌──────────────────────┐
│  🟢 0x1234...abcd ▾  │
└──────────────────────┘
```

Dropdown menu on click:
- **Tier badge:** "Free Plan" or "Pro Plan"
- **Settings** → `/settings`
- **Disconnect** → logout + disconnect wallet

**File:** `packages/ui/src/NavBar.tsx` or `apps/dashboard/components/auth/UserMenu.tsx`

---

## Returning User Flow

```
User opens app
  → AuthProvider checks: wallet connected?
    → Yes: attempt POST /auth/refresh
      → Success: silently authenticated, load user data, apply tier
      → Fail (expired/invalid): show "Sign In" button, user must re-sign SIWE
    → No: show "Connect Wallet" button, fully anonymous
```

Key points:
- No modal on return if refresh succeeds — seamless experience
- If refresh fails but wallet is still connected, don't auto-open SIWE modal — let user click "Sign In" when ready
- Only auto-open SIWE modal on fresh wallet connections (first time connecting)

---

## Implementation Phases

### Phase 1: Auth Infrastructure
1. Create `useAuthStore` Zustand store
2. Create auth API functions (`getNonce`, `verifySignature`, `refreshToken`)
3. Create `AuthProvider` component with silent refresh on mount
4. Add token refresh interceptor to API client

### Phase 2: Auth Modal
5. Create `AuthModal` with sign, email, verify steps
6. Hook wallet connection events to trigger SIWE flow
7. Handle wallet disconnection → clear auth

### Phase 3: NavBar Integration
8. Create `UserMenu` dropdown component for authenticated state
9. Integrate with NavBar (replace/wrap AppKitButton when authenticated)

### Phase 4: Email Nudging
10. Create `EmailNudgeBanner` component
11. Add display logic with localStorage-based dismissal tracking

### Phase 5: Polish
12. Add loading/error states to all auth steps
13. Add toast notifications for auth events (signed in, signed out, email verified)
14. Handle edge cases (wallet switch mid-session, network switch, etc.)

---

## File Changes Summary

| File | Change |
|------|--------|
| `hooks/store/useAuthStore.ts` | **New** — auth & tier Zustand store |
| `lib/auth-api.ts` | **New** — auth API client functions |
| `components/auth/AuthProvider.tsx` | **New** — wraps app, handles silent auth |
| `components/auth/AuthModal.tsx` | **New** — multi-step auth dialog |
| `components/auth/SignStep.tsx` | **New** — SIWE signing step |
| `components/auth/EmailStep.tsx` | **New** — email collection step |
| `components/auth/VerifyStep.tsx` | **New** — 6-digit code verification step |
| `components/auth/UserMenu.tsx` | **New** — authenticated user dropdown |
| `components/auth/EmailNudgeBanner.tsx` | **New** — email reminder banner |
| `packages/ui/src/NavBar.tsx` | Modify to support authenticated state |
| `app/layout.tsx` | Wrap with `AuthProvider` |
| `lib/api.ts` | Add 401 interceptor for token refresh |
