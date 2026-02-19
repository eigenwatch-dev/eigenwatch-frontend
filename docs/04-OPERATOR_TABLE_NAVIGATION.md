# Operator Table Navigation & UX Improvements

**Version:** 1.0
**Scope:** Dashboard app — operator list table, navigation to operator detail pages, perceived performance
**Depends on:** Backend docs `04-DASHBOARD_OPTIMIZATION.md`

---

## Problem Statement

When a user clicks an operator row in the operator list table, they experience a significant delay before seeing the operator detail page. This happens because:

1. **Next.js compiles the `[operator_id]` page on first visit** (dev mode). Even in production, the dynamic route requires server-side rendering.
2. **The row click uses `router.push()`** which triggers a full client-side navigation with no visual feedback during the transition.
3. **The operator detail page SSR fetches two API calls** (`getOperator` + `getOperatorStats`) before rendering anything.
4. **There is no loading indicator** between clicking a row and seeing the new page.

The result: user clicks a row → nothing happens for 1-3 seconds → page suddenly appears. This feels broken.

---

## Solution: Three Complementary Approaches

### Approach A: Make Operator Names Clickable Links (Primary)

**The single most impactful change.** Replace the invisible `onRowClick` handler with visible `<Link>` elements on the operator name. This gives users:

1. **Visual affordance** — underlined names tell users "this is clickable"
2. **Browser-native link behavior** — middle-click to open in new tab, right-click for context menu, hover shows URL in status bar
3. **Next.js prefetching** — `<Link>` components automatically prefetch the destination page on hover (in production), so by the time the user clicks, the page is often already loaded
4. **Instant navigation feel** — Next.js Link transitions are faster than `router.push()` because of prefetching

**Current code** (`OperatorList.tsx`):
```typescript
// Row click handler — invisible, no visual cue
onRowClick: (row) => {
  router.push(`/operator/${row.operator_id}`);
}
```

**New code:**
```typescript
// In the operator column cell renderer:
operator: (
  <div className="flex gap-[12px]">
    <Avatar className="w-[32px] h-[32px] rounded-[10px]">
      <AvatarImage src={operator?.metadata?.logo} alt={...} />
      <AvatarFallback className="w-[32px] h-[32px] rounded-[10px] bg-blue-800/10">
        {(operator.metadata?.name || "Anonymous Op").charAt(0)}
      </AvatarFallback>
    </Avatar>
    <div className="flex my-auto">
      <Link
        href={`/operator/${operator.operator_id}`}
        className="text-foreground hover:text-blue-400 hover:underline transition-colors"
      >
        {operator.metadata?.name || "Anonymous Op"}
      </Link>
    </div>
  </div>
),
```

**Additional changes:**
- Keep `onRowClick` on the table row as well (clicking anywhere on the row still navigates) — but the Link provides the primary interaction
- The Link gives Next.js the chance to prefetch the page bundle and data on hover
- Cursor should be `pointer` on the entire row (already is via `onRowClick`)

---

### Approach B: Instant Navigation with Loading State

Even with Link prefetching, the SSR data fetch can still cause a delay. Show an immediate loading state so the user knows navigation is happening.

#### Option B1: Route-Level Loading (Recommended)

**File:** `apps/dashboard/app/operator/[operator_id]/loading.tsx`

Next.js automatically shows this component while the page's server component is loading. This is the **built-in solution** for exactly this problem.

```typescript
// apps/dashboard/app/operator/[operator_id]/loading.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperatorLoading() {
  return (
    <div className="min-h-screen py-[45px] space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
```

**How it works:**
- User clicks operator → Next.js immediately shows `loading.tsx` (the skeleton) while the server component fetches data
- Once data is ready → the real `page.tsx` renders and replaces the skeleton
- Transition feels instant because the skeleton appears within milliseconds of clicking

**This is the highest-impact, lowest-effort change.** It already works with the existing architecture.

#### Option B2: NProgress / Top Loading Bar (Supplementary)

Add a thin progress bar at the top of the page during navigation. This is a common pattern (GitHub, YouTube, etc.).

**Implementation:** Use Next.js `useRouter` events or the `next-nprogress-bar` package.

```
npm install next-nprogress-bar
```

**File:** `apps/dashboard/app/layout.tsx`

```typescript
import { AppProgressBar } from 'next-nprogress-bar';

// In layout:
<AppProgressBar
  height="2px"
  color="#3B82F6"
  options={{ showSpinner: false }}
/>
```

This provides immediate visual feedback that something is happening, even before the loading skeleton appears.

---

### Approach C: Prefetch Operator Data on Hover

Prefetch the operator detail data when users hover over a row, so by the time they click, the SSR data is already cached.

**File:** `apps/dashboard/app/operator/_components/OperatorList.tsx`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { getOperator, getOperatorStats } from '@/actions/operators';
import { QUERY_KEYS } from '@/lib/queryKey';

