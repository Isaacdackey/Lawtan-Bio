export type ProductType = 'CHEESE' | 'YOGURT' | 'CURDLED_MILK' | 'BUTTER' | 'CREAM' | 'PASTEURIZED_MILK'
  | 'RAW_MILK';

export type BatchStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Recipe {
  id?: number;
  code: string;
  name: string;
  productType: ProductType;
  targetUnit: string;
  milkLitersPerUnit: number;
  rawMaterialRequired?: 'RAW_MILK' | 'CURDLED_MILK'; // Lait Frais vs Lait Caillé (Sow)
  ingredientsList?: string;
  shelfLifeDays?: number;
  processInstructions?: string;
  emoji?: string;
  standardSellingPriceFcfa?: number;
}

export interface TransformationBatch {
  id?: number;
  batchNumber: string;
  recipeId: number;
  recipeName?: string;
  recipeCode?: string;
  productType?: ProductType;
  rawMaterialSource?: 'RAW_MILK' | 'CURDLED_MILK'; // Lait Frais vs Lait Caillé (Sow)
  emoji?: string;
  status: BatchStatus;
  productionDate: string;
  milkLitersConsumed: number;
  expectedQuantity: number;
  actualQuantityProduced?: number;
  unit: string;
  yieldEfficiencyPercentage?: number;
  wasteLossQuantity?: number;
  dlcExpiryDate?: string;
  operatorName?: string;
  qualityNotes?: string;
  phLevel?: number;
  fatPercentage?: number;
  sourceTank?: string;
}

export interface ProductStock {
  id?: number;
  recipeId?: number;
  recipeName?: string;
  productType?: ProductType;
  emoji?: string;
  batchId?: number;
  batchNumber?: string;
  productName: string;
  quantityAvailable: number;
  unit: string;
  unitPriceFcfa: number;
  totalValueFcfa: number;
  mfgDate?: string;
  dlcExpiryDate?: string;
  storageLocation?: string;
  isOrganicCertified?: boolean;
  daysRemainingDlc?: number;
}

export interface TransformationSummary {
  totalMilkTransformedLiters: number;
  averageYieldEfficiency: number;
  activeBatchesCount: number;
  totalBatchesCount: number;
  totalStockValueFcfa: number;
  productsInStockCount: number;
  dlcAlertsCount: number;
}
