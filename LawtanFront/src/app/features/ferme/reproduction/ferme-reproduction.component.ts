import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Animal } from '../models/animal.model';

export interface ReproductionAlert {
  id: string;
  animalInternalId: string;
  animalName: string;
  alertType: 'CALVING_IMMINENT' | 'DRY_OFF_DUE' | 'HEAT_ACTIVE' | 'PREG_CHECK' | 'CULLING_ALERT';
  message: string;
  targetDate: string;
  daysRemaining: number;
  severity: 'DANGER' | 'WARNING' | 'INFO';
  actionLabel?: string;
}

export interface ReproEventItem {
  id: string;
  animalInternalId: string;
  animalName: string;
  eventType: 'HEAT_DETECTION' | 'ARTIFICIAL_INSEMINATION' | 'NATURAL_MATING' | 'PREGNANCY_DIAGNOSIS' | 'CALVING' | 'DRY_OFF';
  eventTypeLabel: string;
  eventDate: string;
  bullOrSemenUsed?: string;
  operatorName?: string;
  expectedDryOffDate?: string;
  expectedCalvingDate?: string;
  observations?: string;
  isConfirmed: boolean;
}

@Component({
  selector: 'app-ferme-reproduction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ferme-reproduction.component.html',
  styleUrl: './ferme-reproduction.component.css'
})
export class FermeReproductionComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);

  // Filtre et pagination
  reproFilter = signal<string>('all');
  reproCurrentPage = signal<number>(1);
  reproPageSize = signal<number>(6);

  // Modale
  isReproModalOpen = signal<boolean>(false);

  // Formulaire d'acte de reproduction
  reproForm = {
    animalInternalId: 'SN-LTN-01',
    eventType: 'ARTIFICIAL_INSEMINATION',
    eventDate: new Date().toISOString().slice(0, 10),
    bullOrSemenUsed: 'Semence IA Montbéliarde Pure (Fallou)',
    operatorName: 'Dr. Ibrahima Ndiaye',
    expectedDryOffDate: '',
    expectedCalvingDate: '',
    observations: '',
    isConfirmed: true
  };

  // Liste des alertes de reproduction
  reproductionAlerts = signal<ReproductionAlert[]>([
    {
      id: 'ra-1',
      animalInternalId: 'SN-LTN-02',
      animalName: 'Awa',
      alertType: 'PREG_CHECK',
      message: 'Awa (SN-LTN-02) : Contrôle gestation DG J+45 requis.',
      targetDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      daysRemaining: 3,
      severity: 'WARNING',
      actionLabel: 'Programmer Échographie'
    },
    {
      id: 'ra-2',
      animalInternalId: 'SN-LTN-07',
      animalName: 'Binta',
      alertType: 'DRY_OFF_DUE',
      message: 'Binta (SN-LTN-07) : Tarissement dû dans 8 jours (J-60 avant vêlage).',
      targetDate: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10),
      daysRemaining: 8,
      severity: 'INFO',
      actionLabel: 'Planifier Tarissement'
    }
  ]);

  // Événements de reproduction réels
  reproductionEvents = signal<ReproEventItem[]>([
    {
      id: 'rev-1',
      animalInternalId: 'SN-LTN-01',
      animalName: 'Reine',
      eventType: 'PREGNANCY_DIAGNOSIS',
      eventTypeLabel: 'Diagnostic Gestation (DG+)',
      eventDate: '2026-08-15',
      bullOrSemenUsed: 'Maximus du Jura',
      operatorName: 'Dr. Ibrahima Ndiaye',
      expectedDryOffDate: '2027-02-10',
      expectedCalvingDate: '2027-04-12',
      observations: 'Fœtus viable à l\'échographie (J+60). Vêlage attendu en avril.',
      isConfirmed: true
    },
    {
      id: 'rev-2',
      animalInternalId: 'SN-LTN-02',
      animalName: 'Awa',
      eventType: 'ARTIFICIAL_INSEMINATION',
      eventTypeLabel: 'Insémination Artificielle (IA)',
      eventDate: '2026-09-02',
      bullOrSemenUsed: 'Semence IA Holstein Pure USA',
      operatorName: 'Dr. Ibrahima Ndiaye',
      expectedDryOffDate: '2027-03-25',
      expectedCalvingDate: '2027-05-25',
      observations: 'Insémination sur chaleurs naturelles franches. Dose sexée.',
      isConfirmed: true
    },
    {
      id: 'rev-3',
      animalInternalId: 'SN-LTN-07',
      animalName: 'Binta',
      eventType: 'PREGNANCY_DIAGNOSIS',
      eventTypeLabel: 'Diagnostic Gestation (DG+)',
      eventDate: '2026-06-18',
      bullOrSemenUsed: 'Gobra Prince (SN-LTN-10)',
      operatorName: 'Dr. Ibrahima Ndiaye',
      expectedDryOffDate: '2026-10-20',
      expectedCalvingDate: '2026-12-20',
      observations: 'Gestation avancée 6ème mois. Excellent état général.',
      isConfirmed: true
    },
    {
      id: 'rev-4',
      animalInternalId: 'SN-LTN-03',
      animalName: 'Fatou',
      eventType: 'HEAT_DETECTION',
      eventTypeLabel: 'Chaleur Détectée',
      eventDate: '2026-10-10',
      bullOrSemenUsed: '—',
      operatorName: 'Amadou Sow',
      observations: 'Immobilité au chevauchement, glaires transparentes.',
      isConfirmed: true
    }
  ]);

  // Vaches femelles
  femaleCows = computed(() => {
    return this.fermeService.animaux().filter(a => a.sexe === 'femelle').map(a => ({
      internalId: a.boucleId,
      name: a.nom,
      category: (a.statut as string) === 'jeune' || (a.statut as string) === 'genisse' ? 'HEIFER_YOUNG' : 'MILKING_COW'
    }));
  });

  // Femelles gestantes
  pregnantCows = computed(() => {
    return this.fermeService.animaux().filter(a => (a.statut as string) === 'gestante' || (a.observations ? a.observations.includes('gestante') : false));
  });

  pregnantCowsLabel = computed(() => {
    return `${this.pregnantCows().length} femelles confirmées au diagnostic DG`;
  });

  // Prochains vêlages
  upcomingCalvings = computed(() => {
    return this.reproductionEvents().filter(e => e.expectedCalvingDate && new Date(e.expectedCalvingDate) > new Date());
  });

  upcomingCalvingsLabel = computed(() => {
    return `${this.upcomingCalvings().length} mise(s) bas d'ici les 6 prochains mois`;
  });

  // Taureaux géniteurs
  bullsList = computed(() => {
    return this.fermeService.animaux().filter(a => a.sexe === 'male').map(a => ({
      internalId: a.boucleId,
      name: a.nom,
      breed: a.race
    }));
  });

  breedingBulls = computed(() => {
    return this.fermeService.animaux().filter(a => a.sexe === 'male').map(a => ({
      internalId: a.boucleId,
      name: a.nom,
      breed: a.race,
      weight: a.poidsKg,
      reproStatus: 'Géniteur actif — Qualité semence A+',
      pedigree: {
        fatherName: a.pedigree?.pere?.nom || 'Champion Pur',
        motherName: a.pedigree?.mere?.nom || 'Laitière Élite',
        semenMobilityPercentage: 88,
        semenConcentration: '1.4 Mrd',
        semenMorphologyOkPercentage: 92,
        semenDosesAvailable: 15
      }
    }));
  });

  // Événements filtrés
  filteredReproEvents = computed(() => {
    const f = this.reproFilter();
    const list = this.reproductionEvents();
    if (f === 'all') return list;
    if (f === 'ia') return list.filter(e => e.eventType === 'ARTIFICIAL_INSEMINATION' || e.eventType === 'NATURAL_MATING');
    if (f === 'gestation') return list.filter(e => e.eventType === 'PREGNANCY_DIAGNOSIS');
    if (f === 'velage') return list.filter(e => e.eventType === 'CALVING');
    if (f === 'tarissement') return list.filter(e => e.eventType === 'DRY_OFF');
    if (f === 'chaleur') return list.filter(e => e.eventType === 'HEAT_DETECTION');
    return list;
  });

  // Pagination
  totalReproPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredReproEvents().length / this.reproPageSize()));
  });

  paginatedReproEvents = computed(() => {
    const start = (this.reproCurrentPage() - 1) * this.reproPageSize();
    return this.filteredReproEvents().slice(start, start + this.reproPageSize());
  });

  reproPageNumbers = computed(() => {
    const total = this.totalReproPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  countEventsByType(type: string): number {
    if (type === 'INSEMINATION') {
      return this.reproductionEvents().filter(e => e.eventType === 'ARTIFICIAL_INSEMINATION' || e.eventType === 'NATURAL_MATING').length;
    }
    return this.reproductionEvents().filter(e => e.eventType === type).length;
  }

  filterRepro(eventFilter: string): void {
    this.reproFilter.set(eventFilter);
    this.reproCurrentPage.set(1);
  }

  prevReproPage(): void {
    if (this.reproCurrentPage() > 1) {
      this.reproCurrentPage.update(p => p - 1);
    }
  }

  nextReproPage(): void {
    if (this.reproCurrentPage() < this.totalReproPages()) {
      this.reproCurrentPage.update(p => p + 1);
    }
  }

  setReproPage(p: number): void {
    this.reproCurrentPage.set(p);
  }

  openReproModal(): void {
    this.updateReproCalculations();
    this.isReproModalOpen.set(true);
  }

  triggerRecalculateRepro(): void {
    this.notificationService.afficherToast('Métriques et alertes CowMaster recalculées avec succès !');
  }

  handleAlertAction(alert: ReproductionAlert): void {
    this.reproForm.animalInternalId = alert.animalInternalId;
    if (alert.alertType === 'CALVING_IMMINENT') {
      this.reproForm.eventType = 'CALVING';
      this.reproForm.observations = 'Vêlage & mise bas contrôlée';
    } else if (alert.alertType === 'DRY_OFF_DUE') {
      this.reproForm.eventType = 'DRY_OFF';
      this.reproForm.observations = 'Mise au repos pré-vêlage';
    } else if (alert.alertType === 'HEAT_ACTIVE') {
      this.reproForm.eventType = 'ARTIFICIAL_INSEMINATION';
      this.reproForm.observations = 'Insémination sur chaleurs observées';
    } else if (alert.alertType === 'PREG_CHECK') {
      this.reproForm.eventType = 'PREGNANCY_DIAGNOSIS';
      this.reproForm.observations = 'Diagnostic de gestation (Échographie J+45/50)';
      this.reproForm.isConfirmed = true;
    } else if (alert.alertType === 'CULLING_ALERT') {
      this.reproForm.eventType = 'PREGNANCY_DIAGNOSIS';
      this.reproForm.observations = 'Examen de fertilité approfondi / Constat d\'infécondité';
      this.reproForm.isConfirmed = false;
    }
    this.reproForm.eventDate = new Date().toISOString().slice(0, 10);
    this.updateReproCalculations();
    this.isReproModalOpen.set(true);
  }

  updateReproCalculations(): void {
    if (!this.reproForm.eventDate) {
      this.reproForm.eventDate = new Date().toISOString().slice(0, 10);
    }
    const evtDate = new Date(this.reproForm.eventDate);

    if (this.reproForm.eventType === 'ARTIFICIAL_INSEMINATION' || this.reproForm.eventType === 'NATURAL_MATING') {
      const calvingDate = new Date(evtDate.getTime() + 282 * 86400000);
      this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
      const dryOffDate = new Date(evtDate.getTime() + 222 * 86400000);
      this.reproForm.expectedDryOffDate = dryOffDate.toISOString().slice(0, 10);
    } else if (this.reproForm.eventType === 'DRY_OFF') {
      this.reproForm.expectedDryOffDate = this.reproForm.eventDate;
      const calvingDate = new Date(evtDate.getTime() + 60 * 86400000);
      this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
    } else if (this.reproForm.eventType === 'PREGNANCY_DIAGNOSIS') {
      if (!this.reproForm.expectedCalvingDate) {
        const calvingDate = new Date(evtDate.getTime() + 150 * 86400000);
        this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
      }
    } else if (this.reproForm.eventType === 'CALVING') {
      this.reproForm.expectedCalvingDate = '';
      this.reproForm.expectedDryOffDate = '';
    }
  }

  submitReproEntry(): void {
    const targetCow = this.femaleCows().find(c => c.internalId === this.reproForm.animalInternalId);
    const cowName = targetCow?.name ? targetCow.name : this.reproForm.animalInternalId;

    const typeLabels: Record<string, string> = {
      HEAT_DETECTION: 'Chaleur Détectée',
      ARTIFICIAL_INSEMINATION: 'Insémination Artificielle (IA)',
      NATURAL_MATING: 'Saillie Naturelle',
      PREGNANCY_DIAGNOSIS: 'Diagnostic Gestation (DG+)',
      DRY_OFF: 'Tarissement Programmé',
      CALVING: 'Vêlage & Mise bas'
    };

    const newEvt: ReproEventItem = {
      id: `rev-${Date.now()}`,
      animalInternalId: this.reproForm.animalInternalId,
      animalName: cowName,
      eventType: this.reproForm.eventType as any,
      eventTypeLabel: typeLabels[this.reproForm.eventType] || this.reproForm.eventType,
      eventDate: this.reproForm.eventDate,
      bullOrSemenUsed: this.reproForm.bullOrSemenUsed,
      operatorName: this.reproForm.operatorName,
      expectedDryOffDate: this.reproForm.expectedDryOffDate,
      expectedCalvingDate: this.reproForm.expectedCalvingDate,
      observations: this.reproForm.observations,
      isConfirmed: this.reproForm.isConfirmed
    };

    this.reproductionEvents.update(list => [newEvt, ...list]);
    this.isReproModalOpen.set(false);
    this.notificationService.afficherToast(`Acte de reproduction enregistré avec succès pour ${cowName} !`);
  }

  deleteReproEntry(id: string): void {
    this.reproductionEvents.update(list => list.filter(e => e.id !== id));
    this.notificationService.afficherToast('Acte de reproduction supprimé.');
  }
}
