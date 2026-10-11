import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TypeIntervention, SoinVeterinaire } from '../models/sante.model';

@Component({
  selector: 'app-ferme-sante',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ferme-sante.component.html',
  styleUrl: './ferme-sante.component.css'
})
export class FermeSanteComponent implements OnInit {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  modalSoinOuvert = signal<boolean>(false);
  enregistrementEnCours = signal<boolean>(false);
  filtreStatut = signal<'tous' | 'en_cours' | 'resolu'>('tous');
  formSoin!: FormGroup;

  readonly typeInterventionLabels: Record<TypeIntervention, string> = {
    traitement: 'Traitement curatif',
    vaccination: 'Vaccination',
    vermifuge: 'Déparasitage',
    visite_routine: 'Visite de routine',
    mise_bas: 'Mise bas',
    alerte_bouvier: 'Alerte bouvier'
  };

  readonly soinsEnCours = computed(() => {
    return this.fermeService.soinsVeterinaires().filter(s => s.statut === 'en_cours');
  });

  readonly soinsFiltres = computed(() => {
    const list = this.fermeService.soinsVeterinaires();
    const f = this.filtreStatut();
    if (f === 'en_cours') {
      return list.filter(s => s.statut === 'en_cours');
    }
    if (f === 'resolu') {
      return list.filter(s => s.statut === 'resolu');
    }
    return list;
  });

  constructor() {
    this.formSoin = this.fb.group({
      animalId: ['', [Validators.required]],
      type: ['traitement', [Validators.required]],
      diagnostic: ['', [Validators.required, Validators.minLength(4)]],
      medicament: [''],
      delaiAttenteLaitJours: [0, [Validators.min(0), Validators.max(30)]],
      coutFCFA: [15000, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['animalId']) {
        this.ouvrirModalSoin(params['animalId']);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalSoinOuvert()) {
      this.fermerModalSoin();
    }
  }

  getLibelleIntervention(type: TypeIntervention): string {
    return this.typeInterventionLabels[type] || type;
  }

  ouvrirModalSoin(preselectedAnimalId?: string): void {
    const id = preselectedAnimalId || this.fermeService.animaux()[0]?.id || '';
    this.formSoin.patchValue({
      animalId: id,
      type: 'traitement',
      diagnostic: '',
      medicament: '',
      delaiAttenteLaitJours: 0,
      coutFCFA: 15000
    });
    this.modalSoinOuvert.set(true);
  }

  fermerModalSoin(): void {
    this.modalSoinOuvert.set(false);
  }

  soumettreSoin(): void {
    if (this.formSoin.invalid || this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const val = this.formSoin.value;
    const animal = this.fermeService.animaux().find(a => a.id === val.animalId);
    if (!animal) return;

    const auj = new Date();
    const dateFinDelai = val.delaiAttenteLaitJours > 0
      ? new Date(auj.getTime() + val.delaiAttenteLaitJours * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    this.fermeService.ajouterSoin({
      date: auj.toISOString().split('T')[0],
      animalId: animal.id,
      animalNom: animal.nom,
      animalBoucle: animal.boucleId,
      type: val.type,
      diagnostic: val.diagnostic,
      medicament: val.medicament || undefined,
      delaiAttenteLaitJours: Number(val.delaiAttenteLaitJours) || 0,
      dateFinDelaiLait: dateFinDelai,
      veterinaireNom: this.fermeService.profilActif().nom,
      coutFCFA: Number(val.coutFCFA),
      statut: Number(val.delaiAttenteLaitJours) > 0 ? 'en_cours' : 'resolu'
    });

    this.notificationService.afficherToast(`Intervention vétérinaire enregistrée pour ${animal.nom} !`);
    this.fermerModalSoin();
    setTimeout(() => this.enregistrementEnCours.set(false), 250);
  }
}
