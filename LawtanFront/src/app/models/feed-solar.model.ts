export interface FeedStock {
  id?: number;
  name: string;
  category: 'FORAGE_GREEN' | 'FORAGE_DRY' | 'CONCENTRATE' | 'MINERALS_VITAMINS' | string;
  currentStockKg: number;
  alertThresholdKg: number;
  unitPricePerKgFcfa?: number;
  supplierName?: string;
  storageLocation?: string;
  notes?: string;
  isLowStock?: boolean;
}

export interface FeedRationIngredient {
  feedStockId: number;
  feedStockName: string;
  quantityKg: number;
  dryMatterPercentage: number;
  calculatedDryMatterKg?: number;
  unitPriceFcfa?: number;
  calculatedCostFcfa?: number;
}

export interface FeedRation {
  id?: number;
  rationName: string;
  targetCategory: string;
  targetBreeds?: string[];
  targetAnimalIds?: string[];
  ingredients?: FeedRationIngredient[];
  totalFreshWeightKg?: number;
  dailyDryMatterKg: number;
  compositionDescription: string;
  dailyCostFcfa: number;
  energyUfl?: number;
  proteinPdiGrams?: number;
  createdDate?: string;
}

export interface FeedDistribution {
  id?: number;
  rationId?: number;
  rationName: string;
  distributionDate: string;
  distributionTime: string;
  session: 'MATIN' | 'MIDI' | 'SOIR' | string;
  quantityDistributedKg: number;
  animalsCountNourished: number;
  targetGroupOrRace: string;
  specificAnimalIds?: string[];
  distributorName: string;
  totalCostFcfa: number;
  notes?: string;
}

export interface SolarTelemetry {
  id?: number;
  timestamp?: string;
  currentSolarPowerKw: number;
  batterySocPercent: number;
  dailySolarYieldKwh: number;
  totalSolarYieldMwh: number;
  gridStatus: 'SOLAR_OPTIMAL' | 'BATTERY_BACKUP' | 'GENERATOR_STANDBY' | string;
  coldRoomTempCelsius: number;
  secondColdRoomTempCelsius: number;
  waterPumpFlowM3h: number;
  waterTankLevelPercent: number;
  co2SavedKg: number;
}
