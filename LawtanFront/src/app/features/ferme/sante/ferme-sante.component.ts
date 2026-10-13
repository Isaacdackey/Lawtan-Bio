import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface HealthRecordItem {
  id: string;
  animalInternalId: string;
  animalName: string;
  actType: string;
  diagnosis: string;
  treatmentPrescription: string;
  practitionerName: string;
  milkWithdrawalDays: number;
  costFcfa: number;
  status: string;
  recordDate: string;
}

export interface VaccineItem {
  id: string;
  scheduledDate: string;
  vaccineType: string;
  targetHerd: string;
  practitioner: string;
  status: string;
}

@Component({
  selector: 'app-ferme-sante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ferme-sante.component.html',
  styleUrl: './ferme-sante.component.css'
})
export class FermeSanteComponent implements OnInit {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  isHealthModalOpen = signal<boolean>(false);
  isEditHealthModalOpen = signal<boolean>(false);
  isVaccineModalOpen = signal<boolean>(false);

  healthForm = {
    cowId: 'SN-LTN-07',
    actType: 'Traitement Pathologie',
    diagnosis: '',
    treatmentPrescription: '',
    practitionerName: 'Dr. Ibrahima Ndiaye',
    cost: 15000,
    milkWithdrawalDays: 3,
    status: 'En cours',
    recordDate: new Date().toISOString().split('T')[0]
  };

  selectedHealthRecord = signal<HealthRecordItem | null>(null);

  vaccineForm = {
    type: 'Péripneumonie Contagieuse Bovine (CBPP)',
    target: 'Tout le cheptel adulte',
    date: new Date().toISOString().split('T')[0],
    vet: 'Dr. Ibrahima Ndiaye',
    cost: 45000
  };

  // Données Cheptel
  animals = computed(() => this.fermeService.animaux().map(a => ({
    internalId: a.boucleId,
    name: a.nom
  })));

  activeHerd = computed(() => this.fermeService.animaux());

  healthyAnimalsCount = computed(() => {
    return this.activeHerd().filter(a => !a.enTraitementMedical).length;
  });

  animalsUnderWatch = computed(() => {
    return this.activeHerd().filter(a => a.enTraitementMedical || a.statut === 'tarie');
  });

  animalsUnderWatchLabel = computed(() => {
    const count = this.animalsUnderWatch().length;
    return `${count} vache(s) sous protocole ou repos pré-vêlage`;
  });

  // Interventions Médicales
  healthRecords = signal<HealthRecordItem[]>([
    {
      id: 'hr-1',
      animalInternalId: 'SN-LTN-07',
      animalName: 'Binta',
      actType: 'Traitement Mastite Subclinique',
      diagnosis: 'Congestion quartier arrière gauche, numération cellulaire 450k',
      treatmentPrescription: 'Intramammaire Cloxacilline 3j + Pommade décongestionnante',
      practitionerName: 'Dr. Ibrahima Ndiaye',
      milkWithdrawalDays: 4,
      costFcfa: 18500,
      status: 'En cours',
      recordDate: '2026-10-10'
    },
    {
      id: 'hr-2',
      animalInternalId: 'SN-LTN-02',
      animalName: 'Awa',
      actType: 'Échographie de Gestation (DG+)',
      diagnosis: 'Diagnostic précoce J+60 post-IA concluant',
      treatmentPrescription: 'Supplémentation minérale oligo-éléments',
      practitionerName: 'Dr. Ibrahima Ndiaye',
      milkWithdrawalDays: 0,
      costFcfa: 12000,
      status: 'Terminé',
      recordDate: '2026-10-06'
    },
    {
      id: 'hr-3',
      animalInternalId: 'SN-LTN-11',
      animalName: 'Kumba',
      actType: 'Parage des Onglons',
      diagnosis: 'Usure asymétrique pied arrière droit, début boiterie',
      treatmentPrescription: 'Taille corrective + Pansement protecteur au goudron de Norvège',
      practitionerName: 'Aliou Sow (Bouvier Spécialiste)',
      milkWithdrawalDays: 0,
      costFcfa: 7500,
      status: 'Terminé',
      recordDate: '2026-09-28'
    },
    {
      id: 'hr-4',
      animalInternalId: 'SN-LTN-03',
      animalName: 'Fatou',
      actType: 'Bilan Reproductif Post-Vêlage',
      diagnosis: 'Involution utérine parfaite, reprise cyclique confirmée',
      treatmentPrescription: 'Aucune prescription (Apte insémination IA)',
      practitionerName: 'Dr. Ibrahima Ndiaye',
      milkWithdrawalDays: 0,
      costFcfa: 10000,
      status: 'Apte IA',
      recordDate: '2026-09-15'
    }
  ]);

  // Alertes Reproduction / DG
  reproductionAlerts = computed(() => [
    { title: 'Échographie J+45 programmée', animal: 'SN-LTN-02 (Awa)' },
    { title: 'Contrôle non-retour en chaleurs', animal: 'SN-LTN-05 (Saly)' }
  ]);

