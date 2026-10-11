export type TypeActeReproduction = 
  | 'chaleur' 
  | 'insemination_ia' 
  | 'saillie_naturelle' 
  | 'diagnostic_gestation' 
  | 'tarissement' 
  | 'velage';

export type ResultatGestation = 'gestante' | 'non_gestante' | 'incertain';

export interface SuiviReproduction {
  id: string;
  animalId: string;
  animalNom: string;
  animalBoucle: string;
  date: string;
  typeActe: TypeActeReproduction;
  taureauOuSemence?: string;
  resultatGestation?: ResultatGestation;
  datePrevisionnelleVelage?: string;
  datePrevisionnelleTarissement?: string;
  joursRestantsAvantVelage?: number;
  technicienNom: string;
  observations?: string;
}
