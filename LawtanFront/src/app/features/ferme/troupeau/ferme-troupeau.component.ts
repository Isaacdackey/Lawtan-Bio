import { Component, inject, signal, computed, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Animal, Pedigree } from '../models/animal.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ferme-troupeau',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ferme-troupeau.component.html',
  styleUrl: './ferme-troupeau.component.css'
})
export class FermeTroupeauComponent implements OnInit, AfterViewInit, OnDestroy {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  private perfChartInstance: Chart | null = null;

  // Filtres & Recherche
  herdFilter = signal<string>('all');
  searchQuery = signal<string>('');
  herdCurrentPage = signal<number>(1);
  herdPageSize = signal<number>(8);

  // Modales
  isAnimalModalOpen = signal<boolean>(false);
  isNewAnimalModalOpen = signal<boolean>(false);
  isEditAnimalModalOpen = signal<boolean>(false);
  activeModalTab = signal<string>('infos');
  selectedAnimal = signal<any | null>(null);

  // Formulaire Nouvel Animal
  newAnimalForm = {
    internalId: '',
    name: '',
    earTagNumber: '',
    gender: 'FEMALE',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: new Date().toISOString().split('T')[0],
    weight: 480,
    imageUrl: '',
    notes: ''
  };
  newAnimalFather = '';
  newAnimalFatherEarTag = '';
  newAnimalMother = '';
  newAnimalMotherEarTag = '';

  // Formulaire Édition Animal
  editAnimalForm = {
    internalId: '',
    name: '',
    earTagNumber: '',
    gender: 'FEMALE',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: '',
    weight: 480,
    imageUrl: '',
    notes: ''
  };

  // Liste enrichie des animaux
  animals = computed(() => {
    return this.fermeService.animaux().map(a => {
      const isFemale = a.sexe === 'femelle';
      const isLactation = a.statut === 'lactation';
      const isYoung = (a.statut as string) === 'jeune' || (a.statut as string) === 'genisse';
      const isMale = a.sexe === 'male' || a.statut === 'reproducteur';
      
      let category = 'MILKING_COW';
      let categoryLabel = 'Vache Laitière en Production';
      if (isYoung) {
        category = 'HEIFER_YOUNG';
        categoryLabel = 'Jeune Génisse';
      } else if (isMale) {
        category = 'MALE_BULL';
        categoryLabel = 'Taureau Reproducteur';
      }

      let status = 'HEALTHY';
      if (a.enTraitementMedical) status = 'FEVER_TREATMENT';
      else if (a.statut === 'tarie') status = 'PREGNANT';
      else if (a.derniereTraiteLitres && a.derniereTraiteLitres > 20) status = 'EXCELLENT';

      return {
        id: a.id,
        internalId: a.boucleId,
        earTagNumber: a.boucleId,
        name: a.nom,
        gender: a.sexe === 'femelle' ? 'FEMALE' : 'MALE',
        genderLabel: a.sexe === 'femelle' ? 'Femelle' : 'Mâle',
        category,
        categoryLabel,
        breed: a.race,
        birthDate: a.dateNaissance,
        weight: a.poidsKg,
        temperature: a.temperatureC,
        status,
        dailyMilkYield: a.derniereTraiteLitres || (isLactation ? 15.5 : 0),
        cullingRecommended: (a.observations || '').toLowerCase().includes('réforme'),
        cowMasterAlert: a.enTraitementMedical ? 'Sous surveillance médicale (Délai d\'attente)' : null,
        daysOpen: a.pedigree?.historiqueGestationNb ? a.pedigree.historiqueGestationNb * 60 : 120,
        reproStatus: isLactation ? 'En lactation régulière' : (a.statut === 'tarie' ? 'Tarie — Gestation avancée' : 'Suivi standard'),
        originLot: 'Ferme LAWTAN BIO',
        imageUrl: a.photoUrl,
        pedigree: {
          fatherName: a.pedigree?.pere?.nom || 'Champion Pur',
          fatherBreed: a.pedigree?.pere?.race || 'Holstein USA',
          motherName: a.pedigree?.mere?.nom || 'Laitière Élite',
          motherBreed: a.pedigree?.mere?.race || 'Holstein NL',
          subjectNote: a.race + ' • Sélection Lait'
        },
        fatherId: a.pedigree?.pere?.identifiant,
        motherId: a.pedigree?.mere?.identifiant
      };
    });
  });