// Inside OperatorList component:
const queryClient = useQueryClient();

const handleRowHover = (operatorId: string) => {
  // Prefetch operator detail data
  queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.operator(operatorId),
    queryFn: () => getOperator(operatorId),
    staleTime: 60_000,
  });
  queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.operatorStats(operatorId),
    queryFn: () => getOperatorStats(operatorId),
    staleTime: 60_000,
  });
};
```

Then on each table row:
```typescript
<tr
  onMouseEnter={() => handleRowHover(operator.operator_id)}
  onClick={() => router.push(`/operator/${operator.operator_id}`)}
>
```

**Note:** This prefetches React Query cache. For SSR pages, this cache isn't directly used by the server component. However, if the client component hydrates with `initialData` from React Query, it can still help avoid a second fetch. The main benefit here is for the client-side data fetching that happens after the page loads.

For true SSR prefetching, the `<Link>` component's built-in prefetch (Approach A) is more effective since it prefetches the entire page (HTML + data).

---

## Table Interaction Design

### Visual Affordances

The current table has no visual indication that rows are interactive. Improve this:

1. **Operator name as a link** (blue on hover, underlined) — primary click target
2. **Row hover effect** — subtle background highlight on hover:
   ```css
   hover:bg-muted/50 transition-colors cursor-pointer
   ```
3. **Row active/press effect** — slightly darker on mousedown:
   ```css
   active:bg-muted/70
   ```

### Mobile Considerations

On mobile, there is no hover state. Ensure:
- The entire row is tappable (keep `onRowClick`)
- The operator name still has link styling (blue/underlined) to indicate it's the primary action
- Tap feedback: use `active:bg-muted/50` for press state

---

## Reusable Table Changes

**File:** `apps/dashboard/components/shared/table/ReuseableTable.tsx`

The reusable table component needs to support:

1. **Row hover/active states** — if `onRowClick` is provided, add hover/active CSS classes
2. **`onRowHover` callback** — for prefetching on hover
3. **Row `<Link>` wrapping** — optionally wrap the first column cell in a `<Link>`

```typescript
interface TableConfig {
  columns: TableColumnConfig[];
  data: Record<string, any>[];
  onRowClick?: (row: any) => void;
  onRowHover?: (row: any) => void;  // New
  rowHref?: (row: any) => string;   // New — if provided, first column becomes a Link
  // ... existing props
}
```

---

## Implementation Priority

These changes are ordered by impact-to-effort ratio:

| Priority | Change | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Add `loading.tsx` for operator detail page | Eliminates perceived "nothing happening" delay | ~15 min |
| 2 | Make operator names `<Link>` elements | Prefetching + visual affordance + native link behavior | ~30 min |
| 3 | Add top progress bar (NProgress) | Global feedback for all navigations | ~15 min |
| 4 | Add row hover/active styles | Visual polish | ~15 min |
| 5 | Prefetch on row hover | Data ready before click | ~30 min |

**Start with #1 and #2 — they solve 90% of the perceived delay problem.**

---

## Implementation Phases

### Phase 1: Instant Feedback (Do First)
1. Create `apps/dashboard/app/operator/[operator_id]/loading.tsx` with skeleton layout
2. Add NProgress top loading bar to the app layout

### Phase 2: Link Navigation
3. Replace operator name `<span>` with `<Link>` in OperatorList
4. Add hover/underline styling to operator name links
5. Keep `onRowClick` as a fallback for clicking anywhere on the row

### Phase 3: Table Polish
6. Add row hover state (`hover:bg-muted/50`) to ReusableTable when `onRowClick` is set
7. Add row active state (`active:bg-muted/70`)
8. Add `onRowHover` support to ReusableTable

### Phase 4: Prefetching
9. Prefetch operator data on row hover
10. Test that Link prefetching works in production builds

---

## File Changes Summary

| File | Change |
|------|--------|
| `app/operator/[operator_id]/loading.tsx` | **New** — skeleton loading state for operator detail |
| `app/operator/_components/OperatorList.tsx` | Operator name → `<Link>`, add hover prefetch |
| `components/shared/table/ReuseableTable.tsx` | Add row hover/active styles, `onRowHover` prop |
| `app/layout.tsx` | Add NProgress bar component |
| `package.json` | Add `next-nprogress-bar` dependency |

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Time to visual feedback on click | 1-3 seconds | < 100ms (skeleton appears) |
| Time to full page render | 2-4 seconds | Same (SSR unchanged), but feels instant |
| User knows navigation is happening | No (nothing visible) | Yes (skeleton + progress bar) |
| Link discoverability | None (invisible click handler) | Visible (underlined name + cursor) |
| Browser link features (new tab, etc.) | Not available | Available |
