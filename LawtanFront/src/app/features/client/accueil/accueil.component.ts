import { Component, AfterViewInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private observer?: IntersectionObserver;
  currentYear: number = new Date().getFullYear();

  // Produits laitiers phares — Sans émojis, avec typage clair
  produits = [
    {
      id: 'lait-frais',
      titre: 'Lait Frais Entier Pasteurisé',
      categorie: 'Produits Frais',
      description: 'Lait entier 100% naturel, issu de nos vaches sélectionnées. Pasteurisation douce préservant tous les nutriments essentiels.',
      format: 'Bouteilles 1L & Bidons 5L',
      badge: 'Bestseller',
      disponible: true
    },
    {
      id: 'lait-caille',
      titre: 'Lait Caillé Traditionnel (Sow)',
      categorie: 'Fermenté & Terroir',
      description: 'Préparé selon le savoir-faire pastoral sénégalais avec un ferment lactique doux et une texture crémeuse inimitable.',
      format: 'Pots 500g & Seaux 2L/5L',
      badge: 'Recette Traditionnelle',
      disponible: true
    },
    {
      id: 'beurre-artisanal',
      titre: 'Beurre Fermier & Crème Fraîche',
      categorie: 'Dérivés Laitiers',
      description: 'Baratté à la ferme à partir de crème fraîche entière. Saveur authentique et onctueuse pour la table et la pâtisserie.',
      format: 'Pains de 250g & 500g',
      badge: 'Pur Terroir',
      disponible: true
    },
    {
      id: 'yaourts-fromages',
      titre: 'Fromages & Yaourts Fermiers',
      categorie: 'Innovation Laitière',
      description: 'Nouvelle ligne de transformation locale en cours de lancement. Produits sains sans conservateurs.',
      format: 'Formats individuels & familiaux',
      badge: 'Bientôt disponible',
      disponible: false
    }
  ];

  // Piliers d'excellence qualité LAWTAN — Sans émojis
  piliers = [
    {
      id: 'veterinaire',
      titre: 'Élevage Respectueux & Suivi Vétérinaire',
      description: 'Cheptel surveillé quotidiennement par des spécialistes en santé animale avec un suivi génétique et sanitaire rigoureux.'
    },
    {
      id: 'alimentation',
      titre: 'Alimentation Locale & Équilibrée',
      description: 'Fourrage de qualité et rations équilibrées pour garantir un lait riche en protéines et matières grasses nobles.'
    },
    {
      id: 'traite',
      titre: 'Traite Moderne & Chaîne du Froid',
      description: 'Installations de traite hygiéniques et refroidissement immédiat en cuve isotherme pour préserver la fraîcheur optimale.'
    },
    {
      id: 'tracabilite',
      titre: 'Circuit Court & Traçabilité Complète',
      description: 'De l’étable à votre table, chaque lot est tracé pour garantir une transparence totale et soutenir l’économie locale.'
    }
  ];

  // Indicateurs clés d'impact
  stats = [
    { label: 'Litres produits / jour', value: '1 250+' },
    { label: 'Têtes de bétail suivies', value: '85+' },
    { label: 'Pureté & Naturel', value: '100%' },
    { label: 'Satisfaction clients', value: '98%' }
  ];

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const elementsToReveal = this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
    if (!elementsToReveal || elementsToReveal.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      elementsToReveal.forEach((el: Element) => {
        el.setAttribute('data-revealed', 'true');
        el.classList.add('is-revealed');
      });
      return;
    }

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.setAttribute('data-revealed', 'true');
          target.classList.add('is-revealed');
          obs.unobserve(target);

          // Réinitialisation immédiate du transition-delay après l'apparition pour des hovers instantanés
          setTimeout(() => {
            target.style.transitionDelay = '0s';
          }, 850);
        }
      });
    }, options);

    elementsToReveal.forEach((element: Element) => this.observer?.observe(element));
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