  // Animaux filtrés
  filteredAnimals = computed(() => {
    const f = this.herdFilter();
    const q = this.searchQuery().toLowerCase().trim();

    return this.animals().filter(a => {
      let matchesCat = true;
      if (f === 'prod' || f === 'vache') {
        matchesCat = a.category === 'MILKING_COW';
      } else if (f === 'genisse' || f === 'jeune') {
        matchesCat = a.category === 'HEIFER_YOUNG';
      } else if (f === 'male') {
        matchesCat = a.category === 'MALE_BULL';
      } else if (f === 'veau') {
        matchesCat = a.category === 'HEIFER_YOUNG';
      } else if (f === 'reforme') {
        matchesCat = a.cullingRecommended;
      }

      let matchesSearch = true;
      if (q) {
        const name = (a.name || '').toLowerCase();
        const id = (a.internalId || '').toLowerCase();
        const breed = (a.breed || '').toLowerCase();
        matchesSearch = name.includes(q) || id.includes(q) || breed.includes(q);
      }

      return matchesCat && matchesSearch;
    });
  });

  // Pagination
  totalHerdPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredAnimals().length / this.herdPageSize()));
  });

  paginatedAnimals = computed(() => {
    const start = (this.herdCurrentPage() - 1) * this.herdPageSize();
    return this.filteredAnimals().slice(start, start + this.herdPageSize());
  });

  herdPageNumbers = computed(() => {
    return Array.from({ length: this.totalHerdPages() }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['animal']) {
        this.openAnimalModal(params['animal']);
      }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.perfChartInstance) this.perfChartInstance.destroy();
  }

  filterHerd(category: string): void {
    this.herdFilter.set(category);
    this.herdCurrentPage.set(1);
  }

  setHerdPage(page: number): void {
    this.herdCurrentPage.set(page);
  }

  nextHerdPage(): void {
    if (this.herdCurrentPage() < this.totalHerdPages()) {
      this.herdCurrentPage.update(p => p + 1);
    }
  }

  prevHerdPage(): void {
    if (this.herdCurrentPage() > 1) {
      this.herdCurrentPage.update(p => p - 1);
    }
  }

  // Modale Animal
  openAnimalModal(internalId?: string): void {
    if (!internalId) return;
    const animal = this.animals().find(a => a.internalId === internalId);
    if (animal) {
      this.selectedAnimal.set(animal);
      this.activeModalTab.set('infos');
      this.isAnimalModalOpen.set(true);
      setTimeout(() => this.initPerfModalChart(animal), 200);
    }
  }

  closeAnimalModal(): void {
    this.isAnimalModalOpen.set(false);
  }

  switchModalTab(tab: string): void {
    this.activeModalTab.set(tab);
    if (tab === 'lactation' && this.selectedAnimal()) {
      setTimeout(() => this.initPerfModalChart(this.selectedAnimal()), 150);
    }
  }

  getAnimalById(id?: string): any | undefined {
    if (!id) return undefined;
    return this.animals().find(a => a.internalId === id);
  }

  getAnimalEvents(internalId?: string): any[] {
    if (!internalId) return [];
    const events: any[] = [];

    // Ajouter des événements simulés réalistes
    events.push({
      date: '2026-10-05',
      time: '08h30',
      typeLabel: 'Contrôle Gestation',
      badgeClass: 'badge-blue',
      operator: 'Dr. Ibrahima Ndiaye',
      details: 'Échographie de contrôle DG+ à 60 jours',
      result: 'Confirmé',
      observations: 'Fœtus viable, développement régulier conforme'
    });

    events.push({
      date: '2026-09-12',
      time: '07h15',
      typeLabel: 'Insémination (IA)',
      badgeClass: 'badge-purple',
      operator: 'Fallou Mbacké',
      details: 'Semence Holstein Pure Sélection Laitière USA',
      result: 'Conforme',
      observations: 'Insémination sur chaleurs naturelles franches'
    });

    events.push({
      date: '2026-07-20',
      time: '10h00',
      typeLabel: 'Vaccination CBPP',
      badgeClass: 'badge-green',
      operator: 'Dr. Ibrahima Ndiaye',
      details: 'Rappel péripneumonie contagieuse bovine',
      result: 'Terminé',
      observations: 'Délai d\'attente lait : 0 jour (conforme bio)'
    });

    return events;
  }

  private initPerfModalChart(animal: any): void {
    const canvas = document.getElementById('perfModalChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.perfChartInstance) this.perfChartInstance.destroy();

    const baseYield = animal.dailyMilkYield || 18.0;
    this.perfChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['J30', 'J60', 'J90', 'J120', 'J150 (Auj.)', 'J180 (Prévu)', 'J210 (Prévu)'],
        datasets: [{
          label: `Courbe de Lactation — ${animal.name} (${animal.internalId})`,
          data: [Math.max(8, baseYield - 3), baseYield + 1, baseYield + 3, baseYield + 1, baseYield, Math.max(8, baseYield - 2), Math.max(6, baseYield - 4)],
          borderColor: '#2C77B0',
          backgroundColor: 'rgba(44, 119, 176, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  // Modale Nouvel Animal
  openNewAnimalModal(): void {
    const nextNum = String(this.animals().length + 1).padStart(3, '0');
    this.newAnimalForm = {
      internalId: `SN-LTN-${nextNum}`,
      name: '',
      earTagNumber: `SN-LTN-${nextNum}`,
      gender: 'FEMALE',
      category: 'MILKING_COW',
      status: 'HEALTHY',
      breed: 'Holstein Pure',
      birthDate: new Date().toISOString().split('T')[0],
      weight: 480,
      imageUrl: '',
      notes: ''
    };
    this.newAnimalFather = '';
    this.newAnimalFatherEarTag = '';
    this.newAnimalMother = '';
    this.newAnimalMotherEarTag = '';
    this.isNewAnimalModalOpen.set(true);
  }

  submitNewAnimal(): void {
    if (!this.newAnimalForm.name.trim()) {
      this.notificationService.afficherToast('Veuillez renseigner le nom de l\'animal.');
      return;
    }
    
    const newAnimal: Animal = {
      id: 'a-' + Date.now(),
      boucleId: this.newAnimalForm.internalId,
      nom: this.newAnimalForm.name,
      sexe: this.newAnimalForm.gender === 'FEMALE' ? 'femelle' : 'male',
      race: this.newAnimalForm.breed,
      statut: this.newAnimalForm.category === 'MILKING_COW' ? 'lactation' : (this.newAnimalForm.category === 'MALE_BULL' ? 'reproducteur' : 'jeune'),
      dateNaissance: this.newAnimalForm.birthDate,
      poidsKg: this.newAnimalForm.weight,
      temperatureC: 38.5,
      derniereTraiteLitres: this.newAnimalForm.category === 'MILKING_COW' ? 14 : 0,
      enTraitementMedical: false,
      photoUrl: this.newAnimalForm.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
      pedigree: {
        pere: this.newAnimalFather ? { nom: this.newAnimalFather, identifiant: this.newAnimalFatherEarTag, race: this.newAnimalForm.breed } : undefined,
        mere: this.newAnimalMother ? { nom: this.newAnimalMother, identifiant: this.newAnimalMotherEarTag, race: this.newAnimalForm.breed } : undefined,
        typeInsemination: 'artificielle',
        historiqueGestationNb: 0
      },
      observations: this.newAnimalForm.notes
    };

    this.fermeService.animaux.update(list => [...list, newAnimal]);
    this.notificationService.afficherToast(`Animal ${newAnimal.nom} (${newAnimal.boucleId}) enregistré avec succès !`);
    this.isNewAnimalModalOpen.set(false);
  }

  // Modale Édition
  openEditAnimalModal(animal: any): void {
    this.editAnimalForm = {
      internalId: animal.internalId,
      name: animal.name,
      earTagNumber: animal.earTagNumber,
      gender: animal.gender,
      category: animal.category,
      status: animal.status,
      breed: animal.breed,
      birthDate: animal.birthDate,
      weight: animal.weight,
      imageUrl: animal.imageUrl,
      notes: ''
    };
    this.isEditAnimalModalOpen.set(true);
  }

  submitEditAnimal(): void {
    this.fermeService.animaux.update(list => list.map(a => {
      if (a.boucleId === this.editAnimalForm.internalId) {
        return {
          ...a,
          nom: this.editAnimalForm.name,
          race: this.editAnimalForm.breed,
          poidsKg: this.editAnimalForm.weight
        };
      }
      return a;
    }));
    this.notificationService.afficherToast(`Fiche de ${this.editAnimalForm.name} mise à jour avec succès !`);
    this.isEditAnimalModalOpen.set(false);
    if (this.selectedAnimal()) {
      this.openAnimalModal(this.editAnimalForm.internalId);
    }
  }

  handlePhotoUpload(event: Event, target: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (target === 'new') this.newAnimalForm.imageUrl = url;
        else this.editAnimalForm.imageUrl = url;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(target: 'new' | 'edit'): void {
    if (target === 'new') this.newAnimalForm.imageUrl = '';
    else this.editAnimalForm.imageUrl = '';
  }
}
