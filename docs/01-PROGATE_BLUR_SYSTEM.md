# Frontend Pro/Free Tier Gating System

**Version:** 1.0
**Scope:** Dashboard app — Operator profile tabs, operator list table, and all future gated surfaces
**Depends on:** Backend docs `03-PRO_FREE_GATING.md`, `06-API_ACCESS_TOKENS.md`

---

## Overview

This document defines exactly how the frontend enforces Pro vs Free visibility across every surface of the dashboard. The core UX pattern is **blur-with-upgrade-prompt**: free users see the shape of data (blurred) so they know it exists, and on hover/click they get a clear upgrade CTA.

---

## Core UX Principles

1. **Blur, don't hide.** Free users should see that data exists behind a paywall. Removing content entirely makes the product feel empty. Blurring it creates desire.
2. **Hover reveals intent.** On desktop, hovering over blurred content shows a tooltip/popover with "Upgrade to Pro" messaging. On mobile, tapping does the same.
3. **No fake data.** Blurred content should render real placeholder structures (skeleton-like shapes or the actual component with dummy/zero data), never fabricated numbers that could mislead.
4. **Gating is client-side display logic.** The backend already filters responses by tier (see `tier_context` in API responses). The frontend uses this context to decide what to blur.
5. **Risk Score in the operator list table is always blurred for free users.** It is never sent from the backend for free users — the frontend renders a placeholder and blurs it.

---

## Auth & Tier State

### Tier Source of Truth

The user's tier comes from the JWT token claims (decoded client-side) or from the `/auth/me` endpoint response. Store in a Zustand auth store:

```
apps/dashboard/hooks/store/useAuthStore.ts
```

```typescript
interface AuthState {
  user: User | null;
  tier: 'anonymous' | 'free' | 'pro' | 'enterprise';
  isAuthenticated: boolean;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}
```

### Tier Checking Hook

```
apps/dashboard/hooks/useProAccess.ts
```

```typescript
export function useProAccess() {
  const { tier, isAuthenticated } = useAuthStore();

  return {
    isPro: tier === 'pro' || tier === 'enterprise',
    isFree: tier === 'free' || tier === 'anonymous' || !isAuthenticated,
    tier,
    isAuthenticated,
  };
}
```

Every component that needs gating calls `useProAccess()` and passes `isFree` as the `isLocked` prop to `ProGate`.

---

## Component Architecture

### 1. `ProGate` — Section-Level Blur (Already Exists, Needs Enhancement)

**File:** `apps/dashboard/components/shared/ProGate.tsx`

**Current behavior:** Blurs children and shows a centered `ProUpgradeCard` overlay.

**Enhancements needed:**

- Add hover-triggered popover variant for inline/cell-level gating
- Add `variant` prop: `"overlay"` (current behavior) | `"inline"` (for table cells)
- Add `blurIntensity` prop: `"light"` | `"medium"` | `"heavy"` — maps to `blur-[2px]`, `blur-sm`, `blur-md`
- Connect "Upgrade to Pro" button to actual upgrade flow (initially links to a `/pricing` or `/upgrade` page)

```typescript
interface ProGateProps {
  children: React.ReactNode;
  isLocked: boolean;
  feature: string;
  description?: string;
  variant?: 'overlay' | 'inline';
  blurIntensity?: 'light' | 'medium' | 'heavy';
}
```

### 2. `ProGateCell` — Table Cell-Level Blur (New Component)

**File:** `apps/dashboard/components/shared/ProGateCell.tsx`

For individual table cells (e.g., Risk Score column in the operator list). This is a lightweight inline blur with hover popover.

```typescript
interface ProGateCellProps {
  children: React.ReactNode;
  isLocked: boolean;
  feature: string;
  description?: string;
}
```

**Behavior:**
- Renders children with `blur-sm` and `pointer-events-none`
- On hover (desktop) or tap (mobile), shows a small popover/tooltip:
  - Lock icon + "Pro Feature"
  - One-line description
  - "Upgrade" link button
- Uses Radix `HoverCard` or `Tooltip` from shadcn for the popover
- Popover appears above/below the cell, not as a full overlay

### 3. `ProUpgradeCard` — Upgrade CTA (Already Exists, Keep As-Is)

Used inside `ProGate` overlay variant. No changes needed except wiring the "Upgrade to Pro" button to the upgrade flow.

### 4. `ProBadge` — Label Component (Already Exists)

Purple "PRO" badge shown next to feature names in tabs or headings to signal what requires Pro. No changes needed.

