export type TypeClient = 'marche_local' | 'restaurant' | 'hotel' | 'supermarche' | 'particulier';
export type ProduitLaitier = 'lait_bio_frais' | 'lait_caille_bio' | 'fromage_fermier' | 'yaourt_bio';
export type StatutCommande = 'en_attente' | 'en_livraison' | 'livre' | 'paye' | 'annule';

export interface CommandeLait {
  id: string;
  reference: string; 
  date: string;
  clientNom: string;
  clientTelephone: string;
  clientType: TypeClient;
  produit: ProduitLaitier;
  quantiteUnites: number; 
  format: string; 
  prixUnitaireFCFA: number;
  montantTotalFCFA: number;
  numeroLotLait: string; 
  statut: StatutCommande;
  lieuLivraison: string;
  noteSatisfaction?: number; 
  avisClient?: string;
}