  // Calendrier Vaccinal
  vaccineSchedules = signal<VaccineItem[]>([
    {
      id: 'v-1',
      scheduledDate: '2026-11-05',
      vaccineType: 'Péripneumonie Contagieuse Bovine (CBPP)',
      targetHerd: 'Troupeau Adulte (12 bêtes)',
      practitioner: 'Dr. Ibrahima Ndiaye',
      status: 'Programmé'
    },
    {
      id: 'v-2',
      scheduledDate: '2026-11-20',
      vaccineType: 'Charbon Bactéridien & Symptomatique',
      targetHerd: 'Génisses & Veaux de l\'année',
      practitioner: 'Dr. Ibrahima Ndiaye',
      status: 'Prévu'
    },
    {
      id: 'v-3',
      scheduledDate: '2026-12-10',
      vaccineType: 'Déparasitage Général (Ivermectine Bio)',
      targetHerd: 'Totalité du troupeau',
      practitioner: 'Équipe Ferme Lawtan',
      status: 'Planifié'
    }
  ]);

  ngOnInit(): void {}

  showPage(page: string): void {
    const map: Record<string, string> = {
      animaux: '/ferme/troupeau',
      reproduction: '/ferme/reproduction',
      sante: '/ferme/sante'
    };
    this.router.navigate([map[page] || '/ferme/sante']);
  }

  submitHealthEntry(): void {
    const cow = this.activeHerd().find(a => a.boucleId === this.healthForm.cowId);
    const newRec: HealthRecordItem = {
      id: 'hr-' + Date.now(),
      animalInternalId: this.healthForm.cowId,
      animalName: cow ? (cow.name || cow.nom || this.healthForm.cowId) : this.healthForm.cowId,
      actType: this.healthForm.actType,
      diagnosis: this.healthForm.diagnosis || 'Intervention clinique',
      treatmentPrescription: this.healthForm.treatmentPrescription || 'Aucune prescription spécifique',
      practitionerName: this.healthForm.practitionerName || 'Dr. Ibrahima Ndiaye',
      milkWithdrawalDays: this.healthForm.milkWithdrawalDays || 0,
      costFcfa: this.healthForm.cost || 0,
      status: this.healthForm.status || 'En cours',
      recordDate: this.healthForm.recordDate || new Date().toISOString().split('T')[0]
    };

    this.healthRecords.update(list => [newRec, ...list]);

    // Mettre à jour l'animal si délai d'attente
    if (newRec.milkWithdrawalDays > 0) {
      this.fermeService.animaux.update(list => list.map(a => {
        if (a.boucleId === newRec.animalInternalId) {
          return {
            ...a,
            enTraitementMedical: true,
            finDelaiAttenteLait: newRec.recordDate
          };
        }
        return a;
      }));
    }

    this.notificationService.afficherToast(`Intervention pour ${newRec.animalName} enregistrée avec succès !`);
    this.isHealthModalOpen.set(false);
  }

  openEditHealthModal(rec: HealthRecordItem): void {
    this.selectedHealthRecord.set(rec);
    this.healthForm = {
      cowId: rec.animalInternalId,
      actType: rec.actType,
      diagnosis: rec.diagnosis,
      treatmentPrescription: rec.treatmentPrescription,
      practitionerName: rec.practitionerName,
      cost: rec.costFcfa,
      milkWithdrawalDays: rec.milkWithdrawalDays,
      status: rec.status,
      recordDate: rec.recordDate
    };
    this.isEditHealthModalOpen.set(true);
  }

  submitEditHealthEntry(): void {
    const cur = this.selectedHealthRecord();
    if (!cur) return;

    this.healthRecords.update(list => list.map(r => {
      if (r.id === cur.id) {
        return {
          ...r,
          actType: this.healthForm.actType,
          diagnosis: this.healthForm.diagnosis,
          treatmentPrescription: this.healthForm.treatmentPrescription,
          practitionerName: this.healthForm.practitionerName,
          costFcfa: this.healthForm.cost,
          milkWithdrawalDays: this.healthForm.milkWithdrawalDays,
          status: this.healthForm.status,
          recordDate: this.healthForm.recordDate
        };
      }
      return r;
    }));

    this.notificationService.afficherToast(`Intervention mise à jour avec succès !`);
    this.isEditHealthModalOpen.set(false);
  }

  submitVaccineEntry(): void {
    const newVac: VaccineItem = {
      id: 'v-' + Date.now(),
      scheduledDate: this.vaccineForm.date,
      vaccineType: this.vaccineForm.type,
      targetHerd: this.vaccineForm.target,
      practitioner: this.vaccineForm.vet,
      status: 'Programmé'
    };

    this.vaccineSchedules.update(list => [...list, newVac]);
    this.notificationService.afficherToast(`Vaccination programmée avec succès pour le ${newVac.scheduledDate} !`);
    this.isVaccineModalOpen.set(false);
  }
}