---

## Operator List Table Gating

**File:** `apps/dashboard/app/operator/_components/OperatorList.tsx`

### What Gets Gated

| Column | Free | Pro |
|--------|------|-----|
| Operator (name + avatar) | Visible | Visible |
| Risk Level (badge) | Visible | Visible |
| Risk Score (numeric) | **Blurred** | Visible |
| Active AVS | Visible | Visible |
| Delegator Count | Visible | Visible |
| Operational Days | Visible | Visible |

### Implementation

The Risk Score column is **not returned by the backend** for free/anonymous users. The frontend should:

1. Always render the Risk Score column
2. For free users, render a placeholder value (e.g., `"--"` or `"0.00"`) and wrap it in `<ProGateCell>`
3. For pro users, render the actual `risk_score` value

```typescript
// In the columns data mapping:
risk_score: isPro ? (
  <span className="font-mono text-sm">{operator.risk_score}</span>
) : (
  <ProGateCell
    isLocked={true}
    feature="Risk Score"
    description="Unlock numeric risk scores to compare operators quantitatively."
  >
    <span className="font-mono text-sm">0.00</span>
  </ProGateCell>
),
```

### Row Click Behavior

Row click navigation to `/operator/{id}` remains unchanged for all users. Free users can view operator profiles — the gating happens at the tab/section level within the profile.

---

## Operator Profile Tab Gating

**File:** `apps/dashboard/app/operator/_components/OperatorProfile.tsx`

Each tab has a mix of free and pro content. The approach: render the full tab component, and within each tab, wrap pro-only sections in `<ProGate>`.

### Per-Tab Breakdown

#### Overview Tab — Mostly Free
| Section | Free | Pro |
|---------|------|-----|
| Performance Overview scores (Risk, Performance, Economic, Network, Confidence) | **Blurred** — these are EigenWatch judgment | Visible |
| Recent Activity timeline | Visible | Visible |
| TVS trend chart | Visible | Visible |
| Delegators growth chart | Visible | Visible |
| AVS Registrations chart | Visible | Visible |

#### Strategies Tab — Free Shape, Pro Detail
| Section | Free | Pro |
|---------|------|-----|
| Total Strategies count | Visible | Visible |
| Combined TVS | Visible | Visible |
| Dominant Asset headline | Visible | Visible |
| TVS Distribution chart (pie/bar) | Visible (no hover tooltips with %) | Visible (full tooltips) |
| Strategy Table (name, USD, %, delegators) | **Blurred** — entire table | Visible |

**Implementation:** Wrap the strategy table in `<ProGate variant="overlay">`. The chart renders for all users but tooltip data is suppressed for free users (pass a `showTooltips={isPro}` prop to the chart component).

#### AVS Tab — Free Counts, Pro Relationships
| Section | Free | Pro |
|---------|------|-----|
| Total AVSs count | Visible | Visible |
| Active/Inactive registration counts | Visible | Visible |
| Total Allocated (single number) | Visible | Visible |
| Average Commission (headline) | Visible | Visible |
| AVS Relationships table | **Blurred** | Visible |
| Total Operator Sets box | **Blurred** | Visible |

#### Delegators Tab — Free Aggregate, Pro List
| Section | Free | Pro |
|---------|------|-----|
| Total Delegators count | Visible | Visible |
| Active Delegators count | Visible | Visible |
| Delegation HHI badge (Low/Medium/High) | Visible | Visible |
| Delegator List table | **Blurred** | Visible |
| Pagination & search | Hidden (no point showing) | Visible |

#### Allocations Tab — Free Status, Pro Distribution
| Section | Free | Pro |
|---------|------|-----|
| Total Allocated | Visible | Visible |
| Utilization % (Low/Medium/High badge) | Visible | Visible |
| Active AVSs count | Visible | Visible |
| Operator Sets count | Visible | Visible |
| Strategy Utilization progress bars | **Blurred** | Visible |
| Allocations by AVS table | **Blurred** | Visible |
| Risk Indicators | **Blurred** | Visible |

#### Commission Tab — Free Price, Pro Behavior
| Section | Free | Pro |
|---------|------|-----|
| Current Commission rate | Visible | Visible |
| Network Median | Visible | Visible |
| Positioning badge (Cheap/Average/Expensive) | Visible | Visible |
| Estimated Annual Cost | **Blurred** | Visible |
| Commission Comparison chart | **Blurred** | Visible |
| Per-AVS Commissions table | **Blurred** | Visible |

