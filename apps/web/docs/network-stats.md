# EigenWatch Landing Page — Audit & Recommendations

This document consolidates all feedback and analysis on the current landing page, covering messaging, data strategy, and component design.

---

## 🔴 Issue 1: Stats Are Selling EigenLayer, Not EigenWatch

**Where:** [Hero](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/web/components/landing/hero.tsx) (lines 19–64) and [CTA](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/web/components/landing/cta.tsx) (lines 48–61)

### Current (❌ Selling EigenLayer)

| Stat                   | Framing                         | Subject    |
| ---------------------- | ------------------------------- | ---------- |
| Total Operators: 1,247 | "Look how big the network is"   | EigenLayer |
| TVL: 2.4M ETH          | "Look how much money is locked" | EigenLayer |
| Active AVS: 156        | "Look how many services exist"  | EigenLayer |
| Avg Risk Score: 28%    | "The network is safe"           | EigenLayer |

### Recommended (✅ Selling EigenWatch)

| Stat                         | Reframed                             | Subject                       |
| ---------------------------- | ------------------------------------ | ----------------------------- |
| **Operators Analyzed**       | "1,247 Operators Analyzed"           | EigenWatch's coverage         |
| **Assets Tracked**           | "Tracking $5.8B in Delegated Assets" | EigenWatch as the watchdog    |
| **Risk Scores Computed**     | "2.8M+ Risk Assessments Run"         | EigenWatch's analytical depth |
| **Slashing Events Detected** | "X Slashing Events Caught"           | EigenWatch's security value   |

> [!IMPORTANT]
> The subject of every stat should be **EigenWatch**, not **EigenLayer**. The CTA section (lines 48–61) repeats the same EigenLayer stats and needs the same treatment.

### Data Sources

All of these can be derived from existing `network_daily_aggregates` fields: `total_operators`, `total_tvs`, `total_slashing_incidents`, and the row count of `operator_analytics`.

---

## 🔴 Issue 2: Operator Discovery Uses Fake Data in a Table

**Where:** [operator-discovery.tsx](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/web/components/landing/operator-discovery.tsx)

### Current Problem

- Hardcoded dummy operators ("Eigen Yields", "StakeWise", "Lido Finance", "Rocket Pool") with fake data
- Presented as a functional table — misleading and undermines trust
- Doesn't showcase the actual product

### Recommended Approach

Replace the dummy table with a **polished screenshot or image of the real dashboard**, wrapped in product-selling context:

#### Option A: Annotated Product Screenshot (Recommended)

- Take a high-quality screenshot of the real [OperatorList](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/dashboard/app/operator/_components/OperatorList.tsx) or [OperatorProfile](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/dashboard/app/operator/_components/OperatorProfile.tsx)
- Wrap it in a browser frame / device mockup component
- Add subtle float animation (parallax or gentle bob)
- Surround with callout annotations: "Risk Scoring", "7 Analysis Tabs", "Pro Insights"

#### Option B: Animated Product Walkthrough

- A short looping animation (CSS or Lottie) showing tab switches on the operator profile
- Conveys depth of the product without fake data
- More engaging than a static image

#### Option C: Live Preview with Real Data (Advanced)

- Fetch a small subset of real operators from the public API
- Display a read-only mini-view (not a full interactive table)
- Links to the dashboard for the full experience

### Section Copy Update

Change heading from "Your Delegated Operators" → something like:

- **"Deep-Dive Into Any Operator"**
- **"See What EigenWatch Reveals"**
- **"Operator Intelligence at Your Fingertips"**

---

## ✅ What's Working Well

| Section                                                                                                         | Assessment                                                                                    |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [Tools](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/web/components/landing/tools.tsx)       | ✅ Correctly sells EigenWatch features (Risk Assessment, Performance Analytics, Alerts, etc.) |
| [Sponsors](file:///home/didi/Code/work/eigenwatch/eigenwatch-frontend/apps/web/components/landing/sponsors.tsx) | ✅ Appropriate placement                                                                      |
| Overall visual design                                                                                           | ✅ Dark theme, spotlight cards, animations are premium                                        |

---

## � Summary of Changes Needed

| Priority  | Section                    | Change                                                        |
| --------- | -------------------------- | ------------------------------------------------------------- |
| 🔴 High   | Hero Stats                 | Reframe from EigenLayer metrics → EigenWatch activity metrics |
| 🔴 High   | CTA Stats                  | Same reframing as Hero                                        |
| 🔴 High   | Operator Discovery         | Replace dummy table with product screenshot + animation       |
| 🟡 Medium | Hero Stats                 | Make stats dynamic (fetch from API) instead of hardcoded      |
| 🟢 Low    | Operator Discovery heading | Update copy to sell EigenWatch's insights                     |
