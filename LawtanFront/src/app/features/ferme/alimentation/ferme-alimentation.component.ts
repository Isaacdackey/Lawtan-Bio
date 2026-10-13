import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface FeedStockItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  currentStockKg: number;
  alertThresholdKg: number;
  unitPriceKg: number;
  storageLocation: string;
}

export interface FeedRationItem {
  id: string;
  name: string;
  targetGroup: string;
  dryMatterKg: number;
  energyUfl: number;
  proteinPdiG: number;
  dailyCostFcfa: number;
  ingredients: { name: string; quantityKg: number }[];
}

export interface SupplierItem {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  location: string;
  certifiedBio: boolean;
}

@Component({
  selector: 'app-ferme-alimentation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ferme-alimentation.component.html',
  styleUrl: './ferme-alimentation.component.css'
})
export class FermeAlimentationComponent implements OnInit {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);

  activeFeedSubTab = signal<'stocks' | 'rations' | 'distributions' | 'suppliers'>('stocks');
  feedCategoryFilter = signal<string>('ALL');
  feedStockSearchTerm = signal<string>('');

  // Modales
  isNewFeedStockModalOpen = signal<boolean>(false);
  isNewFeedRationModalOpen = signal<boolean>(false);
  isDistributeModalOpen = signal<boolean>(false);

  // Stocks
  feedStocks = signal<FeedStockItem[]>([
    {
      id: 'fs-1',
      name: 'Foin de Luzerne Bio Conditionné',
      category: 'FORAGE_DRY',
      categoryLabel: 'Fourrage Sec & Foins',
      currentStockKg: 4200,
      alertThresholdKg: 1000,
      unitPriceKg: 180,
      storageLocation: 'Hangar Principal — Baie A1'
    },
    {
      id: 'fs-2',
      name: 'Ensilage de Sorgho Fourrager Bio',
      category: 'FORAGE_GREEN',
      categoryLabel: 'Fourrage Vert / Ensilage',
      currentStockKg: 8500,
      alertThresholdKg: 2000,
      unitPriceKg: 95,
      storageLocation: 'Silo Couloir N°2'
    },
    {
      id: 'fs-3',
      name: 'Tourteau d\'Arachide Bio Pressé à Froid',
      category: 'CONCENTRATE',
      categoryLabel: 'Concentrés & Tourteaux',
      currentStockKg: 650,
      alertThresholdKg: 800,
      unitPriceKg: 320,
      storageLocation: 'Local Concentrés — Palette 3'
    },
    {
      id: 'fs-4',
      name: 'Son de Blé Fin Bio Certifié',
      category: 'CONCENTRATE',
      categoryLabel: 'Concentrés & Tourteaux',
      currentStockKg: 1400,
      alertThresholdKg: 500,
      unitPriceKg: 140,
      storageLocation: 'Local Concentrés — Palette 1'
    },
    {
      id: 'fs-5',
      name: 'Complexe Minéral & Vitaminique (CMV Bio)',
      category: 'MINERALS_VITAMINS',
      categoryLabel: 'Minéraux & CMV',
      currentStockKg: 180,
      alertThresholdKg: 100,
      unitPriceKg: 650,
      storageLocation: 'Pharmacie Pastorale — Armoire M1'
    },
    {
      id: 'fs-6',
      name: 'Blocs de Sel Pur Gemme à Lécher',
      category: 'MINERALS_VITAMINS',
      categoryLabel: 'Minéraux & CMV',
      currentStockKg: 350,
      alertThresholdKg: 150,
      unitPriceKg: 250,
      storageLocation: 'Réserve Quai de Traite'
    }
  ]);

  totalFeedStockKg = computed(() => {
    return this.feedStocks().reduce((acc, s) => acc + s.currentStockKg, 0);
  });

  lowFeedStockCount = computed(() => {
    return this.feedStocks().filter(s => s.currentStockKg <= s.alertThresholdKg).length;
  });

  averageDailyFeedCostFcfa = computed(() => 2150);

  filteredFeedStocks = computed(() => {
    const cat = this.feedCategoryFilter();
    const q = this.feedStockSearchTerm().toLowerCase().trim();

    return this.feedStocks().filter(s => {
      let match = true;
      if (cat !== 'ALL' && s.category !== cat) match = false;
      if (q && !s.name.toLowerCase().includes(q) && !s.storageLocation.toLowerCase().includes(q)) match = false;
      return match;
    });
  });

  // Fiches Rations
  feedRations = signal<FeedRationItem[]>([
    {
      id: 'fr-1',
      name: 'Ration Laitière Haute Production (20+ L/j)',
      targetGroup: 'Vaches en lactation (7 têtes)',
      dryMatterKg: 18.5,
      energyUfl: 16.2,
      proteinPdiG: 1450,
      dailyCostFcfa: 2450,
      ingredients: [
        { name: 'Ensilage de Sorgho Bio', quantityKg: 22 },
        { name: 'Foin de Luzerne', quantityKg: 6 },
        { name: 'Tourteau d\'Arachide Bio', quantityKg: 2.5 },
        { name: 'Son de Blé', quantityKg: 2.0 },
        { name: 'CMV Bio Lait', quantityKg: 0.15 }
      ]
    },
    {
      id: 'fr-2',
      name: 'Ration Vaches Taries & Fin de Gestation',
      targetGroup: 'Femelles gestantes au repos (2 têtes)',
      dryMatterKg: 13.0,
      energyUfl: 9.8,
      proteinPdiG: 920,
      dailyCostFcfa: 1600,
      ingredients: [
        { name: 'Foin de Brousse & Luzerne', quantityKg: 10 },
        { name: 'Son de Blé Fin', quantityKg: 1.5 },
        { name: 'Minéraux Spécifiques Tarissement', quantityKg: 0.1 }
      ]
    },
    {
      id: 'fr-3',
      name: 'Ration Croissance Jeunes Génisses',
      targetGroup: 'Génisses 6-18 mois (2 têtes)',
      dryMatterKg: 9.5,
      energyUfl: 8.2,
      proteinPdiG: 780,
      dailyCostFcfa: 1250,
      ingredients: [
        { name: 'Foin de Luzerne Riche', quantityKg: 5 },
        { name: 'Ensilage de Sorgho', quantityKg: 8 },
        { name: 'Tourteau d\'Arachide', quantityKg: 0.8 }
      ]
    }
  ]);

  // Distributions
  distributions = computed(() => this.fermeService.rationsAlimentaires());

  // Fournisseurs
  suppliers = signal<SupplierItem[]>([
    {
      id: 'sup-1',
      name: 'Coopérative Agro-Bio Niayes',
      specialty: 'Fourrages Verts & Luzerne Biologique',
      phone: '+221 77 345 12 90',
      location: 'Sébikotane, Thiès',
      certifiedBio: true
    },
    {
      id: 'sup-2',
      name: 'Huilerie Artisanale Bio Touba',
      specialty: 'Tourteaux d\'Arachide & Sésame Pressés à Froid',
      phone: '+221 77 621 88 40',
      location: 'Diourbel',
      certifiedBio: true
    },
    {
      id: 'sup-3',
      name: 'BioNutrition Animale Sahel',
      specialty: 'Minéraux, Sel Gemme & CMV Conformes Bio',
      phone: '+221 78 112 45 60',
      location: 'Dakar / Rufisque',
      certifiedBio: true
    }
  ]);

  // Formulaire Nouvel Aliment
  newFeedForm = {
    name: '',
    category: 'FORAGE_DRY',
    initialStockKg: 500,
    alertThresholdKg: 200,
    unitPriceKg: 150,
    storageLocation: 'Hangar Principal'
  };

  // Formulaire Distribution
  distributeForm = {
    rationId: 'fr-1',
    distributedKg: 200,
    operator: 'Amadou Sow (Chef Bouvier)'
  };

  ngOnInit(): void {}

  navigateToFeedSubTab(tab: 'stocks' | 'rations' | 'distributions' | 'suppliers'): void {
    this.activeFeedSubTab.set(tab);
  }

  filterFeedStocks(cat: string): void {
    this.feedCategoryFilter.set(cat);
  }

  addQuickStock(stock: FeedStockItem, amountKg: number): void {
    this.feedStocks.update(list => list.map(s => {
      if (s.id === stock.id) {
        return { ...s, currentStockKg: s.currentStockKg + amountKg };
      }
      return s;
    }));
    this.notificationService.afficherToast(`+${amountKg} kg ajoutés au stock de ${stock.name} !`);
  }

  openNewFeedStockModal(): void {
    this.isNewFeedStockModalOpen.set(true);
  }

  submitNewFeedStock(): void {
    if (!this.newFeedForm.name.trim()) return;

    const newItem: FeedStockItem = {
      id: 'fs-' + Date.now(),
      name: this.newFeedForm.name,
      category: this.newFeedForm.category,
      categoryLabel: this.newFeedForm.category === 'FORAGE_DRY' ? 'Fourrage Sec' : 'Concentrés',
      currentStockKg: this.newFeedForm.initialStockKg,
      alertThresholdKg: this.newFeedForm.alertThresholdKg,
      unitPriceKg: this.newFeedForm.unitPriceKg,
      storageLocation: this.newFeedForm.storageLocation
    };

    this.feedStocks.update(list => [newItem, ...list]);
    this.notificationService.afficherToast(`Aliment "${newItem.name}" ajouté avec succès !`);
    this.isNewFeedStockModalOpen.set(false);
  }

  openDistributeModal(ration?: FeedRationItem): void {
    if (ration) this.distributeForm.rationId = ration.id;
    this.isDistributeModalOpen.set(true);
  }

  submitDistribute(): void {
    this.notificationService.afficherToast(`Distribution de ${this.distributeForm.distributedKg} kg enregistrée au journal pastoral !`);
    this.isDistributeModalOpen.set(false);
  }
}
