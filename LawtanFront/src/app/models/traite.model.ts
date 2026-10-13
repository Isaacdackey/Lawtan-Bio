export interface TraiteEntree {
  animalId: string;
  boucleId: string;
  nomAnimal: string;
  traiteMatinLitres: number;
  traiteSoirLitres: number;
  totalLitres: number;
  qualiteNote: 'excellente' | 'normale' | 'suspecte';
  observation?: string;
}

export interface TraiteJournaliere {
  id: string;
  date: string; 
  enregistrePar: string; 
  traites: TraiteEntree[];
  totalJourLitres: number;
  moyenneParVacheLitres: number;
  litresConsignesQualite: number; 
}
