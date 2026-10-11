import { Injectable, signal, computed } from '@angular/core';
import { Animal } from '../models/animal.model';
import { TraiteJournaliere, TraiteEntree } from '../models/traite.model';
import { SoinVeterinaire } from '../models/sante.model';
import { CommandeLait } from '../models/vente.model';
import { RationDistribution, ParcelleFourrage } from '../models/alimentation.model';
import { SuiviReproduction } from '../models/reproduction.model';

export type RoleUtilisateur = 'manager' | 'veterinaire' | 'bouvier' | 'commercial' | 'comptable';

export interface UtilisateurProfil {
  id: string;
  nom: string;
  role: RoleUtilisateur;
  roleTitre: string;
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class FermeMockService {
  // Profil connecté simulé (avec possibilité de changer de profil à la volée pour tester chaque vue UX)
  readonly profilsDisponibles: UtilisateurProfil[] = [
    { id: 'u1', nom: 'Mamadou Diallo', role: 'manager', roleTitre: 'Manager Général', avatar: 'MD' },
    { id: 'u2', nom: 'Dr. Ibrahima Ndiaye', role: 'veterinaire', roleTitre: 'Vétérinaire', avatar: 'IN' },
    { id: 'u3', nom: 'Amadou Sow', role: 'bouvier', roleTitre: 'Technicien & Bouvier', avatar: 'AS' },
    { id: 'u4', nom: 'Aminata Ba', role: 'commercial', roleTitre: 'Responsable Commerciale', avatar: 'AB' },
    { id: 'u5', nom: 'Cheikh Gueye', role: 'comptable', roleTitre: 'Comptable', avatar: 'CG' }
  ];

  readonly profilActif = signal<UtilisateurProfil>(this.profilsDisponibles[0]);

  // Définition stricte des rôles & permissions (RBAC Cadrage Ferme LAWTAN)
  readonly permissionsParRole: Record<RoleUtilisateur, {
    ongletsAutorises: string[];
    ongletParDefaut: string;
    badgeTitre: string;
    description: string;
    peutVoirFinances: boolean;
    peutSaisirTraite: boolean;
    peutAjouterSoin: boolean;
    peutCreerCommande: boolean;
    peutAjouterRation: boolean;
    peutAjouterReproduction: boolean;
    peutEvaluerVente: boolean;
  }> = {
    manager: {
      ongletsAutorises: ['dashboard', 'cheptel', 'troupeau', 'traite', 'production', 'sante', 'alimentation', 'reproduction', 'ventes', 'commercial'],
      ongletParDefaut: 'dashboard',
      badgeTitre: 'Supervision Globale (Accès Total 360°)',
      description: 'Accès complet à la production, la génétique, la santé animale, l\'alimentation, la reproduction et les ventes.',
      peutVoirFinances: true,
      peutSaisirTraite: true,
      peutAjouterSoin: true,
      peutCreerCommande: true,
      peutAjouterRation: true,
      peutAjouterReproduction: true,
      peutEvaluerVente: true
    },
    veterinaire: {
      ongletsAutorises: ['sante', 'reproduction', 'cheptel', 'troupeau', 'traite', 'production'],
      ongletParDefaut: 'sante',
      badgeTitre: 'Espace Clinique & Reproduction Vétérinaire',
      description: 'Suivi sanitaire des 13 animaux, inséminations, diagnostics de gestation, ordonnances et consignation du lait.',
      peutVoirFinances: false,
      peutSaisirTraite: false,
      peutAjouterSoin: true,
      peutCreerCommande: false,
      peutAjouterRation: false,
      peutAjouterReproduction: true,
      peutEvaluerVente: false
    },
    bouvier: {
      ongletsAutorises: ['traite', 'production', 'alimentation', 'cheptel', 'troupeau', 'reproduction'],
      ongletParDefaut: 'production',
      badgeTitre: 'Espace Terrain Mobile (Bouviers, Traite & Rations)',
      description: 'Interface allégée et optimisée smartphone : saisie de traite matin/soir, distribution des rations et alertes chaleurs.',
      peutVoirFinances: false,
      peutSaisirTraite: true,
      peutAjouterSoin: false,
      peutCreerCommande: false,
      peutAjouterRation: true,
      peutAjouterReproduction: true,
      peutEvaluerVente: false
    },
    commercial: {
      ongletsAutorises: ['ventes', 'commercial', 'dashboard'],
      ongletParDefaut: 'commercial',
      badgeTitre: 'Espace Commercial & Distribution',
      description: 'Commandes de lait bio frais & caillé, bons de livraison, traçabilité des lots et retours satisfaction clients.',
      peutVoirFinances: true,
      peutSaisirTraite: false,
      peutAjouterSoin: false,
      peutCreerCommande: true,
      peutAjouterRation: false,
      peutAjouterReproduction: false,
      peutEvaluerVente: true
    },
    comptable: {
      ongletsAutorises: ['dashboard', 'ventes', 'commercial', 'alimentation', 'sante'],
      ongletParDefaut: 'dashboard',
      badgeTitre: 'Espace Comptabilité & Trésorerie',
      description: 'Contrôle des recettes laitières, factures clients, coûts alimentaires (fourrage/concentrés) et frais vétérinaires.',
      peutVoirFinances: true,
      peutSaisirTraite: false,
      peutAjouterSoin: false,
      peutCreerCommande: false,
      peutAjouterRation: false,
      peutAjouterReproduction: false,
      peutEvaluerVente: false
    }
  };

  readonly currentPermission = computed(() => {
    const role = this.profilActif().role;
    return this.permissionsParRole[role];
  });

  // État Réseau & Énergie (Ferme Lawtan)
  readonly etatSysteme = signal<{ solaireActif: boolean; batteriePct: number; reseau4G: 'stable' | 'faible' | 'offline' }>({
    solaireActif: true,
    batteriePct: 94,
    reseau4G: 'stable'
  });

  // Les 13 animaux réels de la Ferme LAWTAN (7 en lactation, 2 jeunes femelles, 4 mâles)
  readonly animaux = signal<Animal[]>([
    {
      id: 'anim-1',
      boucleId: 'SN-LTN-01',
      nom: 'Reine',
      sexe: 'femelle',
      race: 'Montbéliarde x Guzerá',
      statut: 'lactation',
      dateNaissance: '2021-03-15',
      poidsKg: 495,
      temperatureC: 38.6,
      derniereTraiteLitres: 19.5,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
      observations: 'Excellente laitière, calme lors de la traite. Très bon appétit.',
      pedigree: {
        pere: { nom: 'Maximus du Jura', identifiant: 'FR-39-0021', race: 'Montbéliard Pur', rendementMoyenLait: 32 },
        mere: { nom: 'Dior Senior', identifiant: 'SN-DK-1102', race: 'Guzerá Laitière', rendementMoyenLait: 16 },
        grandPerePaternel: { nom: 'Titan 1er', race: 'Montbéliard Champion', rendementMoyenLait: 35 },
        grandPereMaternel: { nom: 'Sahel Gold', race: 'Guzerá Brésilien', rendementMoyenLait: 18 },
        typeInsemination: 'artificielle',
        taureauSemence: 'Maximus du Jura (Semence certifiée UCEFA)',
        qualiteSemence: 'Semence Sexée Femelle 90%',
        historiqueGestationNb: 2
      }
    },
    {
      id: 'anim-2',
      boucleId: 'SN-LTN-02',
      nom: 'Awa',
      sexe: 'femelle',
      race: 'Holstein x Gobra',
      statut: 'lactation',
      dateNaissance: '2021-07-20',
      poidsKg: 460,
      temperatureC: 38.5,
      derniereTraiteLitres: 16.0,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&auto=format&fit=crop&q=80',
      observations: 'Bonne adaptation au climat chaud. Vêlage facile.',
      pedigree: {
        pere: { nom: 'Nordic Prince', identifiant: 'DK-09-8812', race: 'Holstein Euro', rendementMoyenLait: 30 },
        mere: { nom: 'Thiès Belle', identifiant: 'SN-TH-440', race: 'Gobra Sénégalais', rendementMoyenLait: 10 },
        typeInsemination: 'artificielle',
        taureauSemence: 'Nordic Prince',
        qualiteSemence: 'Semence Conventionnelle Haute Génétique',
        historiqueGestationNb: 2
      }
    },
    {
      id: 'anim-3',
      boucleId: 'SN-LTN-03',
      nom: 'Fatou',
      sexe: 'femelle',
      race: 'Jersiaise x Guzerá',
      statut: 'lactation',
      dateNaissance: '2022-01-10',
      poidsKg: 420,
      temperatureC: 38.7,
      derniereTraiteLitres: 15.2,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80',
      observations: 'Lait très riche en matière grasse, idéal pour le lait caillé bio.',
      pedigree: {
        pere: { nom: 'Jersey Star', race: 'Jersiaise Pure', rendementMoyenLait: 24 },
        mere: { nom: 'Fatou Mère', race: 'Guzerá', rendementMoyenLait: 13 },
        typeInsemination: 'naturelle',
        taureauSemence: 'Sultan (Taureau Lawtan)',
        historiqueGestationNb: 1
      }
    },
    {
      id: 'anim-4',
      boucleId: 'SN-LTN-04',
      nom: 'Dior',
      sexe: 'femelle',
      race: 'Montbéliarde croisée',
      statut: 'lactation',
      dateNaissance: '2020-11-04',
      poidsKg: 510,
      temperatureC: 38.4,
      derniereTraiteLitres: 18.0,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&auto=format&fit=crop&q=80',
      observations: 'Régulière et docile. Cycle de chaleur bien calé.',
      pedigree: {
        pere: { nom: 'Jura Élite', race: 'Montbéliard', rendementMoyenLait: 31 },
        mere: { nom: 'Dior Ancienne', race: 'Métisse locale', rendementMoyenLait: 14 },
        typeInsemination: 'artificielle',
        taureauSemence: 'Jura Élite',
        historiqueGestationNb: 3
      }
    },
    {
      id: 'anim-5',
      boucleId: 'SN-LTN-05',
      nom: 'Mariama',
      sexe: 'femelle',
      race: 'Brune des Alpes croisée',
      statut: 'lactation',
      dateNaissance: '2022-04-18',
      poidsKg: 475,
      temperatureC: 38.8,
      derniereTraiteLitres: 14.8,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
      observations: 'Très rustique, excellente santé générale.',
      pedigree: {
        pere: { nom: 'Alpine King', race: 'Brune des Alpes', rendementMoyenLait: 28 },
        mere: { nom: 'Nafi', race: 'Guzerá x Gobra', rendementMoyenLait: 12 },
        typeInsemination: 'artificielle',
        historiqueGestationNb: 1
      }
    },
    {
      id: 'anim-6',
      boucleId: 'SN-LTN-06',
      nom: 'Coumba',
      sexe: 'femelle',
      race: 'Guzerá Laitière',
      statut: 'lactation',
      dateNaissance: '2021-09-02',
      poidsKg: 440,
      temperatureC: 38.6,
      derniereTraiteLitres: 13.0,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&auto=format&fit=crop&q=80',
      observations: 'Très résistante à la chaleur et aux tiques.',
      pedigree: {
        pere: { nom: 'Boucary Senior', race: 'Guzerá Pur Sélectionné', rendementMoyenLait: 17 },
        mere: { nom: 'Fanta', race: 'Guzerá', rendementMoyenLait: 13 },
        typeInsemination: 'naturelle',
        taureauSemence: 'Boucary',
        historiqueGestationNb: 2
      }
    },
    {
      id: 'anim-7',
      boucleId: 'SN-LTN-07',
      nom: 'Binta',
      sexe: 'femelle',
      race: 'Holstein croisée',
      statut: 'lactation',
      dateNaissance: '2022-06-30',
      poidsKg: 430,
      temperatureC: 39.1,
      derniereTraiteLitres: 11.0,
      enTraitementMedical: true,
      finDelaiAttenteLait: '2026-10-12', // Lait en délai d'attente vétérinaire (sécurité alimentaire)
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80',
      observations: 'Traitement bénin antibio mamelle gauche. Lait écarté jusqu’au 12/10 !',
      pedigree: {
        pere: { nom: 'Nordic Prince', race: 'Holstein', rendementMoyenLait: 30 },
        mere: { nom: 'Mami', race: 'Gobra', rendementMoyenLait: 9 },
        typeInsemination: 'artificielle',
        historiqueGestationNb: 1
      }
    },
    // 2 Jeunes femelles (génisses)
    {
      id: 'anim-8',
      boucleId: 'SN-LTN-08',
      nom: 'Kumba (Génisse)',
      sexe: 'femelle',
      race: 'Montbéliarde 75%',
      statut: 'jeune',
      dateNaissance: '2025-06-12',
      poidsKg: 240,
      temperatureC: 38.6,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
      observations: 'Génisse prometteuse, fille de Reine. Croissance vigoureuse.',
      pedigree: {
        pere: { nom: 'Sultan', race: 'Montbéliard Pur', rendementMoyenLait: 32 },
        mere: { nom: 'Reine', identifiant: 'SN-LTN-01', race: 'Montbéliarde x Guzerá', rendementMoyenLait: 19.5 },
        typeInsemination: 'artificielle',
        qualiteSemence: 'Semence UCEFA 1er choix',
        historiqueGestationNb: 0
      }
    },
    {
      id: 'anim-9',
      boucleId: 'SN-LTN-09',
      nom: 'Sokhna (Génisse)',
      sexe: 'femelle',
      race: 'Jersiaise 75%',
      statut: 'jeune',
      dateNaissance: '2025-09-01',
      poidsKg: 195,
      temperatureC: 38.5,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&auto=format&fit=crop&q=80',
      observations: 'Génisse docile, complémentation minérale régulière.',
      pedigree: {
        pere: { nom: 'Jersey Star II', race: 'Jersiaise Pure', rendementMoyenLait: 25 },
        mere: { nom: 'Fatou', identifiant: 'SN-LTN-03', race: 'Jersiaise x Guzerá', rendementMoyenLait: 15.2 },
        typeInsemination: 'artificielle',
        historiqueGestationNb: 0
      }
    },
    // 4 Mâles / Taureaux
    {
      id: 'anim-10',
      boucleId: 'SN-LTN-10',
      nom: 'Sultan (Taureau)',
      sexe: 'male',
      race: 'Montbéliard Pur Sélectionné',
      statut: 'reproducteur',
      dateNaissance: '2020-02-14',
      poidsKg: 820,
      temperatureC: 38.4,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80',
      observations: 'Géniteur principal de la ferme. Morphologie remarquable.',
      pedigree: {
        pere: { nom: 'Grand Sultan France', race: 'Montbéliard Élite' },
        mere: { nom: 'Princesse Jura', race: 'Montbéliard' },
        typeInsemination: 'naturelle',
        historiqueGestationNb: 0
      }
    },
    {
      id: 'anim-11',
      boucleId: 'SN-LTN-11',
      nom: 'Boucary (Taureau)',
      sexe: 'male',
      race: 'Guzerá Pur Laitier',
      statut: 'reproducteur',
      dateNaissance: '2021-05-10',
      poidsKg: 760,
      temperatureC: 38.5,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&auto=format&fit=crop&q=80',
      observations: 'Excellente rusticité, utilisé pour renforcer la résistance au climat.',
      pedigree: {
        pere: { nom: 'Brasilia Star', race: 'Guzerá Laitier Pur' },
        mere: { nom: 'Samba Guzerá', race: 'Guzerá' },
        typeInsemination: 'naturelle',
        historiqueGestationNb: 0
      }
    },
    {
      id: 'anim-12',
      boucleId: 'SN-LTN-12',
      nom: 'Simba (Jeune Mâle)',
      sexe: 'male',
      race: 'Montbéliarde x Guzerá',
      statut: 'reproducteur',
      dateNaissance: '2024-11-20',
      poidsKg: 380,
      temperatureC: 38.6,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
      observations: 'Jeune taureau en croissance pour future rotation de semence.',
      pedigree: {
        pere: { nom: 'Sultan', race: 'Montbéliard Pur' },
        mere: { nom: 'Dior', race: 'Montbéliarde croisée' },
        typeInsemination: 'naturelle',
        historiqueGestationNb: 0
      }
    },
    {
      id: 'anim-13',
      boucleId: 'SN-LTN-13',
      nom: 'Gorgui (Mâle)',
      sexe: 'male',
      race: 'Gobra Sélectionné',
      statut: 'reproducteur',
      dateNaissance: '2022-08-15',
      poidsKg: 690,
      temperatureC: 38.4,
      enTraitementMedical: false,
      photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&auto=format&fit=crop&q=80',
      observations: 'Taureau de race locale améliorée.',
      pedigree: {
        pere: { nom: 'Gobra Champion', race: 'Gobra' },
        mere: { nom: 'Reine du Baol', race: 'Gobra' },
        typeInsemination: 'naturelle',
        historiqueGestationNb: 0
      }
    }
  ]);

  // Traite journalière en cours (Aujourd'hui)
  readonly traiteAujourdhui = signal<TraiteJournaliere>({
    id: 'traite-today',
    date: new Date().toISOString().split('T')[0],
    enregistrePar: 'Amadou Sow (Technicien bouvier)',
    traites: [
      { animalId: 'anim-1', boucleId: 'SN-LTN-01', nomAnimal: 'Reine', traiteMatinLitres: 11.5, traiteSoirLitres: 8.0, totalLitres: 19.5, qualiteNote: 'excellente' },
      { animalId: 'anim-2', boucleId: 'SN-LTN-02', nomAnimal: 'Awa', traiteMatinLitres: 9.5, traiteSoirLitres: 6.5, totalLitres: 16.0, qualiteNote: 'excellente' },
      { animalId: 'anim-3', boucleId: 'SN-LTN-03', nomAnimal: 'Fatou', traiteMatinLitres: 9.0, traiteSoirLitres: 6.2, totalLitres: 15.2, qualiteNote: 'excellente' },
      { animalId: 'anim-4', boucleId: 'SN-LTN-04', nomAnimal: 'Dior', traiteMatinLitres: 10.5, traiteSoirLitres: 7.5, totalLitres: 18.0, qualiteNote: 'excellente' },
      { animalId: 'anim-5', boucleId: 'SN-LTN-05', nomAnimal: 'Mariama', traiteMatinLitres: 8.8, traiteSoirLitres: 6.0, totalLitres: 14.8, qualiteNote: 'excellente' },
      { animalId: 'anim-6', boucleId: 'SN-LTN-06', nomAnimal: 'Coumba', traiteMatinLitres: 7.5, traiteSoirLitres: 5.5, totalLitres: 13.0, qualiteNote: 'normale' },
      { animalId: 'anim-7', boucleId: 'SN-LTN-07', nomAnimal: 'Binta', traiteMatinLitres: 6.5, traiteSoirLitres: 4.5, totalLitres: 11.0, qualiteNote: 'suspecte', observation: 'Lait écarté - sous délai d’attente antibiotique' }
    ],
    totalJourLitres: 107.5,
    moyenneParVacheLitres: 15.35,
    litresConsignesQualite: 11.0 // Binta mise de côté pour sécurité sanitaire
  });

  // Soins vétérinaires & Alertes
  readonly soinsVeterinaires = signal<SoinVeterinaire[]>([
    {
      id: 'soin-1',
      date: '2026-10-08',
      animalId: 'anim-7',
      animalBoucle: 'SN-LTN-07',
      animalNom: 'Binta',
      type: 'traitement',
      diagnostic: 'Début de mammite subclinique quartier avant gauche',
      medicament: 'Mamyzin pommade intramammaire + Anti-inflammatoire',
      coutFCFA: 18500,
      delaiAttenteLaitJours: 4,
      dateFinDelaiLait: '2026-10-12',
      veterinaireNom: 'Dr. Ibrahima Ndiaye',
      statut: 'en_cours',
      notes: 'Lait impropre à la consommation humaine jusqu’au 12/10 inclus. Alimentation veau possible après pasteurisation.'
    },
    {
      id: 'soin-2',
      date: '2026-09-28',
      animalId: 'anim-1',
      animalBoucle: 'SN-LTN-01',
      animalNom: 'Reine',
      type: 'visite_routine',
      diagnostic: 'Contrôle échographique de gestation à 45 jours',
      medicament: 'Vitamines A-D3-E injection',
      coutFCFA: 15000,
      delaiAttenteLaitJours: 0,
      veterinaireNom: 'Dr. Ibrahima Ndiaye',
      statut: 'resolu',
      notes: 'Gestation confirmée positive. Vêlage estimé mi-mai 2027.'
    },
    {
      id: 'soin-3',
      date: '2026-09-15',
      animalId: 'anim-10',
      animalBoucle: 'SN-LTN-10',
      animalNom: 'Sultan',
      type: 'vaccination',
      diagnostic: 'Rappel vaccin Péripneumonie contagieuse bovine (PPCB) & Charbon',
      medicament: 'Vaccin bivalent ISRA',
      coutFCFA: 8500,
      delaiAttenteLaitJours: 0,
      veterinaireNom: 'Dr. Ibrahima Ndiaye',
      statut: 'resolu'
    }
  ]);

  // Ventes, Traçabilité & Commandes de Lait
  readonly commandesLait = signal<CommandeLait[]>([
    {
      id: 'cmd-1',
      reference: 'CMD-LTN-2026-089',
      date: '2026-10-09',
      clientNom: 'Hôtel Le Lagon - Restaurant',
      clientTelephone: '+221 77 543 21 00',
      clientType: 'hotel',
      produit: 'lait_bio_frais',
      quantiteUnites: 40,
      format: 'Bidons 5L (x8)',
      prixUnitaireFCFA: 1200,
      montantTotalFCFA: 48000,
      numeroLotLait: 'LOT-261009-MAT',
      statut: 'en_livraison',
      lieuLivraison: 'Plateau, Dakar'
    },
    {
      id: 'cmd-2',
      reference: 'CMD-LTN-2026-088',
      date: '2026-10-09',
      clientNom: 'Épicerie Bio Almadies',
      clientTelephone: '+221 78 120 45 67',
      clientType: 'marche_local',
      produit: 'lait_caille_bio',
      quantiteUnites: 30,
      format: 'Bouteilles 1L (x30)',
      prixUnitaireFCFA: 1500,
      montantTotalFCFA: 45000,
      numeroLotLait: 'LOT-261008-CAILLE',
      statut: 'paye',
      lieuLivraison: 'Almadies, Dakar',
      noteSatisfaction: 5,
      avisClient: 'Excellente consistance pour le lait caillé bio. Très apprécié par nos clients.'
    },
    {
      id: 'cmd-3',
      reference: 'CMD-LTN-2026-087',
      date: '2026-10-08',
      clientNom: 'Boutique du Terroir Thiès',
      clientTelephone: '+221 76 990 12 34',
      clientType: 'particulier',
      produit: 'lait_bio_frais',
      quantiteUnites: 20,
      format: 'Bouteilles 1L (x20)',
      prixUnitaireFCFA: 1200,
      montantTotalFCFA: 24000,
      numeroLotLait: 'LOT-261008-SOIR',
      statut: 'livre',
      lieuLivraison: 'Centre-ville Thiès',
      noteSatisfaction: 4.8,
      avisClient: 'Lait très pur et savoureux, aucune odeur parasite, conservation exemplaire.'
    }
  ]);

  // Suivi de l'Alimentation et Rations Quotidiennes (Cadrage Section 1 & 6)
  readonly rationsAlimentaires = signal<RationDistribution[]>([
    {
      id: 'rat-1',
      date: '2026-10-10',
      lotCible: 'laitieres',
      typeAliment: 'fourrage_vert',
      nomAliment: 'Maralfalfa frais haché (Parcelle P1)',
      quantiteKg: 95,
      coutFCFA: 9500,
      distribuePar: 'Amadou Sow',
      observations: 'Fauche matinale très tendre, excellente teneur en eau et protéines.'
    },
    {
      id: 'rat-2',
      date: '2026-10-10',
      lotCible: 'laitieres',
      typeAliment: 'concentre',
      nomAliment: 'Tourteau de coton & Son de blé',
      quantiteKg: 35,
      coutFCFA: 8750,
      distribuePar: 'Amadou Sow',
      observations: 'Ration de production stimulante pour les 7 vaches en traite (5 kg/vache).'
    },
    {
      id: 'rat-3',
      date: '2026-10-10',
      lotCible: 'laitieres',
      typeAliment: 'mineraux_cmv',
      nomAliment: 'Complément Minéral Vitaminé (CMV 8-16 Bovin)',
      quantiteKg: 2.5,
      coutFCFA: 3000,
      distribuePar: 'Amadou Sow',
      observations: 'Apport phosphore/calcium/oligo-éléments pour la lactation.'
    },
    {
      id: 'rat-4',
      date: '2026-10-10',
      lotCible: 'genisses',
      typeAliment: 'foin',
      nomAliment: 'Foin d arachide conditionné',
      quantiteKg: 25,
      coutFCFA: 4000,
      distribuePar: 'Amadou Sow',
      observations: 'Ration de croissance pour les 2 jeunes génisses.'
    },
    {
      id: 'rat-5',
      date: '2026-10-10',
      lotCible: 'taureaux',
      typeAliment: 'fourrage_vert',
      nomAliment: 'Panicum maximum vert fauché',
      quantiteKg: 40,
      coutFCFA: 3200,
      distribuePar: 'Amadou Sow',
      observations: 'Entretien des 4 taureaux reproducteurs.'
    }
  ]);

  // Parcelles Fourragères de la Ferme Lawtan (Cadrage Section 1 & 6)
  readonly parcellesFourrage = signal<ParcelleFourrage[]>([
    {
      id: 'parc-1',
      nomParcelle: 'P1 - Maralfalfa Bio Haute Densité',
      typeCulture: 'Maralfalfa',
      surfaceHa: 1.2,
      dateSemis: '2025-08-10',
      statut: 'pret_fauche',
      irrigation: 'goutte_a_goutte_solaire',
      rendementEstimeKg: 4500,
      derniereFauche: '2026-09-12',
      prochaineFauchePrevue: '2026-10-12'
    },
    {
      id: 'parc-2',
      nomParcelle: 'P2 - Panicum Maximum Solaire',
      typeCulture: 'Panicum maximum',
      surfaceHa: 0.8,
      dateSemis: '2025-11-05',
      statut: 'en_croissance',
      irrigation: 'aspersion_solaire',
      rendementEstimeKg: 2800,
      derniereFauche: '2026-09-20',
      prochaineFauchePrevue: '2026-10-25'
    },
    {
      id: 'parc-3',
      nomParcelle: 'P3 - Sorgho & Niébé Fourrager',
      typeCulture: 'Sorgho fourrager',
      surfaceHa: 1.0,
      dateSemis: '2026-07-15',
      statut: 'en_rotation',
      irrigation: 'goutte_a_goutte_solaire',
      rendementEstimeKg: 3200,
      derniereFauche: '2026-08-28',
      prochaineFauchePrevue: '2026-11-05'
    }
  ]);

  // Suivi Reproduction, Inséminations et Vêlages (Cadrage Section 1, 5, 6)
  readonly suivisReproduction = signal<SuiviReproduction[]>([
    {
      id: 'rep-1',
      animalId: 'anim-1',
      animalNom: 'Reine',
      animalBoucle: 'SN-LTN-01',
      date: '2026-06-15',
      typeActe: 'diagnostic_gestation',
      taureauOuSemence: 'Maximus du Jura (Semence Sexée 90%)',
      resultatGestation: 'gestante',
      datePrevisionnelleVelage: '2027-01-20',
      datePrevisionnelleTarissement: '2026-11-20',
      joursRestantsAvantVelage: 102,
      technicienNom: 'Dr. Ibrahima Ndiaye',
      observations: 'Gestation confirmée à l échographie (60j). Fœtus viable et bien développé.'
    },
    {
      id: 'rep-2',
      animalId: 'anim-2',
      animalNom: 'Awa',
      animalBoucle: 'SN-LTN-02',
      date: '2026-07-02',
      typeActe: 'diagnostic_gestation',
      taureauOuSemence: 'Nordic Prince (Semence Holstein Euro)',
      resultatGestation: 'gestante',
      datePrevisionnelleVelage: '2027-02-08',
      datePrevisionnelleTarissement: '2026-12-08',
      joursRestantsAvantVelage: 121,
      technicienNom: 'Dr. Ibrahima Ndiaye',
      observations: 'DG positif par palpation transrectale à 45j. Bon tonus utérin.'
    },
    {
      id: 'rep-3',
      animalId: 'anim-4',
      animalNom: 'Kumba',
      animalBoucle: 'SN-LTN-04',
      date: '2026-10-06',
      typeActe: 'insemination_ia',
      taureauOuSemence: 'Titan 1er (Montbéliard Champion)',
      resultatGestation: 'incertain',
      datePrevisionnelleVelage: '2027-07-13',
      joursRestantsAvantVelage: 276,
      technicienNom: 'Dr. Ibrahima Ndiaye',
      observations: 'IA réalisée 12h après détection de chaleurs franches. Palpation DG prévue le 20/11/2026.'
    },
    {
      id: 'rep-4',
      animalId: 'anim-3',
      animalNom: 'Fatou',
      animalBoucle: 'SN-LTN-03',
      date: '2026-10-09',
      typeActe: 'chaleur',
      technicienNom: 'Amadou Sow',
      observations: 'Comportement d acceptation du chevauchement et mucus vulvaire limpide. IA programmée sous 12h.'
    }
  ]);

  // Historique de Production Laitière sur 7 jours (Cadrage Section 1 : KPI & Tendances)
  readonly historiqueTraite7Jours = signal([
    { jour: 'Sam 04', date: '2026-10-04', totalLitres: 104.2, commercialisable: 104.2, moyenneParVache: 14.9 },
    { jour: 'Dim 05', date: '2026-10-05', totalLitres: 106.8, commercialisable: 106.8, moyenneParVache: 15.3 },
    { jour: 'Lun 06', date: '2026-10-06', totalLitres: 108.5, commercialisable: 108.5, moyenneParVache: 15.5 },
    { jour: 'Mar 07', date: '2026-10-07', totalLitres: 107.0, commercialisable: 93.0, moyenneParVache: 15.3 },
    { jour: 'Mer 08', date: '2026-10-08', totalLitres: 109.4, commercialisable: 95.4, moyenneParVache: 15.6 },
    { jour: 'Jeu 09', date: '2026-10-09', totalLitres: 111.2, commercialisable: 97.2, moyenneParVache: 15.9 },
    { jour: 'Ven 10', date: '2026-10-10', totalLitres: 112.5, commercialisable: 98.5, moyenneParVache: 16.1 }
  ]);

  // KPIs Calculés en temps réel
  readonly kpiTotalAnimaux = computed(() => this.animaux().length);
  readonly kpiVachesLactation = computed(() => this.animaux().filter(a => a.statut === 'lactation').length);
  readonly kpiVachesSousAlerte = computed(() => this.animaux().filter(a => a.enTraitementMedical).length);
  
  readonly kpiProductionJourCommercialisable = computed(() => {
    const total = this.traiteAujourdhui().totalJourLitres;
    const isole = this.traiteAujourdhui().litresConsignesQualite;
    return Math.round((total - isole) * 10) / 10;
  });

  // Synchronisation et résilience réseau (Terrain)
  readonly derniereSynchronisation = signal<string>(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  readonly statutSynchro = signal<'synchro' | 'en_cours' | 'hors_ligne'>('synchro');

  readonly kpiChiffreAffairesJour = computed(() => {
    return this.commandesLait()
      .filter(c => c.statut === 'paye' || c.statut === 'livre' || c.statut === 'en_livraison')
      .reduce((sum, c) => sum + c.montantTotalFCFA, 0);
  });

  readonly kpiChiffreAffairesEncaisse = computed(() => {
    return this.commandesLait()
      .filter(c => c.statut === 'paye')
      .reduce((sum, c) => sum + c.montantTotalFCFA, 0);
  });

  readonly kpiCommandesEnAttenteNb = computed(() => {
    return this.commandesLait().filter(c => c.statut === 'en_attente' || c.statut === 'en_livraison').length;
  });

  // KPIs Alimentation & Conversion
  readonly kpiConsommationAlimentsJourKg = computed(() => {
    return this.rationsAlimentaires().reduce((sum, r) => sum + r.quantiteKg, 0);
  });

  readonly kpiCoutAlimentationJourFCFA = computed(() => {
    return this.rationsAlimentaires().reduce((sum, r) => sum + r.coutFCFA, 0);
  });

  readonly kpiTauxConversionAlimentaire = computed(() => {
    // Rations consommées par le lot des laitières / production de lait du jour
    const rationLaitieresKg = this.rationsAlimentaires()
      .filter(r => r.lotCible === 'laitieres')
      .reduce((sum, r) => sum + r.quantiteKg, 0);
    const laitTotal = this.traiteAujourdhui().totalJourLitres;
    if (laitTotal <= 0) return 1.2;
    return Math.round((rationLaitieresKg / laitTotal) * 100) / 100;
  });

  readonly kpiStockFourrageTotalKg = computed(() => {
    return this.parcellesFourrage().reduce((sum, p) => sum + p.rendementEstimeKg, 0);
  });

  // KPIs Reproduction
  readonly kpiVachesGestantesNb = computed(() => {
    return this.suivisReproduction().filter(s => s.resultatGestation === 'gestante').length;
  });

  readonly kpiProchainsVelages = computed(() => {
    return this.suivisReproduction()
      .filter(s => s.resultatGestation === 'gestante' && s.joursRestantsAvantVelage !== undefined)
      .sort((a, b) => (a.joursRestantsAvantVelage || 999) - (b.joursRestantsAvantVelage || 999));
  });

  // KPI Moyenne Laitière Hebdomadaire & Mensuelle
  readonly kpiMoyenneHebdoLait = computed(() => {
    const list = this.historiqueTraite7Jours();
    const sum = list.reduce((acc, cur) => acc + cur.totalLitres, 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  readonly kpiMoyenneMensuelleLait = computed(() => 104.5); // Litres / jour sur 30 jours glissants

  // KPI Satisfaction Client Moyenne (sur 5 étoiles)
  readonly kpiSatisfactionClientMoyenne = computed(() => {
    const avecNote = this.commandesLait().filter(c => c.noteSatisfaction !== undefined);
    if (!avecNote.length) return 4.9;
    const sum = avecNote.reduce((acc, cur) => acc + (cur.noteSatisfaction || 0), 0);
    return Math.round((sum / avecNote.length) * 10) / 10;
  });

  // Méthode de simulation de changement de rôle pour l'utilisateur
  changerProfil(profilId: string): void {
    const trouve = this.profilsDisponibles.find(p => p.id === profilId);
    if (trouve) {
      this.profilActif.set(trouve);
    }
  }

  // Mettre à jour la traite d'un animal (Mobile bouvier)
  enregistrerTraiteAnimal(animalId: string, matin: number, soir: number, qualite: 'excellente' | 'normale' | 'suspecte', obs?: string): void {
    this.statutSynchro.set('en_cours');
    this.traiteAujourdhui.update(actuelle => {
      const traites = actuelle.traites.map(t => {
        if (t.animalId === animalId) {
          return {
            ...t,
            traiteMatinLitres: matin,
            traiteSoirLitres: soir,
            totalLitres: Math.round((matin + soir) * 10) / 10,
            qualiteNote: qualite,
            observation: obs
          };
        }
        return t;
      });

      const totalJour = traites.reduce((sum, t) => sum + t.totalLitres, 0);
      const moyenne = totalJour / (traites.length || 1);
      const consignes = traites.filter(t => t.qualiteNote === 'suspecte').reduce((sum, t) => sum + t.totalLitres, 0);

      return {
        ...actuelle,
        traites,
        totalJourLitres: Math.round(totalJour * 10) / 10,
        moyenneParVacheLitres: Math.round(moyenne * 10) / 10,
        litresConsignesQualite: Math.round(consignes * 10) / 10
      };
    });
    this.derniereSynchronisation.set(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setTimeout(() => this.statutSynchro.set('synchro'), 300);
  }

  // Ajouter une intervention vétérinaire
  ajouterSoin(soin: Omit<SoinVeterinaire, 'id'>): void {
    const nouveauSoin: SoinVeterinaire = {
      ...soin,
      id: `soin-${Date.now()}`
    };

    this.soinsVeterinaires.update(list => [nouveauSoin, ...list]);

    // Si délai d'attente lait > 0, mettre à jour l'animal
    if (soin.delaiAttenteLaitJours > 0) {
      this.animaux.update(liste => liste.map(a => {
        if (a.id === soin.animalId) {
          return {
            ...a,
            enTraitementMedical: true,
            finDelaiAttenteLait: soin.dateFinDelaiLait
          };
        }
        return a;
      }));
    }
  }

  // Ajouter une commande de lait
  ajouterCommande(cmd: Omit<CommandeLait, 'id' | 'reference'>): void {
    const nouvelleCommande: CommandeLait = {
      ...cmd,
      id: `cmd-${Date.now()}`,
      reference: `CMD-LTN-2026-${Math.floor(100 + Math.random() * 900)}`
    };

    this.commandesLait.update(list => [nouvelleCommande, ...list]);
  }

  // Ajouter une distribution d'alimentation
  ajouterRation(ration: Omit<RationDistribution, 'id'>): void {
    const nouvelleRation: RationDistribution = {
      ...ration,
      id: `rat-${Date.now()}`
    };
    this.rationsAlimentaires.update(list => [nouvelleRation, ...list]);
  }

  // Ajouter un suivi de reproduction
  ajouterActeReproduction(acte: Omit<SuiviReproduction, 'id'>): void {
    const nouveauSuivi: SuiviReproduction = {
      ...acte,
      id: `rep-${Date.now()}`
    };
    this.suivisReproduction.update(list => [nouveauSuivi, ...list]);
  }

  // Enregistrer un avis de satisfaction client
  enregistrerAvisClient(commandeId: string, note: number, avis: string): void {
    this.commandesLait.update(list => list.map(c => {
      if (c.id === commandeId) {
        return {
          ...c,
          noteSatisfaction: note,
          avisClient: avis
        };
      }
      return c;
    }));
  }

  // Faire progresser l'état logistique ou financier d'une commande
  mettreAJourStatutCommande(commandeId: string, nouveauStatut: any): void {
    this.commandesLait.update(list => list.map(c => {
      if (c.id === commandeId) {
        return {
          ...c,
          statut: nouveauStatut
        };
      }
      return c;
    }));
  }
}
