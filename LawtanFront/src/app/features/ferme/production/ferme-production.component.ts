import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TraiteEntree } from '../models/traite.model';

@Component({
  selector: 'app-ferme-production',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ferme-production.component.html',
  styleUrl: './ferme-production.component.css'
})
export class FermeProductionComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  readonly cuveCapaciteMax = 500;
  // La cuve réfrigérée inox ne reçoit QUE le lait commercialisable conforme (pas le lait écarté pour raison antibiotique !)
  readonly cuveVolumeActuel = computed(() => this.fermeService.kpiProductionJourCommercialisable());
  readonly cuvePourcentage = computed(() => {
    const vol = this.cuveVolumeActuel();
    return Math.min(100, Math.round((vol / this.cuveCapaciteMax) * 100));
  });
  readonly cuveTemperature = signal<number>(3.8);

  modalTraiteOuvert = signal<boolean>(false);
  traiteEnEdition = signal<TraiteEntree | null>(null);
  enregistrementEnCours = signal<boolean>(false);
  formTraite!: FormGroup;

  // Filtre rapide pour le bouvier
  filtreLot = signal<'toutes' | 'lactation_saine' | 'sous_retrait'>('toutes');

  readonly traitesFiltrees = computed(() => {
    const traites = this.fermeService.traiteAujourdhui().traites;
    const f = this.filtreLot();
    if (f === 'lactation_saine') {
      return traites.filter(t => t.qualiteNote !== 'suspecte');
    }
    if (f === 'sous_retrait') {
      return traites.filter(t => t.qualiteNote === 'suspecte');
    }
    return traites;
  });

  constructor() {
    this.formTraite = this.fb.group({
      traiteMatinLitres: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      traiteSoirLitres: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      qualiteNote: ['excellente', [Validators.required]],
      observation: ['']
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalTraiteOuvert()) {
      this.fermerModalTraite();
    }
  }

  ajusterTraiteRapide(item: TraiteEntree, moment: 'matin' | 'soir', delta: number): void {
    if (this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const matin = moment === 'matin' ? Math.max(0, Math.round((item.traiteMatinLitres + delta) * 10) / 10) : item.traiteMatinLitres;
    const soir = moment === 'soir' ? Math.max(0, Math.round((item.traiteSoirLitres + delta) * 10) / 10) : item.traiteSoirLitres;

    this.fermeService.enregistrerTraiteAnimal(item.animalId, matin, soir, item.qualiteNote, item.observation);
    this.notificationService.afficherToast(`Traite mise à jour pour ${item.nomAnimal} : ${Math.round((matin + soir) * 10) / 10} L`);

    setTimeout(() => this.enregistrementEnCours.set(false), 200);
  }

  appliquerPreset(item: TraiteEntree, moment: 'matin' | 'soir', valeurFixe: number): void {
    const matin = moment === 'matin' ? valeurFixe : item.traiteMatinLitres;
    const soir = moment === 'soir' ? valeurFixe : item.traiteSoirLitres;

    this.fermeService.enregistrerTraiteAnimal(item.animalId, matin, soir, item.qualiteNote, item.observation);
    this.notificationService.afficherToast(`Preset ${valeurFixe}L appliqué à ${item.nomAnimal} (${moment})`);
  }

  ouvrirModalTraite(item: TraiteEntree): void {
    this.traiteEnEdition.set(item);
    this.formTraite.patchValue({
      traiteMatinLitres: item.traiteMatinLitres,
      traiteSoirLitres: item.traiteSoirLitres,
      qualiteNote: item.qualiteNote,
      observation: item.observation || ''
    });
    this.modalTraiteOuvert.set(true);
  }

  fermerModalTraite(): void {
    this.modalTraiteOuvert.set(false);
    this.traiteEnEdition.set(null);
  }

  soumettreTraite(): void {
    if (this.formTraite.invalid || !this.traiteEnEdition() || this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const val = this.formTraite.value;
    const item = this.traiteEnEdition()!;
    this.fermeService.enregistrerTraiteAnimal(
      item.animalId,
      Number(val.traiteMatinLitres),
      Number(val.traiteSoirLitres),
      val.qualiteNote,
      val.observation
    );

    this.notificationService.afficherToast(`Traite enregistrée pour ${item.nomAnimal} : ${Number(val.traiteMatinLitres) + Number(val.traiteSoirLitres)} L`);
    this.fermerModalTraite();
    setTimeout(() => this.enregistrementEnCours.set(false), 250);
  }
}
