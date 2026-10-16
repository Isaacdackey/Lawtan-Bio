import { Component, inject, signal, computed, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ferme-production',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ferme-production.component.html',
  styleUrl: './ferme-production.component.css'
})
export class FermeProductionComponent implements OnInit, AfterViewInit, OnDestroy {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);

  private monthlyChartInstance: Chart | null = null;

  // Sous-onglets actifs : 'milking' | 'journal' | 'stocks' | 'transformation'
  activeMilkSubTab = signal<'milking' | 'journal' | 'stocks' | 'transformation'>('milking');

  // Modales
  isMilkModalOpen = signal<boolean>(false);
  isVentilationModalOpen = signal<boolean>(false);
  isQuickMilkingModalOpen = signal<boolean>(false);

  // Vaches en lactation
  milkingCowsCurrentPage = signal<number>(1);
  milkingCowsPageSize = signal<number>(6);

  milkingCows = computed(() => {
    return this.fermeService.animaux().filter(a => a.sexe === 'femelle').map(a => ({
      internalId: a.boucleId,
      name: a.nom,
      breed: a.race,
      earTagNumber: a.boucleId,
      dailyMilkYield: a.derniereTraiteLitres || 15.5,
      status: a.enTraitementMedical ? 'FEVER_TREATMENT' : 'HEALTHY',
      imageUrl: a.photoUrl
    }));
  });

  paginatedMilkingCows = computed(() => {
    const start = (this.milkingCowsCurrentPage() - 1) * this.milkingCowsPageSize();
    return this.milkingCows().slice(start, start + this.milkingCowsPageSize());
  });

  totalMilkingCowsPages = computed(() => {
    return Math.max(1, Math.ceil(this.milkingCows().length / this.milkingCowsPageSize()));
  });

  milkingCowsPageNumbers = computed(() => {
    return Array.from({ length: this.totalMilkingCowsPages() }, (_, i) => i + 1);
  });

  // Supervision Cuve
  tankStatus = computed(() => {
    const vol = this.fermeService.kpiProductionJourCommercialisable();
    return {
      tankName: 'Cuve Réfrigérée N°1 (Bio)',
      currentVolume: vol,
      maxCapacity: 500.0,
      qualityStatus: 'CONFORME BIO',
      targetBatch: 'LOT-TR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01',
      grossVolumeCollected: this.fermeService.traiteAujourdhui().totalJourLitres,
      morningVolume: 68,
      eveningVolume: 52
    };
  });

  unallocatedMilkVolume = computed(() => {
    return Math.max(0, Math.round((this.tankStatus().currentVolume * 0.45) * 10) / 10);
  });

  unallocatedMilkPercentage = computed(() => {
    return Math.min(100, Math.round((this.unallocatedMilkVolume() / 500) * 100));
  });

  isCurrentMorningSession = computed(() => {
    const hour = new Date().getHours();
    return hour < 14;
  });

  // Stock & Ventilation
  milkStockAllocation = signal({
    grossVolumeCollected: 120,
    collectedToday: 120,
    directSaleVolume: 60,
    directSaleAvailable: 45,
    directSaleConsumed: 15,
    productionVolume: 40,
    productionAvailable: 35,
    productionConsumed: 5,
    calfFeedingVolume: 15,
    calfFeedingConsumed: 15,
    milkInTank: 5
  });

  rawMilkUnitPrice = signal<number>(800);
  isMilkPriceEditing = signal<boolean>(false);
  milkPriceForm = { pricePerLiter: 800, notes: 'Tarif officiel du lait bio Lawtan' };

  // Journal des Récoltes & Filtres
  milkFilterStartDate = signal<string>('');
  milkFilterEndDate = signal<string>('');
  milkFilterAnimalId = signal<string>('ALL');
  milkFilterSession = signal<string>('ALL');
  milkFilterMinVolume = signal<number | null>(null);
  milkFilterSearch = signal<string>('');
  milkCurrentPage = signal<number>(1);
  milkPageSize = signal<number>(8);

  filteredMilkProductions = computed(() => {
    const traites = this.fermeService.traiteAujourdhui().traites;
    const animId = this.milkFilterAnimalId();
    const session = this.milkFilterSession();
    const q = this.milkFilterSearch().toLowerCase().trim();

    const result: Array<{
      productionDate: string;
      session: string;
      animalName: string;
      animalInternalId: string;
      volumeLiters: number;
      milkTemperature: number;
      isOrganicCompliant: boolean;
      destinationTank: string;
    }> = [];

    traites.forEach(t => {
      if (animId !== 'ALL' && t.animalId !== animId) return;
      if (q && !t.nomAnimal.toLowerCase().includes(q) && !t.animalId.toLowerCase().includes(q)) return;

      if (session === 'ALL' || session === 'MORNING') {
        result.push({
          productionDate: this.fermeService.traiteAujourdhui().date,
          session: 'MORNING',
          animalName: t.nomAnimal,
          animalInternalId: t.animalId,
          volumeLiters: t.traiteMatinLitres,
          milkTemperature: 37.2,
          isOrganicCompliant: t.qualiteNote !== 'suspecte',
          destinationTank: 'Cuve Bio N°1 (Inox)'
        });
      }
      if (session === 'ALL' || session === 'EVENING') {
        result.push({
          productionDate: this.fermeService.traiteAujourdhui().date,
          session: 'EVENING',
          animalName: t.nomAnimal,
          animalInternalId: t.animalId,
          volumeLiters: t.traiteSoirLitres,
          milkTemperature: 37.0,
          isOrganicCompliant: t.qualiteNote !== 'suspecte',
          destinationTank: 'Cuve Bio N°1 (Inox)'
        });
      }
    });

    return result;
  });

  filteredMilkTotalVolume = computed(() => {
    return this.filteredMilkProductions().reduce((acc, p) => acc + p.volumeLiters, 0);
  });

  filteredMilkAverageYield = computed(() => {
    const list = this.filteredMilkProductions();
    if (list.length === 0) return 0;
    return Math.round((this.filteredMilkTotalVolume() / list.length) * 10) / 10;
  });

  organicComplianceToday = computed(() => 100);

  paginatedMilkProductions = computed(() => {
    const start = (this.milkCurrentPage() - 1) * this.milkPageSize();
    return this.filteredMilkProductions().slice(start, start + this.milkPageSize());
  });

  totalMilkPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredMilkProductions().length / this.milkPageSize()));
  });

  milkPageNumbers = computed(() => {
    return Array.from({ length: this.totalMilkPages() }, (_, i) => i + 1);
  });

  // Saisie Traite Rapide Form
  quickCowTarget = signal<any | null>(null);
  quickSessionTarget = signal<'MORNING' | 'EVENING'>('MORNING');
  quickVolume = signal<number>(14);

  // Formulaire Manuel Traite
  manualMilkForm = {
    cowId: 'SN-LTN-01',
    session: 'MORNING',
    volumeLiters: 14.5,
    quality: 'CONFORME_BIO',
    temperature: 37.0,
    operator: 'Mamadou Diallo'
  };

  // Formulaire Ventilation
  ventilationForm = {
    directSale: 40,
    transformation: 30,
    calves: 10
  };

  milkedStatusMap = signal<Record<string, { morning: boolean; evening: boolean }>>({
    'SN-LTN-01': { morning: true, evening: false },
    'SN-LTN-02': { morning: true, evening: false },
    'SN-LTN-03': { morning: false, evening: false }
  });

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initMonthlyMilkChart(), 150);
  }

  ngOnDestroy(): void {
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy();
  }

  navigateToMilkSubTab(tab: 'milking' | 'journal' | 'stocks' | 'transformation'): void {
    this.activeMilkSubTab.set(tab);
    if (tab === 'milking') {
      setTimeout(() => this.initMonthlyMilkChart(), 100);
    }
  }

  setMilkingCowsPage(p: number): void {
    this.milkingCowsCurrentPage.set(p);
  }

  prevMilkingCowsPage(): void {
    if (this.milkingCowsCurrentPage() > 1) {
      this.milkingCowsCurrentPage.update(p => p - 1);
    }
  }

  nextMilkingCowsPage(): void {
    if (this.milkingCowsCurrentPage() < this.totalMilkingCowsPages()) {
      this.milkingCowsCurrentPage.update(p => p + 1);
    }
  }

  isMilkedToday(cowId: string | undefined, session: 'MORNING' | 'EVENING'): boolean {
    if (!cowId) return false;
    const status = this.milkedStatusMap()[cowId];
    if (!status) return false;
    return session === 'MORNING' ? status.morning : status.evening;
  }

  openQuickMilkingModal(cow: any, session: 'MORNING' | 'EVENING'): void {
    this.quickCowTarget.set(cow);
    this.quickSessionTarget.set(session);
    this.quickVolume.set(cow.dailyMilkYield ? Math.round(cow.dailyMilkYield / 2) : 12);
    this.isQuickMilkingModalOpen.set(true);
  }

  confirmQuickMilking(): void {
    const cow = this.quickCowTarget();
    const session = this.quickSessionTarget();
    if (!cow) return;

    this.milkedStatusMap.update(map => {
      const cur = map[cow.internalId] || { morning: false, evening: false };
      return {
        ...map,
        [cow.internalId]: {
          ...cur,
          morning: session === 'MORNING' ? true : cur.morning,
          evening: session === 'EVENING' ? true : cur.evening
        }
      };
    });

    this.notificationService.afficherToast(`Traite ${session === 'MORNING' ? 'Matin' : 'Soir'} enregistrée pour ${cow.name} (${this.quickVolume()} L) !`);
    this.isQuickMilkingModalOpen.set(false);
  }

  private initMonthlyMilkChart(): void {
    const canvas = document.getElementById('monthlyMilkChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy();

    this.monthlyChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['01/10', '03/10', '05/10', '07/10', '09/10', '11/10', '12/10 (Auj.)'],
        datasets: [
          {
            label: 'Traite Matin (L)',
            data: [64, 66, 68, 65, 70, 68, 72],
            borderColor: '#2C77B0',
            backgroundColor: 'rgba(44, 119, 176, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Traite Soir (L)',
            data: [48, 50, 52, 49, 54, 52, 55],
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  resetMilkFilters(): void {
    this.milkFilterStartDate.set('');
    this.milkFilterEndDate.set('');
    this.milkFilterAnimalId.set('ALL');
    this.milkFilterSession.set('ALL');
    this.milkFilterMinVolume.set(null);
    this.milkFilterSearch.set('');
    this.milkCurrentPage.set(1);
  }

  filterMilkByAnimal(id: string): void {
    this.milkFilterAnimalId.set(id);
    this.milkCurrentPage.set(1);
  }

  filterMilkBySession(session: string): void {
    this.milkFilterSession.set(session);
    this.milkCurrentPage.set(1);
  }

  prevMilkPage(): void {
    if (this.milkCurrentPage() > 1) this.milkCurrentPage.update(p => p - 1);
  }

  nextMilkPage(): void {
    if (this.milkCurrentPage() < this.totalMilkPages()) this.milkCurrentPage.update(p => p + 1);
  }

  setMilkPage(p: number): void {
    this.milkCurrentPage.set(p);
  }

  openVentilationModal(): void {
    this.isVentilationModalOpen.set(true);
  }

  submitVentilation(): void {
    this.notificationService.afficherToast('Ventilation du lait validée et reportée dans les stocks !');
    this.isVentilationModalOpen.set(false);
  }

  startEditingMilkPrice(): void {
    this.isMilkPriceEditing.set(true);
  }

  cancelEditingMilkPrice(): void {
    this.isMilkPriceEditing.set(false);
  }

  submitMilkPrice(): void {
    this.rawMilkUnitPrice.set(this.milkPriceForm.pricePerLiter);
    this.isMilkPriceEditing.set(false);
    this.notificationService.afficherToast(`Prix du lait mis à jour : ${this.rawMilkUnitPrice()} FCFA / litre.`);
  }

  submitManualMilkEntry(): void {
    this.notificationService.afficherToast(`Traite de ${this.manualMilkForm.volumeLiters} L enregistrée avec succès !`);
    this.isMilkModalOpen.set(false);
  }

  getSelectedCowName(cowId: string): string {
    const cow = this.milkingCows().find(c => c.internalId === cowId);
    return cow?.name ? cow.name : cowId;
  }

  getSelectedCowBreed(cowId: string): string {
    const cow = this.milkingCows().find(c => c.internalId === cowId);
    return cow?.breed ? cow.breed : 'Holstein Pure';
  }
}
