export type TypeIntervention = 
  | 'vaccination'
  | 'traitement'
  | 'visite_routine'
  | 'vermifuge'
  | 'mise_bas'
  | 'alerte_bouvier';

export interface SoinVeterinaire {
  id: string;
  date: string;
  animalId: string;
  animalBoucle: string;
  animalNom: string;
  type: TypeIntervention;
  diagnostic: string;
  medicament?: string;
  coutFCFA: number;
  delaiAttenteLaitJours: number;
  dateFinDelaiLait?: string;   
  veterinaireNom: string;
  statut: 'en_cours' | 'resolu' | 'alerte_urgente';
  notes?: string;
}
