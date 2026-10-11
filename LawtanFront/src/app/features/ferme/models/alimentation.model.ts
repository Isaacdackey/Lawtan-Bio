export type TypeAliment = 'fourrage_vert' | 'foin' | 'concentre' | 'mineraux_cmv';
export type LotAnimal = 'laitieres' | 'genisses' | 'taureaux' | 'tous';
export type StatutParcelle = 'en_croissance' | 'pret_fauche' | 'en_rotation';
export type TypeIrrigation = 'goutte_a_goutte_solaire' | 'aspersion_solaire';

export interface RationDistribution {
  id: string;
  date: string;
  lotCible: LotAnimal;
  typeAliment: TypeAliment;
  nomAliment: string;
  quantiteKg: number;
  coutFCFA: number;
  distribuePar: string;
  observations?: string;
}

export interface ParcelleFourrage {
  id: string;
  nomParcelle: string;
  typeCulture: string;
  surfaceHa: number;
  dateSemis: string;
  statut: StatutParcelle;
  irrigation: TypeIrrigation;
  rendementEstimeKg: number;
  derniereFauche?: string;
  prochaineFauchePrevue?: string;
}
