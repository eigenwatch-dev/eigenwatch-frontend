# Frontend Implementation Plan: Enhanced Operator Dashboard

## Executive Summary

This plan addresses frontend issues in the operator dashboard and aligns with the backend API enhancements. The key goals:

1. **Fix chart visibility** - Lines and text blending into dark background
2. **Extend chart timeframe** - From 30 days to 6 months
3. **Fix broken tabs** - AVS (commented out), Allocations (meaningless metrics)
4. **Add educational tooltips** - Help users understand EigenLayer concepts
5. **Show insights, not just data** - Risk indicators, utilization status, trend analysis

---

## Current State Analysis

### Issues Identified

| Component | Issue | Severity |
|-----------|-------|----------|
| **OverviewTab Charts** | Uses `hsl(var(--primary))` which is white (#FFFFFF) in dark mode - invisible on dark background | Critical |
| **OverviewTab Charts** | Hardcoded to 30 days | Medium |
| **AVSTab** | Completely commented out in OperatorProfile.tsx | Critical |
| **AllocationsTab** | Shows meaningless `total_encumbered_magnitude` (summing ratios) | Critical |
| **AllocationsTab** | Table columns don't match data structure | High |
| **Multiple Tabs** | Console.log debug statements left in code | Low |
| **InfoTooltip** | Hardcoded color `#9F9FA9` instead of CSS variable | Low |
| **ReuseableTable** | `bg-gray-50` breaks dark theme on mobile | Medium |
| **All Tabs** | No educational tooltips explaining EigenLayer concepts | Medium |

### Chart Color Problem

```typescript
// Current (OverviewTab.tsx line 169)
colors={["hsl(var(--primary))"]}  // --primary: #FFFFFF in dark mode = INVISIBLE

// Should use
colors={["hsl(var(--chart-1))"]}  // --chart-1: #3B82F6 (blue) in dark mode = VISIBLE
```

---

## Implementation Plan

### Phase 1: Critical Fixes (Immediate)

#### 1.1 Fix Chart Colors

**Files to modify:**
- [apps/dashboard/app/operator/_components/tabs/OverviewTab.tsx](apps/dashboard/app/operator/_components/tabs/OverviewTab.tsx)

**Changes:**
```typescript
// TVS Chart (line 169) - Change from:
colors={["hsl(var(--primary))"]}
// To:
colors={["hsl(var(--chart-1))"]}  // Blue - visible in dark mode

// Delegators Chart (line 196) - Already correct:
colors={["hsl(var(--chart-2))"]}  // Green

// AVS Chart (line 215) - Already correct:
colors={["hsl(var(--chart-3))"]}  // Orange
```

#### 1.2 Extend Chart Timeframe to 6 Months

**Files to modify:**
- [apps/dashboard/app/operator/_components/tabs/OverviewTab.tsx](apps/dashboard/app/operator/_components/tabs/OverviewTab.tsx)

**Changes:**
```typescript
// Line 35-38 - Change from:
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);

// To:
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 6);  // 6 months instead of 30 days

// Update section heading (line 159):
// From: "Total Value Secured - Last 30 Days"
// To:   "Total Value Secured - 6 Month Trend"
```

**Also add time range selector (optional enhancement):**
```typescript
const TIME_RANGES = [
  { label: '30D', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];
```

#### 1.3 Re-enable AVS Tab

**Files to modify:**
- [apps/dashboard/app/operator/_components/OperatorProfile.tsx](apps/dashboard/app/operator/_components/OperatorProfile.tsx)

**Changes:**
```typescript
// Uncomment line 357:
<TabsTrigger value="avs">AVS</TabsTrigger>

// Uncomment lines 372-375:
<TabsContent value="avs">
  <AVSTab operatorId={operator.operator_id} />
</TabsContent>
```

#### 1.4 Remove Debug Console.logs

**Files to modify:**
- [OperatorProfile.tsx](apps/dashboard/app/operator/_components/OperatorProfile.tsx) - Line 135
- [AVSTab.tsx](apps/dashboard/app/operator/_components/tabs/AVSTab.tsx) - Line 26
- [AllocationsTab.tsx](apps/dashboard/app/operator/_components/tabs/AllocationsTab.tsx) - Line 28
- [CommissionTab.tsx](apps/dashboard/app/operator/_components/tabs/CommissionTab.tsx) - Lines 44-48

---

### Phase 2: Allocations Tab Redesign

#### 2.1 New Allocations Tab Structure

**Current Problems:**
1. Shows `total_encumbered_magnitude` - meaningless sum of ratios
2. Table columns don't match `by_avs` data structure
3. No USD values or utilization metrics

**New Design:**

```tsx
// AllocationsTab.tsx - Complete redesign

interface AllocationsSummary {
  total_allocated_usd: string;
  total_tvs_usd: string;
  overall_utilization_pct: string;
  total_avs_count: number;
  total_operator_set_count: number;
}

export const AllocationsTab = ({ operatorId }: AllocationsTabProps) => {
  const { data, isLoading } = useAllocationsOverview(operatorId);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Allocated"
          value={formatUSD(data?.summary?.total_allocated_usd)}
          tooltip="Total USD value allocated to secure AVS networks"
        />
        <StatCard
          title="Utilization"
          value={`${data?.summary?.overall_utilization_pct || 0}%`}
          subtitle={<UtilizationBadge pct={data?.summary?.overall_utilization_pct} />}
          tooltip="Percentage of operator's capacity currently allocated to AVSs"
        />
        <StatCard
          title="Active AVSs"
          value={data?.summary?.total_avs_count || 0}
          tooltip="Number of AVS networks this operator secures"
        />
        <StatCard
          title="Operator Sets"
          value={data?.summary?.total_operator_set_count || 0}
          tooltip="Distinct operator sets the operator participates in"
        />
      </div>

      {/* Strategy Utilization */}
      <SectionContainer
        heading="Strategy Utilization"
        info="Shows how much of each strategy's capacity is allocated to AVSs"
      >
        <StrategyUtilizationTable data={data?.by_strategy} />
      </SectionContainer>

      {/* AVS Allocations */}
      <SectionContainer
        heading="Allocations by AVS"
        info="Breakdown of allocated value per AVS network"
      >
        <AVSAllocationsTable data={data?.by_avs} />
      </SectionContainer>

      {/* Risk Indicators */}
      <RiskIndicators metrics={data?.risk_metrics} />
    </div>
  );
};
```

#### 2.2 New Components to Create

**File: `apps/dashboard/components/shared/data/UtilizationBadge.tsx`**
```tsx
interface UtilizationBadgeProps {
  pct: string | number;
}

export function UtilizationBadge({ pct }: UtilizationBadgeProps) {
  const value = parseFloat(String(pct)) || 0;

  const getStatus = () => {
    if (value < 50) return { label: 'Low', color: 'text-green-500 bg-green-500/10' };
    if (value < 70) return { label: 'Moderate', color: 'text-yellow-500 bg-yellow-500/10' };
    if (value < 90) return { label: 'High', color: 'text-orange-500 bg-orange-500/10' };
    return { label: 'Critical', color: 'text-red-500 bg-red-500/10' };
  };

  const status = getStatus();
  return (
    <Badge variant="outline" className={status.color}>
      {status.label} Utilization
    </Badge>
  );
}
```

**File: `apps/dashboard/components/shared/data/RiskIndicators.tsx`**
```tsx
interface RiskIndicatorsProps {
  metrics?: {
    avs_concentration_hhi: number;
    strategy_concentration_hhi: number;
    highest_single_avs_exposure_pct: string;
    utilization_risk_level: 'low' | 'moderate' | 'high';
  };
}

export function RiskIndicators({ metrics }: RiskIndicatorsProps) {
  if (!metrics) return null;

  // HHI: 0-10000, >2500 = concentrated, >5000 = highly concentrated
  const getConcentrationStatus = (hhi: number) => {
    if (hhi < 1500) return { label: 'Diversified', color: 'green' };
    if (hhi < 2500) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Concentrated', color: 'red' };
  };

  return (
    <SectionContainer
      heading="Risk Indicators"
      info="Concentration metrics help assess diversification risk"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="AVS Concentration"
          value={getConcentrationStatus(metrics.avs_concentration_hhi).label}
          subtitle={`HHI: ${metrics.avs_concentration_hhi}`}
          tooltip="Herfindahl-Hirschman Index measures concentration. Lower = more diversified."
        />
        <MetricCard
          title="Strategy Concentration"
          value={getConcentrationStatus(metrics.strategy_concentration_hhi).label}
          subtitle={`HHI: ${metrics.strategy_concentration_hhi}`}
          tooltip="Measures how concentrated allocations are across strategies."
        />
        <MetricCard
          title="Largest AVS Exposure"
          value={`${metrics.highest_single_avs_exposure_pct}%`}
          tooltip="Percentage of total allocations going to the single largest AVS."
        />
      </div>
    </SectionContainer>
  );
}
```

---

### Phase 3: Educational Tooltips System

#### 3.1 Create Tooltip Content Library

**File: `apps/dashboard/lib/educational-content.ts`**
```typescript
export const EDUCATIONAL_TOOLTIPS = {
  // Core Concepts
  tvs: {
    short: "Total Value Secured - the total USD value of assets delegated to this operator",
    detailed: "TVS represents the economic security this operator provides. Higher TVS means more 'skin in the game' for the operator and their delegators."
  },

  allocation: {
    short: "Amount of stake committed to secure a specific AVS",
    detailed: "When an operator allocates to an AVS, they commit a portion of their stake to secure that network. If the operator misbehaves, this stake can be slashed."
  },

  magnitude: {
    short: "Ratio of allocated stake relative to total capacity",
    detailed: "Magnitude is a ratio (0-100%) showing what portion of the operator's capacity for a strategy is allocated. It's NOT a USD value - don't sum magnitudes across strategies."
  },

  utilization: {
    short: "Percentage of operator capacity currently allocated",
    detailed: "Higher utilization means the operator is actively securing more networks. Very high utilization (>90%) may limit ability to take on new AVS work."
  },

  commission: {
    short: "Percentage of rewards the operator keeps",
    detailed: "Operators charge a commission on rewards earned by delegators. A 10% commission means for every $100 in rewards, $10 goes to the operator."
  },

  piCommission: {
    short: "Protocol-wide (PI) commission applied across all AVSs",
    detailed: "This is the operator's default commission rate. It applies to all AVS unless overridden by an AVS-specific or Operator Set-specific rate."
  },

  avs: {
    short: "Actively Validated Service - a network secured by EigenLayer operators",
    detailed: "AVSs are protocols that leverage EigenLayer's restaking security. Operators register with AVSs to provide validation services and earn rewards."
  },

  operatorSet: {
    short: "A specific configuration of operators within an AVS",
    detailed: "AVSs can organize operators into sets with different requirements, permissions, or reward structures."
  },

  slashing: {
    short: "Penalty for operator misbehavior",
    detailed: "If an operator acts maliciously or fails to meet AVS requirements, a portion of their delegated stake can be 'slashed' (forfeited)."
  },

  // Risk Metrics
  hhi: {
    short: "Herfindahl-Hirschman Index - measures concentration",
    detailed: "HHI ranges from 0-10,000. Below 1,500 = diversified. 1,500-2,500 = moderate concentration. Above 2,500 = highly concentrated."
  },

  riskScore: {
    short: "Overall risk assessment combining multiple factors",
    detailed: "Risk score considers slashing history, TVS stability, AVS diversity, and operational track record."
  },

  delegationVolatility: {
    short: "How stable the operator's delegations are",
    detailed: "High volatility means frequent large changes in delegated stake, which could indicate instability or concentrated delegator base."
  }
};
```

#### 3.2 Enhanced InfoTooltip Component

**File: `apps/dashboard/components/shared/data/InfoTooltip.tsx`** (Enhance existing)
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, HelpCircle } from "lucide-react";

