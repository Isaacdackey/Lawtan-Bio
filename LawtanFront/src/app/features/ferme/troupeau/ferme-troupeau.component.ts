import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { Animal, StatutAnimal } from '../models/animal.model';

@Component({
  selector: 'app-ferme-troupeau',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ferme-troupeau.component.html',
  styleUrl: './ferme-troupeau.component.css'
})
export class FermeTroupeauComponent {
  fermeService = inject(FermeMockService);
  private router = inject(Router);

  filtreStatut = signal<string>('tous');
  rechercheAnimal = signal<string>('');
  animalSelectionne = signal<Animal | null>(null);

  animauxFiltres = computed(() => {
    let liste = this.fermeService.animaux();
    const filtre = this.filtreStatut();
    const recherche = this.rechercheAnimal().toLowerCase().trim();

    if (filtre !== 'tous') {
      liste = liste.filter(a => a.statut === filtre);
    }

    if (recherche) {
      liste = liste.filter(a => 
        a.nom.toLowerCase().includes(recherche) || 
        a.boucleId.toLowerCase().includes(recherche) ||
        a.race.toLowerCase().includes(recherche)
      );
    }

    return liste;
  });

  getBadgeStatut(statut: StatutAnimal): { label: string; class: string } {
    switch (statut) {
      case 'lactation':
        return { label: 'En lactation', class: 'badge-lactation' };
      case 'tarie':
        return { label: 'Tarie (Repos)', class: 'badge-tarie' };
      case 'jeune':
        return { label: 'Jeune génisse', class: 'badge-jeune' };
      case 'reproducteur':
        return { label: 'Taureau', class: 'badge-male' };
      default:
        return { label: statut, class: 'badge-neutre' };
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.animalSelectionne()) {
      this.fermerPedigree();
    }
  }

  ouvrirPedigree(animal: Animal): void {
    this.animalSelectionne.set(animal);
  }

  fermerPedigree(): void {
    this.animalSelectionne.set(null);
  }

  reinitialiserFiltres(): void {
    this.filtreStatut.set('tous');
    this.rechercheAnimal.set('');
  }

  ouvrirModalSoin(animalId: string): void {
    this.router.navigate(['/ferme', 'sante'], { queryParams: { animalId } });
  }

  naviguerTraite(): void {
    this.router.navigate(['/ferme', 'production']);
  }
}
