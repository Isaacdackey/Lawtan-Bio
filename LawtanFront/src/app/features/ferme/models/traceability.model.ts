// Passeport de traçabilité d'un lot, reconstitué par le backend depuis les ordres
// de fabrication réels. Les champs non saisis en base restent nuls.

export interface TraceabilityLot {
  batchId: number;
  lotNumber: string;
  productName?: string;
  productType?: string;
  productionDate?: string;
  dlcExpiryDate?: string;
  milkLitersConsumed?: number;
  quantityProduced?: number;
  unit?: string;
  yieldEfficiencyPercentage?: number;
  wasteLossQuantity?: number;
  phLevel?: number;
  fatPercentage?: number;
  sourceTank?: string;
  operatorName?: string;
  qualityNotes?: string;
  status?: string;
  qualityStatus?: string;
  daysRemainingDlc?: number;
  organicCertified?: boolean;
}
