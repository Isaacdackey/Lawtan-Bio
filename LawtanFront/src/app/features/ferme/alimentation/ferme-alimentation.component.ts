import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TypeAliment, LotAnimal } from '../models/alimentation.model';

@Component({
  selector: 'app-ferme-alimentation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ferme-alimentation.component.html',
  styleUrl: './ferme-alimentation.component.css'
})
export class FermeAlimentationComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  modalRationOuvert = signal<boolean>(false);
  enregistrementEnCours = signal<boolean>(false);
  formRation!: FormGroup;

  readonly typeAlimentLabels: Record<TypeAliment, string> = {
    fourrage_vert: 'Fourrage vert fauché',
    foin: 'Foin sec conditionné',
    concentre: 'Aliment concentré / Tourteau',
    mineraux_cmv: 'Minéraux & CMV'
  };

  readonly lotAnimalLabels: Record<LotAnimal, string> = {
    laitieres: 'Vaches en lactation (x7)',
    genisses: 'Jeunes génisses (x2)',
    taureaux: 'Taureaux reproducteurs (x4)',
    tous: 'Troupeau entier (x13)'
  };

  constructor() {
    this.formRation = this.fb.group({
      lotCible: ['laitieres', [Validators.required]],
      typeAliment: ['fourrage_vert', [Validators.required]],
      nomAliment: ['', [Validators.required]],
      quantiteKg: [50, [Validators.required, Validators.min(1)]],
      coutFCFA: [12500, [Validators.required, Validators.min(0)]],
      distribuePar: [this.fermeService.profilActif().nom, [Validators.required]],
      observations: ['']
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalRationOuvert()) {
      this.fermerModalRation();
    }
  }

  getLibelleLot(lot: LotAnimal): string {
    return this.lotAnimalLabels[lot] || lot;
  }

  getLibelleAliment(type: TypeAliment): string {
    return this.typeAlimentLabels[type] || type;
  }

  ouvrirModalRation(): void {
    this.formRation.patchValue({
      lotCible: 'laitieres',
      typeAliment: 'fourrage_vert',
      nomAliment: '',
      quantiteKg: 50,
      coutFCFA: 12500,
      distribuePar: this.fermeService.profilActif().nom,
      observations: ''
    });
    this.modalRationOuvert.set(true);
  }

  fermerModalRation(): void {
    this.modalRationOuvert.set(false);
  }

  soumettreRation(): void {
    if (this.formRation.invalid || this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const val = this.formRation.value;
    const auj = new Date().toISOString().split('T')[0];

    this.fermeService.ajouterRation({
      date: auj,
      lotCible: val.lotCible,
      typeAliment: val.typeAliment,
      nomAliment: val.nomAliment,
      quantiteKg: Number(val.quantiteKg),
      coutFCFA: Number(val.coutFCFA),
      distribuePar: val.distribuePar,
      observations: val.observations || undefined
    });

    this.notificationService.afficherToast(`Distribution de ration enregistrée (${val.quantiteKg} kg) !`);
    this.fermerModalRation();
    setTimeout(() => this.enregistrementEnCours.set(false), 250);
  }
}
