export type ReproEventType =
  | 'INSEMINATION'
  | 'PREG_CHECK'
  | 'HEAT_DETECTION'
  | 'CALVING'
  | 'DRY_OFF'
  | 'ILLNESS_TREATMENT'
  | 'ARTIFICIAL_INSEMINATION'
  | 'NATURAL_MATING'
  | 'PREGNANCY_DIAGNOSIS';

export interface ReproductionEvent {
  id?: number;
  animalId?: number;
  animalInternalId: string;
  animalName?: string;
  eventType: ReproEventType;
  eventTypeLabel?: string;
  eventDate: string;
  eventTime?: string;
  cowMasterTypeOriginal?: string;
  bullOrSemenUsed?: string;
  method?: string;
  result?: string;
  pathology?: string;
  treatment?: string;
  operatorName?: string;
  expectedDryOffDate?: string;
  expectedCalvingDate?: string;
  observations?: string;
  isConfirmed?: boolean;
}

export interface ReproductionAlert {
  alertType: 'CALVING_IMMINENT' | 'DRY_OFF_DUE' | 'HEAT_ACTIVE' | 'PREG_CHECK' | 'CULLING_ALERT' | string;
  animalInternalId: string;
  animalName: string;
  targetDate: string;
  daysRemaining: number;
  message: string;
  severity: 'DANGER' | 'WARNING' | 'INFO';
  daysOpen?: number;
  daysSinceIA?: number;
  actionLabel?: string;
}
