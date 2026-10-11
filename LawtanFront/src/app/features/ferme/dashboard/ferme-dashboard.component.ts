import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';

@Component({
  selector: 'app-ferme-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ferme-dashboard.component.html',
  styleUrl: './ferme-dashboard.component.css'
})
export class FermeDashboardComponent {
  fermeService = inject(FermeMockService);
  private router = inject(Router);

  // Indicateurs Financiers Avancés (KPI Cadrage : Coût de Revient au Litre & Rentabilité)
  readonly kpiCoutRevientLitre = computed(() => 480); // 480 FCFA/L
  readonly kpiPrixMoyenVenteLitre = computed(() => 1200); // 1200 FCFA/L
  readonly kpiMargeBruteLitre = computed(() => this.kpiPrixMoyenVenteLitre() - this.kpiCoutRevientLitre()); // 720 FCFA/L
  readonly kpiTauxMargeBrute = computed(() => Math.round((this.kpiMargeBruteLitre() / this.kpiPrixMoyenVenteLitre()) * 100)); // 60%

  // Jauge de Supervision Cuve Réfrigérée (Sécurité alimentaire stricte : uniquement le lait conforme !)
  readonly cuveCapaciteMax = 500;
  readonly cuveVolumeActuel = computed(() => this.fermeService.kpiProductionJourCommercialisable());
  readonly cuvePourcentage = computed(() => {
    const vol = this.cuveVolumeActuel();
    return Math.min(100, Math.round((vol / this.cuveCapaciteMax) * 100));
  });
  readonly cuveCommercialisable = computed(() => this.fermeService.kpiProductionJourCommercialisable());
  readonly cuveConsignee = computed(() => this.fermeService.traiteAujourdhui().litresConsignesQualite);
  readonly cuveTemperature = signal<number>(3.8);

  // Indicateurs opérationnels de terrain prioritaires
  readonly commandesEnAttenteNb = computed(() => this.fermeService.kpiCommandesEnAttenteNb());
  readonly parcellesPretesFaucheNb = computed(() => this.fermeService.parcellesFourrage().filter(p => p.statut === 'pret_fauche').length);
  readonly traitementsActifsNb = computed(() => this.fermeService.soinsVeterinaires().filter(s => s.statut === 'en_cours').length);

  naviguerVers(sousRoute: string): void {
    this.router.navigate(['/ferme', sousRoute]);
  }
}