#### Risk Analysis Tab — Entirely Pro
| Section | Free | Pro |
|---------|------|-----|
| Everything | **Blurred** — entire tab content | Visible |

**Implementation:** The entire `<RiskAnalysisTab>` output is wrapped in a single `<ProGate>` at the tab level. Show a compelling upgrade card explaining this is EigenWatch's core intelligence.

### Tab Header ProBadge

Add `<ProBadge />` next to tab trigger labels for tabs that are fully or mostly gated:

```tsx
<TabsTrigger value="risk">
  Risk Analysis <ProBadge />
</TabsTrigger>
```

Apply `<ProBadge />` to: **Risk Analysis** (fully gated). Other tabs have mixed content so no badge on the tab trigger — the gating is visible within the tab content.

---

## Risk & Commission Bar (Profile Header)

**File:** `apps/dashboard/app/operator/_components/OperatorProfile.tsx`

The Risk Assessment section in the profile header shows a risk badge and score. For free users:

- **Risk Level badge** (HIGH/MEDIUM/LOW): Visible — this is a status indicator
- **Risk Score numeric value**: **Blurred** with `ProGateCell` — this is judgment

```tsx
<RiskBadge
  level={riskData?.risk_level || "MEDIUM"}
  score={
    isPro
      ? (riskData?.scores.risk.toString() || "---")
      : undefined  // RiskBadge shows "---" when no score, we blur it
  }
/>
```

Or wrap just the score portion in `<ProGateCell>`.

---

## Handling `tier_context` from API Responses

The backend returns a `tier_context` object in gated responses indicating what fields are restricted:

```json
{
  "data": { ... },
  "tier_context": {
    "tier": "free",
    "gated_fields": ["strategy_table", "delegator_list", "risk_scores"],
    "upgrade_prompt": "Upgrade to Pro for full strategy analysis"
  }
}
```

The frontend should:

1. Check `tier_context.gated_fields` to know what to blur (in addition to client-side tier checks)
2. Use `tier_context.upgrade_prompt` as the description in `ProGate` components when available
3. Fall back to client-side tier checks when `tier_context` is not present (e.g., for data not fetched from API)

---

## Implementation Phases

### Phase 1: Foundation
1. Create `useAuthStore` with tier state
2. Create `useProAccess` hook
3. Enhance `ProGate` with `variant` and `blurIntensity` props
4. Create `ProGateCell` component for inline table cell gating

### Phase 2: Operator List
5. Add Risk Score blur in operator list table
6. Wire `useProAccess` to determine gating

### Phase 3: Operator Profile Tabs
7. Add `ProGate` wrappers to each tab per the breakdown above
8. Add `ProBadge` to Risk Analysis tab trigger
9. Gate the Risk Score in the profile header bar

### Phase 4: Chart Tooltip Suppression
10. Pass `showTooltips` prop to chart components
11. Suppress percentage/value tooltips on free-tier charts

### Phase 5: Upgrade Flow
12. Wire "Upgrade to Pro" buttons to upgrade page/flow
13. Add "Learn More" links to pricing/feature comparison page

---

## File Changes Summary

| File | Change |
|------|--------|
| `components/shared/ProGate.tsx` | Add `variant`, `blurIntensity` props |
| `components/shared/ProGateCell.tsx` | **New** — inline cell-level blur with hover popover |
| `hooks/store/useAuthStore.ts` | **New** — Zustand store for auth/tier state |
| `hooks/useProAccess.ts` | **New** — convenience hook for tier checks |
| `app/operator/_components/OperatorList.tsx` | Blur Risk Score column for free users |
| `app/operator/_components/OperatorProfile.tsx` | Add ProBadge to Risk tab, gate risk score in header |
| `app/operator/_components/tabs/OverviewTab.tsx` | Gate Performance Overview scores |
| `app/operator/_components/tabs/StrategiesTab.tsx` | Gate strategy table, suppress chart tooltips |
| `app/operator/_components/tabs/AVSTab.tsx` | Gate AVS relationships table |
| `app/operator/_components/tabs/DelegatorsTab.tsx` | Gate delegator list table |
| `app/operator/_components/tabs/AllocationsTab.tsx` | Gate utilization details, allocation table, risk indicators |
| `app/operator/_components/tabs/CommissionTab.tsx` | Gate annual cost, comparison chart, per-AVS table |
| `app/operator/_components/tabs/RiskAnalysisTab.tsx` | Gate entire tab content |
