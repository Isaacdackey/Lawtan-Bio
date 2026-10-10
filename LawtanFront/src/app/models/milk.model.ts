import { Animal } from './animal.model';

export type MilkSessionType = 'MORNING' | 'EVENING';

export interface MilkProduction {
  id?: number;
  animalId?: number;
  animalInternalId: string;
  animalName?: string;
  animalBreed?: string;
  productionDate: string;
  session: MilkSessionType;
  sessionLabel?: string;
  volumeLiters: number;
  milkTemperature?: number;
  fatPercentage?: number;
  destinationTank?: string;
  isOrganicCompliant?: boolean;
}

export interface MilkStockAllocation {
  // Journee en cours
  collectedToday?: number;            // Traites enregistrees aujourd'hui
  directSaleAllocatedToday?: number;  // Ventile aujourd'hui vers la vente directe
  productionAllocatedToday?: number;  // Ventile aujourd'hui vers la transformation
  calvesAllocatedToday?: number;      // Ventile aujourd'hui vers les veaux

  // Soldes cumules : un stock non consomme reste disponible les jours suivants
  grossVolumeCollected: number;       // Total collecte depuis l'origine
  directSaleVolume: number;           // Total alloue a la vente directe
  directSaleConsumed: number;         // Total deja ecoule
  directSaleAvailable: number;        // Solde disponible a la vente
  productionVolume: number;           // Total alloue a la transformation
  productionConsumed: number;         // Total preleve par les ordres de fabrication
  productionAvailable: number;        // Solde disponible pour fabriquer
  calvesVolume: number;               // Total alloue aux veaux
  unallocatedVolume: number;          // Lait jamais ventile, report inclus
  milkInTank?: number;                // Lait physiquement encore en cuve

  allocationDate?: string;
  notes?: string;
}

export interface TankStatus {
  tankName: string;
  currentVolume: number;
  grossVolumeCollected?: number;
  transformedVolume?: number;
  maxCapacity: number;
  fillPercentage: number;
  temperature: number;
  phLevel: number;
  qualityStatus: string;
  targetBatch: string;
  morningVolume: number;
  eveningVolume: number;
  collectionDate: string;
  stockAllocation?: MilkStockAllocation;
}

export interface MilkHistory {
  date: string;
  morningVolume: number;
  eveningVolume: number;
  totalVolume: number;
  avgTemperature: number;
  cowsMilkedCount: number;
}

export interface DashboardStats {
  dailyMilkTotal: number;
  morningMilkTotal: number;
  eveningMilkTotal: number;
  milkingCowsCount: number;
  totalFemalesCount: number;
  totalBullsCount: number;
  totalHerdCount: number;
  averageMilkPerCow: number;
  healthAlertsCount: number;
  monthlyRevenueFcfa: number;
  feedConversionRatio: number;
  solarAutonomyPercentage: number;
  milkingCowsToday: Animal[];
  weeklyProductionChart: Array<{ day: string; morning: number; evening: number; total: number }>;
  revenueDistributionChart: Array<{ name: string; percent: number; color: string }>;
}

/** Tarif de vente du lait cru au litre. Le prix est nul tant qu'il n'a pas ete fixe. */
export interface MilkPricing {
  directSalePricePerLiterFcfa?: number;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}
