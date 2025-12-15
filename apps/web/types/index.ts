export interface Operator {
  id: string;
  name: string;
  icon: string;
  riskLevel: "Low" | "Medium" | "High";
  totalStake: string;
  performanceScore: string;
  delegatorCount: string;
  operationalDays: string;
  isActive: boolean;
}
