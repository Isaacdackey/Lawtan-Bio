import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

export type DevisNature = 'prestation' | 'laitier';

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PublicHeaderComponent,
    PublicFooterComponent,
    RevealDirective
  ],
  templateUrl: './devis.component.html',
  styleUrl: './devis.component.css'
})
export class DevisComponent implements OnInit {
  devisCategory = signal<DevisNature>('prestation');
  isSubmitting = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  submittedData = signal<any>(null);

  devisForm: FormGroup;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
    }
  }

  readonly servicesAgricoles = [
    { id: 'labour', label: 'Labour mécanisé profond', unit: 'Hectare' },
    { id: 'offsettage', label: 'Offsettage / Pulvérisation', unit: 'Hectare' },
    { id: 'biyonnage', label: 'Biyonnage & Préparation des sols', unit: 'Hectare' },
    { id: 'moissonnage', label: 'Moissonnage-battage du riz & céréales', unit: 'Hectare / Heure' },
    { id: 'pressage', label: 'Pressage de balles de paille / fourrage', unit: 'Balle / Hectare' }
  ];

  readonly produitsLaitiers = [
    { id: 'lait-frais', label: 'Lait frais entier pasteurisé (Bouteilles 1L & Bidons 5L)' },
    { id: 'lait-caille', label: 'Lait caillé traditionnel "Sow" LAWTAN (Pots 500g & Seaux 2L/5L)' },
    { id: 'beurre-artisanal', label: 'Beurre fermier & Crème fraîche barattée (Pains 250g/500g)' },
    { id: 'partenariat-distributeur', label: 'Approvisionnement régulier CHR (Hôtels, Restaurants, Boutiques)' }
  ];

  readonly engagementsDevis = [
    {
      titre: 'Devis Gratuit & Sans Engagement',
      desc: 'Étude personnalisée et chiffrage clair sans aucuns frais cachés.',
      icon: 'file-text'
    },
    {
      titre: 'Tarifs Direct Exploitation',
      desc: 'Prix directs producteur sans intermédiaire pour particuliers et professionnels.',
      icon: 'tag'
    },
    {
      titre: 'Chaîne du Froid & Matériel Neuf',
      desc: 'Transport réfrigéré à 4°C et tracteurs/moissonneuses entretenus.',
      icon: 'truck'
    }
  ];

  readonly faqsDevis = [
    {
      question: 'Quel est le délai pour recevoir mon devis chiffré ?',
      reponse: 'Notre service commercial vous transmet une estimation officielle par email ou WhatsApp sous 24h ouvrées après réception de vos critères.'
    },
    {
      question: 'Le carburant et le chauffeur sont-ils inclus dans les travaux agricoles ?',
      reponse: 'Oui, toutes nos prestations mécanisées (labour, moissonnage, pressage) comprennent l’opérateur qualifié et le carburant, sauf accord spécifique sur-mesure.'
    },
    {
      question: 'Livrez-vous les produits laitiers en dehors de la région de Saint-Louis ?',
      reponse: 'Nous livrons quotidiennement l’axe Saint-Louis - Richard-Toll - Dagana, et organisons des expéditions réfrigérées régulières vers Dakar pour les commandes professionnelles (CHR).'
    }
  ];

  faqOuverte = signal<number | null>(0);

  constructor(private fb: FormBuilder) {
    this.devisForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      organization: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,18}$/)]],
      email: ['', [Validators.required, Validators.email]],
      locality: ['', [Validators.required]],

      agriculturalService: ['labour'],
      workVolume: ['', [Validators.min(1)]],
      volumeUnit: ['hectare'],
      desiredDate: [''],

      dairyProduct: ['lait-frais'],
      estimatedQuantity: [''],
      deliveryFrequency: ['ponctuel'],

      message: ['', [Validators.required, Validators.minLength(10)]],
      termsAccepted: [true, [Validators.requiredTrue]]
    });
  }

  setCategory(cat: DevisNature): void {
    this.devisCategory.set(cat);
  }

  toggleFaq(index: number): void {
    if (this.faqOuverte() === index) {
      this.faqOuverte.set(null);
    } else {
      this.faqOuverte.set(index);
    }
  }

  onSubmit(): void {
    if (this.devisForm.invalid) {
      this.devisForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.submittedData.set({
        category: this.devisCategory(),
        ...this.devisForm.value,
        submissionDate: new Date()
      });
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);
    }, 600);
  }

  resetForm(): void {
    this.devisForm.reset({
      agriculturalService: 'labour',
      volumeUnit: 'hectare',
      dairyProduct: 'lait-frais',
      deliveryFrequency: 'ponctuel',
      termsAccepted: true
    });
    this.isSubmitted.set(false);
    this.submittedData.set(null);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.devisForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
