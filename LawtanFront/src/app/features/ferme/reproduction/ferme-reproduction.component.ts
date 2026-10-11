import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TypeActeReproduction, ResultatGestation } from '../models/reproduction.model';

@Component({
  selector: 'app-ferme-reproduction',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ferme-reproduction.component.html',
  styleUrl: './ferme-reproduction.component.css'
})
export class FermeReproductionComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  readonly Math = Math;

  modalReproductionOuvert = signal<boolean>(false);
  enregistrementEnCours = signal<boolean>(false);
  formReproduction!: FormGroup;

  readonly typeActeReproductionLabels: Record<TypeActeReproduction, string> = {
    chaleur: 'Chaleur détectée',
    insemination_ia: 'Insémination artificielle (IA)',
    saillie_naturelle: 'Saillie naturelle',
    diagnostic_gestation: 'Diagnostic de gestation (DG)',
    tarissement: 'Tarissement programmé',
    velage: 'Vêlage / Mise bas'
  };

  constructor() {
    this.formReproduction = this.fb.group({
      animalId: ['', [Validators.required]],
      typeActe: ['insemination_ia', [Validators.required]],
      taureauOuSemence: ['', [Validators.required]],
      resultatGestation: ['incertain'],
      technicienNom: [this.fermeService.profilActif().nom, [Validators.required]],
      observations: ['']
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalReproductionOuvert()) {
      this.fermerModalReproduction();
    }
  }

  getLibelleActe(type: TypeActeReproduction): string {
    return this.typeActeReproductionLabels[type] || type;
  }

  ouvrirModalReproduction(): void {
    const premiereFemelle = this.fermeService.animaux().find(a => a.sexe === 'femelle');
    this.formReproduction.patchValue({
      animalId: premiereFemelle ? premiereFemelle.id : '',
      typeActe: 'insemination_ia',
      taureauOuSemence: 'Maximus du Jura (Semence Sexée 90%)',
      resultatGestation: 'incertain',
      technicienNom: this.fermeService.profilActif().nom,
      observations: ''
    });
    this.modalReproductionOuvert.set(true);
  }

  fermerModalReproduction(): void {
    this.modalReproductionOuvert.set(false);
  }

  soumettreReproduction(): void {
    if (this.formReproduction.invalid || this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const val = this.formReproduction.value;
    const animal = this.fermeService.animaux().find(a => a.id === val.animalId);
    if (!animal) return;

    const auj = new Date();
    const aujStr = auj.toISOString().split('T')[0];

    // Calcul agronomique rigoureux de la gestation bovine : 283 jours de gestation, tarissement à J-60
    let dateVelage: string | undefined = undefined;
    let dateTarissement: string | undefined = undefined;
    let joursRestants: number | undefined = undefined;

    if (val.typeActe === 'insemination_ia' || val.typeActe === 'saillie_naturelle' || val.typeActe === 'diagnostic_gestation') {
      const dVelage = new Date(auj.getTime() + 283 * 24 * 60 * 60 * 1000);
      const dTarissement = new Date(auj.getTime() + 223 * 24 * 60 * 60 * 1000);
      dateVelage = dVelage.toISOString().split('T')[0];
      dateTarissement = dTarissement.toISOString().split('T')[0];
      joursRestants = 283;
    }

    this.fermeService.ajouterActeReproduction({
      date: aujStr,
      animalId: animal.id,
      animalNom: animal.nom,
      animalBoucle: animal.boucleId,
      typeActe: val.typeActe,
      taureauOuSemence: val.taureauOuSemence || undefined,
      technicienNom: val.technicienNom,
      resultatGestation: val.typeActe === 'diagnostic_gestation' ? val.resultatGestation : (val.typeActe === 'insemination_ia' ? 'incertain' : undefined),
      datePrevisionnelleVelage: dateVelage,
      datePrevisionnelleTarissement: dateTarissement,
      joursRestantsAvantVelage: joursRestants,
      observations: val.observations || undefined
    });

    this.notificationService.afficherToast(`Acte de reproduction enregistré pour ${animal.nom} !`);
    this.fermerModalReproduction();
    setTimeout(() => this.enregistrementEnCours.set(false), 250);
  }
}
