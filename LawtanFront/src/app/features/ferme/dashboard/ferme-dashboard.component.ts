import { Component, inject, signal, computed, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ferme-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ferme-dashboard.component.html',
  styleUrl: './ferme-dashboard.component.css'
})
export class FermeDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  private milkChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;

  // Statut Cuve & Collecte
  tankStatus = computed(() => ({
    tankName: 'Cuve Réfrigérée N°1 (Bio)',
    currentVolume: this.fermeService.kpiProductionJourCommercialisable(),
    maxCapacity: 500.0,
    temperature: 3.8,
    qualityStatus: 'CONFORME BIO',
    targetBatch: 'LOT-TR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01'
  }));

  animals = computed(() => this.fermeService.animaux());

  femaleCows = computed(() => this.animals().filter(a => a.sexe === 'femelle'));

  milkingCows = computed(() => {
    return this.animals().filter(a => a.sexe === 'femelle' && (a.statut === 'lactation' || (a.derniereTraiteLitres && a.derniereTraiteLitres > 0))).map(a => ({
      internalId: (a.boucleId || a.internalId || '') as string,
      name: (a.nom || a.name || '') as string,
      breed: (a.race || a.breed || '') as string,
      dailyMilkYield: a.derniereTraiteLitres || 14.5,
      temperature: a.temperatureC,
      status: a.enTraitementMedical ? 'FEVER_TREATMENT' : (a.statut === 'tarie' ? 'PREGNANT' : 'EXCELLENT')
    }));
  });

  filteredMilkAverageYield = computed(() => {
    const list = this.milkingCows();
    if (list.length === 0) return '0.0';
    const sum = list.reduce((acc, c) => acc + (c.dailyMilkYield || 0), 0);
    return (sum / list.length).toFixed(1);
  });

  dashboardStats = computed(() => ({
    healthAlertsCount: this.fermeService.kpiVachesSousAlerte(),
    weeklyProductionChart: [
      { day: 'Lun', morning: 68, evening: 52 },
      { day: 'Mar', morning: 70, evening: 54 },
      { day: 'Mer', morning: 65, evening: 50 },
      { day: 'Jeu', morning: 72, evening: 56 },
      { day: 'Ven', morning: 69, evening: 53 },
      { day: 'Sam', morning: 71, evening: 55 },
      { day: 'Dim', morning: 74, evening: 57 }
    ],
    revenueDistributionChart: [
      { name: 'Lait Frais Bio Pasteuris\u00e9', percent: 45, color: '#2C77B0' },
      { name: 'Fromage Frais & Gouda', percent: 25, color: '#f59e0b' },
      { name: 'Yaourts & Lait Caill\u00e9 (Sow)', percent: 20, color: '#38bdf8' },
      { name: 'Beurre Traditionnel', percent: 10, color: '#8b5cf6' }
    ]
  }));

  usersList = computed(() => this.fermeService.profilsDisponibles);

  dailyPlanning = computed<Array<{ time: string; title: string; detail: string; status: string; tone: 'done' | 'active' | 'todo' }>>(() => {
    const traites = this.fermeService.traiteAujourdhui();
    const soins = this.fermeService.soinsVeterinaires();
    const rows: Array<{ time: string; title: string; detail: string; status: string; tone: 'done' | 'active' | 'todo' }> = [];

    rows.push({
      time: '06h00',
      title: 'Traite du matin & Contr\u00f4le cuve',
      detail: `${traites.totalJourLitres > 0 ? traites.totalJourLitres : 68} L collect\u00e9s \u2022 Temp\u00e9rature 3.8\u00b0C conforme`,
      status: 'Termin\u00e9',
      tone: 'done'
    });

    rows.push({
      time: '08h30',
      title: 'Distribution fourrage & Rations bio',
      detail: 'M\u00e9lange luzerne, sorgho et tourteau d\'arachide bio',
      status: 'En cours',
      tone: 'active'
    });

    if (soins.length > 0) {
      const soin = soins[0];
      rows.push({
        time: '11h00',
        title: `Visite Vétérinaire — ${soin.animalNom}`,
        detail: `${soin.diagnostic} • ${soin.medicament || 'Traitement suivi'}`,
        status: soin.statut === 'en_cours' ? 'Alerte soin' : 'Clôturé',
        tone: soin.statut === 'en_cours' ? 'active' : 'done'
      });
    }

    rows.push({
      time: '17h00',
      title: 'Traite du soir & Nettoyage NEP salle',
      detail: 'Cycle automatis\u00e9 de rin\u00e7age et d\u00e9sinfection bio',
      status: '\u00c0 venir',
      tone: 'todo'
    });

    return rows;
  });

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initDashboardCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.milkChartInstance) this.milkChartInstance.destroy();
    if (this.donutChartInstance) this.donutChartInstance.destroy();
  }

  private initDashboardCharts(): void {
    const stats = this.dashboardStats();

    const milkCanvas = document.getElementById('dashMilkChart') as HTMLCanvasElement;
    if (milkCanvas) {
      if (this.milkChartInstance) this.milkChartInstance.destroy();
      const weekly = stats.weeklyProductionChart;
      this.milkChartInstance = new Chart(milkCanvas, {
        type: 'bar',
        data: {
          labels: weekly.map(d => d.day),
          datasets: [
            {
              label: 'Traite Matin',
              data: weekly.map(d => d.morning),
              backgroundColor: '#2C77B0',
              borderRadius: 6
            },
            {
              label: 'Traite Soir',
              data: weekly.map(d => d.evening),
              backgroundColor: '#38bdf8',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    const donutCanvas = document.getElementById('dashRevDonut') as HTMLCanvasElement;
    if (donutCanvas) {
      if (this.donutChartInstance) this.donutChartInstance.destroy();
      const revenue = stats.revenueDistributionChart;
      this.donutChartInstance = new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels: revenue.map(r => r.name),
          datasets: [{
            data: revenue.map(r => r.percent),
            backgroundColor: revenue.map(r => r.color),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  showPage(page: string): void {
    const routeMap: Record<string, string> = {
      lait: '/ferme/production',
      animaux: '/ferme/troupeau',
      sante: '/ferme/sante',
      reproduction: '/ferme/reproduction',
      alimentation: '/ferme/alimentation',
      commercial: '/ferme/commercial'
    };
    this.router.navigate([routeMap[page] || '/ferme/dashboard']);
  }

  openAnimalModal(internalId?: string): void {
    if (!internalId) return;
    this.router.navigate(['/ferme/troupeau'], { queryParams: { animal: internalId } });
  }

  openQuickTraite(): void {
    this.router.navigate(['/ferme/production']);
  }

  openQuickSante(): void {
    this.router.navigate(['/ferme/sante']);
  }
}
