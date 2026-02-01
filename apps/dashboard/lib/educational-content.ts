/**
 * Educational tooltip content for EigenLayer concepts
 * Used throughout the dashboard to help users understand complex metrics
 */

export const EDUCATIONAL_TOOLTIPS = {
  // Core Concepts
  tvs: {
    short: "Total Value Secured - the total USD value of assets delegated to this operator",
    detailed: "TVS represents the economic security this operator provides. Higher TVS indicates more trust from stakers and greater capacity to secure AVS networks."
  },

  allocation: {
    short: "Amount of stake committed to secure a specific AVS",
    detailed: "When an operator allocates to an AVS, they commit a portion of their stake to secure that network. If the operator misbehaves, this allocated stake can be slashed."
  },

  magnitude: {
    short: "Ratio of allocated stake relative to total capacity",
    detailed: "Magnitude is a ratio (0-100%) showing what portion of the operator's capacity for a strategy is allocated. It's NOT a USD value - magnitudes should not be summed across strategies."
  },

  utilization: {
    short: "Percentage of operator capacity currently allocated",
    detailed: "Higher utilization means the operator is actively securing more networks. Very high utilization (>90%) may limit ability to take on new AVS commitments."
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
    detailed: "AVSs can organize operators into sets with different requirements, permissions, or reward structures. An operator may participate in multiple sets."
  },

  slashing: {
    short: "Penalty for operator misbehavior",
    detailed: "If an operator acts maliciously or fails to meet AVS requirements, a portion of their delegated stake can be 'slashed' (forfeited). This protects network security."
  },

  strategy: {
    short: "A specific asset type that can be restaked",
    detailed: "Strategies represent different LST tokens (like stETH, rETH) or native ETH that operators accept for restaking. Each strategy has its own exchange rate."
  },

  // Risk Metrics
  hhi: {
    short: "Herfindahl-Hirschman Index - measures concentration",
    detailed: "HHI ranges from 0-10,000. Below 1,500 = diversified. 1,500-2,500 = moderate concentration. Above 2,500 = highly concentrated. Lower is generally safer."
  },

  riskScore: {
    short: "Overall risk assessment combining multiple factors",
    detailed: "Risk score considers slashing history, TVS stability, AVS diversity, and operational track record. Lower scores indicate lower risk."
  },

  delegationVolatility: {
    short: "How stable the operator's delegations are",
    detailed: "High volatility means frequent large changes in delegated stake, which could indicate instability or a concentrated delegator base."
  },

  confidenceScore: {
    short: "Reliability of the risk assessment",
    detailed: "Higher confidence means more data points were available to calculate the risk score. New operators may have lower confidence scores."
  },

  // Allocation Specific
  allocatedUsd: {
    short: "USD value of stake committed to AVS networks",
    detailed: "This is the meaningful dollar value allocated. Unlike raw magnitudes, USD values can be summed to show total allocation."
  },

  availableCapacity: {
    short: "Remaining capacity available for new allocations",
    detailed: "The difference between total TVS and allocated value. Represents how much more the operator could allocate to new AVS networks."
  },

  // Status Indicators
  utilizationLow: {
    short: "Less than 50% of capacity utilized",
    detailed: "The operator has significant available capacity for new AVS commitments. This could indicate room for growth or lower demand."
  },

  utilizationModerate: {
    short: "50-70% of capacity utilized",
    detailed: "A balanced utilization level. The operator is actively engaged but still has capacity for additional commitments."
  },

  utilizationHigh: {
    short: "70-90% of capacity utilized",
    detailed: "Most capacity is committed. Limited room for new allocations. Consider monitoring for any capacity constraints."
  },

  utilizationCritical: {
    short: "Over 90% of capacity utilized",
    detailed: "Nearly all capacity is committed. Very limited flexibility for new allocations. May need to increase stake or reduce commitments."
  },

  // Commission Tiers
  commissionLow: {
    short: "Below network median",
    detailed: "This operator charges less than most others. Lower fees mean more rewards for delegators."
  },

  commissionCompetitive: {
    short: "Around network median",
    detailed: "Commission rate is typical for the network. A balance between operator revenue and delegator returns."
  },

  commissionHigh: {
    short: "Above network median",
    detailed: "Higher than average commission. May be justified by performance, reputation, or specialized services."
  },

  // Delegator Specific
  delegatorExposure: {
    short: "Value at risk if slashing occurs",
    detailed: "Based on how allocations are distributed, this shows how much of a delegator's stake could be affected by slashing events."
  },

  shareOfOperator: {
    short: "Percentage of operator's total TVS",
    detailed: "Shows how significant this delegator is to the operator. Larger shares may have more influence but also more concentration risk."
  }
};

/**
 * Helper to get tooltip content by key
 */
export function getTooltip(key: keyof typeof EDUCATIONAL_TOOLTIPS): { short: string; detailed: string } {
  return EDUCATIONAL_TOOLTIPS[key];
}

/**
 * Get just the short description
 */
export function getShortTooltip(key: keyof typeof EDUCATIONAL_TOOLTIPS): string {
  return EDUCATIONAL_TOOLTIPS[key].short;
}
