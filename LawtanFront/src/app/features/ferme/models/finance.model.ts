// Synthèse financière : uniquement des montants calculés en base par le backend.
// Aucun poste n'est estimé côté client ; un poste sans donnée vaut 0.

export interface CostLine {
  label: string;
  source: string;        // Table d'origine, pour l'audit
  amountFcfa: number;
  percentage: number;
}

export interface FinanceMonthPoint {
  label: string;         // ex: "Avr"
  month: string;         // ISO yyyy-MM
  revenueFcfa: number;
  chargesFcfa: number;
}

export interface FinanceSummary {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalRevenueFcfa: number;
  totalCollectedFcfa: number;
  totalChargesFcfa: number;
  netProfitFcfa: number;
  netMarginPercentage: number;
  milkLitersProduced: number;
  costPerLiterFcfa: number;
  invoicesCount: number;
  costBreakdown: CostLine[];
  monthlySeries: FinanceMonthPoint[];
}
