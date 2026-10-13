export interface HealthRecord {
  id?: number;
  animalId?: number;
  animalInternalId?: string;
  animalName?: string;
  recordDate: string;
  actType: string;
  diagnosis?: string;
  treatmentPrescription?: string;
  practitionerName?: string;
  costFcfa?: number;
  status?: string;
  milkWithdrawalDays?: number;
}

export interface VaccineSchedule {
  id?: number;
  vaccineType: string;
  targetHerd: string;
  scheduledDate: string;
  practitioner?: string;
  estimatedCost?: number;
  status?: string;
  notes?: string;
}