interface InfoTooltipProps {
  info: string;
  detailed?: string;
  variant?: 'info' | 'help';
  size?: 'sm' | 'md';
}

export function InfoTooltip({
  info,
  detailed,
  variant = 'info',
  size = 'sm'
}: InfoTooltipProps) {
  const Icon = variant === 'help' ? HelpCircle : Info;
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="inline-flex items-center">
          <Icon className={`${sizeClass} text-muted-foreground cursor-help hover:text-foreground transition-colors`} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top">
          <p className="text-sm font-medium">{info}</p>
          {detailed && (
            <p className="text-xs text-muted-foreground mt-1">{detailed}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

#### 3.3 Add Tooltips to Key Metrics

**Example in StatCard usage:**
```tsx
<StatCard
  title="Total Value Secured"
  value={formatUSD(operator.tvs_usd)}
  tooltip={EDUCATIONAL_TOOLTIPS.tvs.short}
  icon={<TrendingUp />}
/>
```

**Example in Section Headers:**
```tsx
<SectionContainer
  heading="Allocations by AVS"
  info={EDUCATIONAL_TOOLTIPS.allocation.detailed}
>
```

---

### Phase 4: AVS Tab Redesign

#### 4.1 Update AVS Tab Component

**File: `apps/dashboard/app/operator/_components/tabs/AVSTab.tsx`**
```tsx
export const AVSTab = ({ operatorId }: AVSTabProps) => {
  const { data: avsData, isLoading } = useOperatorAVS(operatorId);
  const avsList = avsData?.avs_relationships || [];

  // Calculate metrics
  const activeCount = avsList.filter(a => a.status === 'registered').length;
  const totalAllocatedUsd = avsList.reduce(
    (sum, avs) => sum + parseFloat(avs.total_allocated_usd || '0'),
    0
  );
  const avgCommission = avsList.length > 0
    ? avsList.reduce((s, a) => s + (a.effective_commission_bips || 0), 0) / avsList.length / 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total AVSs"
          value={avsList.length}
          tooltip={EDUCATIONAL_TOOLTIPS.avs.short}
          icon={<Shield />}
        />
        <StatCard
          title="Active Registrations"
          value={activeCount}
          subtitle={`${((activeCount / avsList.length) * 100).toFixed(0)}% active`}
          icon={<CheckCircle2 />}
        />
        <StatCard
          title="Total Allocated"
          value={formatUSD(totalAllocatedUsd)}
          tooltip="Total USD value allocated across all AVSs"
        />
        <StatCard
          title="Avg Commission"
          value={`${avgCommission.toFixed(2)}%`}
          tooltip="Average commission rate across all AVS registrations"
        />
      </div>

      {/* AVS List with enhanced columns */}
      <SectionContainer
        heading="AVS Relationships"
        info="List of all AVSs this operator is registered with"
      >
        <ReusableTable
          columns={[
            {
              key: "avs_name",
              displayName: "AVS",
              render: (row) => (
                <div className="flex items-center gap-2">
                  {row.avs_logo && <img src={row.avs_logo} className="w-6 h-6 rounded" />}
                  <span>{row.avs_name}</span>
                </div>
              )
            },
            {
              key: "status",
              displayName: "Status",
              render: (row) => (
                <Badge variant={row.status === 'registered' ? 'default' : 'secondary'}>
                  {row.status}
                </Badge>
              )
            },
            { key: "total_allocated_usd", displayName: "Allocated (USD)" },
            { key: "operator_set_count", displayName: "Operator Sets" },
            { key: "effective_commission_pct", displayName: "Commission" },
            { key: "days_registered", displayName: "Days Active" },
          ]}
          data={avsList}
          tableFilters={{ title: "AVS Relationships" }}
        />
      </SectionContainer>
    </div>
  );
};
```

---

### Phase 5: Commission Tab Enhancements

#### 5.1 Add Commission Impact Analysis

**Enhance CommissionTab to show impact:**
```tsx
// Add to CommissionTab.tsx after existing content

{/* Commission Impact Analysis */}
{commission?.impact_analysis && (
  <SectionContainer
    heading="Commission Impact Analysis"
    info="Understanding how commissions affect your returns"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Weighted Avg Commission"
        value={formatCommission(commission.impact_analysis.weighted_average_commission_bips)}
        subtitle="Based on allocation values"
        tooltip="Commission weighted by how much is allocated to each AVS"
      />
      <StatCard
        title="vs Network Average"
        value={
          <Badge variant={commission.impact_analysis.vs_network_average === 'lower' ? 'success' : 'secondary'}>
            {commission.impact_analysis.vs_network_average}
          </Badge>
        }
        subtitle={`${commission.impact_analysis.percentile_rank}th percentile`}
      />
      <StatCard
        title="Est. Annual Cost"
        value={`$${calculateAnnualCost(stakedAmount, commission.impact_analysis.weighted_average_commission_bips)}`}
        subtitle="On estimated 5% APY"
        tooltip="Approximate commission cost based on current rates and average APY"
      />
    </div>
  </SectionContainer>
)}
```

---

### Phase 6: UI Fixes & Polish

#### 6.1 Fix Hardcoded Colors

**File: `apps/dashboard/components/shared/data/InfoTooltip.tsx`**
```typescript
// Change from:
<Info className="h-3 w-3 text-[#9F9FA9] cursor-help" />
// To:
<Info className="h-3 w-3 text-muted-foreground cursor-help" />
```

**File: `apps/dashboard/components/shared/table/ReuseableTable.tsx`**
- Replace `bg-gray-50` with `bg-muted` for dark theme compatibility
- Replace hardcoded hex colors with CSS variable equivalents

#### 6.2 Improve Chart Readability

**Add gridline visibility:**
```tsx
// In AreaChart.tsx and LineChart.tsx
<CartesianGrid
  strokeDasharray="3 3"
  stroke="hsl(var(--border))"  // More visible
  strokeOpacity={0.3}
  vertical={false}
/>
```

**Add better axis formatting:**
```tsx
<YAxis
  tick={{ fill: "hsl(var(--foreground))", opacity: 0.7 }}  // More visible
  tickFormatter={(value) => formatCompact(value)}  // e.g., "1.2M"
/>
```

---

## File Changes Summary

### Files to Modify

| File | Changes |
|------|---------|
| `OverviewTab.tsx` | Fix chart color, extend to 6 months, add time selector |
| `OperatorProfile.tsx` | Uncomment AVS tab, remove console.log |
| `AllocationsTab.tsx` | Complete redesign with USD metrics |
| `AVSTab.tsx` | Fix table columns, add USD values, remove console.log |
| `CommissionTab.tsx` | Add impact analysis, remove console.log |
| `InfoTooltip.tsx` | Fix hardcoded color, add variants |
| `ReuseableTable.tsx` | Fix dark theme colors |
| `AreaChart.tsx` | Improve gridline visibility |
| `LineChart.tsx` | Improve gridline visibility |
| `globals.css` | No changes needed |

### New Files to Create

| File | Purpose |
|------|---------|
| `lib/educational-content.ts` | Tooltip content library |
| `components/shared/data/UtilizationBadge.tsx` | Utilization status indicator |
| `components/shared/data/RiskIndicators.tsx` | Risk metrics display |
| `components/shared/data/ConcentrationMeter.tsx` | HHI visualization |
| `components/shared/data/TrendIndicator.tsx` | Up/down trend arrows |

---

## Implementation Order

### Sprint 1: Critical Fixes (1-2 days)
1. Fix chart colors in OverviewTab
2. Extend chart timeframe to 6 months
3. Uncomment AVS tab
4. Remove all console.log statements
5. Fix InfoTooltip hardcoded color

### Sprint 2: Allocations Redesign (2-3 days)
1. Create UtilizationBadge component
2. Create RiskIndicators component
3. Redesign AllocationsTab with new structure
4. Update hooks to match backend response

### Sprint 3: Educational Tooltips (1-2 days)
1. Create educational-content.ts
2. Enhance InfoTooltip component
3. Add tooltips to all StatCards
4. Add tooltips to section headers

### Sprint 4: AVS & Commission Enhancements (1-2 days)
1. Update AVS Tab table columns
2. Add commission impact analysis
3. Fix ReuseableTable dark theme colors

### Sprint 5: Polish & Testing (1 day)
1. Test all tabs end-to-end
2. Verify chart visibility
3. Responsive testing
4. Performance check

---

## Dependencies on Backend

This frontend plan depends on the backend providing:

1. **Allocations Overview** - `summary`, `by_strategy`, `by_avs`, `risk_metrics`
2. **Commission Impact** - `impact_analysis` with weighted averages
3. **AVS Relationships** - `total_allocated_usd`, `effective_commission_bips`

If backend isn't ready, frontend can:
- Use placeholder/mock data
- Show "Coming Soon" for missing sections
- Gracefully handle null/undefined values

---

## Success Criteria

- [ ] Charts visible with proper contrast in dark mode
- [ ] Charts show 6 months of data
- [ ] All tabs functional (no commented code)
- [ ] No console.log statements in production code
- [ ] Educational tooltips on all key metrics
- [ ] USD values shown for all monetary amounts
- [ ] Utilization percentages with status badges
- [ ] Risk indicators with HHI context
- [ ] No hardcoded colors (all use CSS variables)
- [ ] Mobile responsive on all tabs
