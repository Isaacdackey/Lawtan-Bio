export type SexeAnimal = 'femelle' | 'male';

export type StatutAnimal = 
  | 'lactation'      
  | 'tarie'          
  | 'jeune'          
  | 'reproducteur'   
  | 'reforme';

export interface PedigreeAscendant {
  nom: string;
  identifiant?: string;
  race: string;
  rendementMoyenLait?: number; 
  origineSemence?: string;
}

export interface Pedigree {
  pere?: PedigreeAscendant;
  mere?: PedigreeAscendant;
  grandPerePaternel?: PedigreeAscendant;
  grandMerePaternelle?: PedigreeAscendant;
  grandPereMaternel?: PedigreeAscendant;
  grandMereMaternelle?: PedigreeAscendant;
  typeInsemination: 'naturelle' | 'artificielle';
  taureauSemence?: string;
  qualiteSemence?: string; 
  historiqueGestationNb: number;
}

export interface Animal {
  id: string;
  boucleId: string;
  nom: string;
  sexe: SexeAnimal;
  race: string;
  statut: StatutAnimal;
  dateNaissance: string;
  poidsKg: number;
  temperatureC: number;
  derniereTraiteLitres?: number;
  enTraitementMedical: boolean;
  finDelaiAttenteLait?: string; 
  photoUrl: string;
  pedigree: Pedigree;
  observations?: string;
}
