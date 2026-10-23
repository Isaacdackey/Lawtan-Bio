import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

export type DevisNature = 'laitier';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  devisCategory = signal<DevisNature>('laitier');
  cartSourceData = signal<{ items: any[]; totalAmount: number } | null>(null);
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

    // Récupération dynamique du panier transféré depuis la boutique
    let cartPayload: { items: any[]; totalAmount: number } | null = null;
    if (typeof history !== 'undefined' && history.state && history.state.items) {
      cartPayload = {
        items: history.state.items,
        totalAmount: history.state.totalAmount || 0
      };
    }

    if (!cartPayload && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem('lawtan_devis_cart');
        if (raw) {
          cartPayload = JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }

    if (cartPayload && Array.isArray(cartPayload.items) && cartPayload.items.length > 0) {
      this.cartSourceData.set(cartPayload);
      this.setCategory('laitier');
      this.applyCartData(cartPayload);
    }
  }

  readonly produitsLaitiers = [
    { id: 'lait-frais', label: 'Lait frais entier pasteurisé (Bouteilles 1L & Bidons 5L)' },
    { id: 'lait-caille', label: 'Lait caillé traditionnel "Sow" LAWTAN (Pots 500g & Seaux 2L/5L)' },
    { id: 'beurre-artisanal', label: 'Beurre fermier & Crème fraîche barattée (Pains 250g/500g)' },
    { id: 'fromages-fermiers', label: 'Fromages fermiers & Yaourts brassés bio' },
    { id: 'son-de-riz', label: 'Son de riz bio pour alimentation du bétail (Sacs de 50 kg)' },
    { id: 'paille-foin', label: 'Boîte de paille & foin compressé (Fourrage & Litière)' },
    { id: 'partenariat-distributeur', label: 'Approvisionnement régulier CHR & Élevage (Gros volumes)' }
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
      titre: 'Chaîne du Froid 4°C Garantie',
      desc: 'Transport réfrigéré certifié et respect strict des normes sanitaires.',
      icon: 'truck'
    }
  ];

  readonly faqsDevis = [
    {
      question: 'Quel est le délai pour recevoir mon devis chiffré ?',
      reponse: 'Notre service commercial vous transmet une estimation officielle par email ou WhatsApp sous 24h ouvrées après réception de vos critères.'
    },
    {
      question: 'Quels sont les volumes minimaux pour une commande en gros ?',
      reponse: 'Nos tarifs grossistes s’appliquent dès 20 litres de lait frais, ou à partir de cartons de 12 unités pour le lait caillé et les fromages.'
    },
    {
      question: 'Livrez-vous les produits laitiers en dehors de la région de Saint-Louis ?',
      reponse: 'Nous livrons quotidiennement l’axe Saint-Louis - Richard-Toll - Dagana, et organisons des expéditions réfrigérées régulières vers Dakar pour les commandes professionnelles (CHR).'
    }
  ];

  faqOuverte = signal<number | null>(0);

  constructor() {
    this.devisForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      organization: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,18}$/)]],
      email: ['', [Validators.required, Validators.email]],
      locality: ['', [Validators.required]],

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

  applyCartData(cartPayload: { items: any[]; totalAmount: number }): void {
    const items = cartPayload.items;
    if (!items || items.length === 0) return;

    let matchedProduct = 'lait-frais';
    const firstCat = items[0]?.product?.category;
    const firstId = items[0]?.product?.id;
    if (firstId === 'son-de-riz-50kg') {
      matchedProduct = 'son-de-riz';
    } else if (firstId === 'boite-paille-foin') {
      matchedProduct = 'paille-foin';
    } else if (firstCat === 'fourrage') {
      matchedProduct = 'son-de-riz';
    } else if (firstCat === 'caille') {
      matchedProduct = 'lait-caille';
    } else if (firstCat === 'beurre') {
      matchedProduct = 'beurre-artisanal';
    } else if (firstCat === 'fromage') {
      matchedProduct = 'partenariat-distributeur';
    }

    const totalQty = items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0);
    const hasOnlyQuoteItems = items.every((i: any) => i.product?.onQuoteOnly || i.product?.priceFcfa === 0);

    const messageLines = [
      hasOnlyQuoteItems
        ? 'Demande de devis pour les produits de la ferme sélectionnés :'
        : 'Demande de devis sur mesure issue de mon panier boutique :',
      ...items.map((i: any) => {
        const isQuote = i.product?.onQuoteOnly || i.product?.priceFcfa === 0;
        const priceText = isQuote ? '(Sur devis)' : `(${((i.product?.priceFcfa || 0) * (i.quantity || 1)).toLocaleString('fr-FR')} FCFA)`;
        return `• ${i.quantity}x ${i.product?.name || 'Produit'} ${priceText}`;
      }),
      ...(cartPayload.totalAmount > 0
        ? [`Total estimé : ${cartPayload.totalAmount.toLocaleString('fr-FR')} FCFA`]
        : ['Tarif : Chiffrage sur devis selon volume et lieu de livraison']),
      '',
      'Je souhaite obtenir un devis personnalisé incluant les modalités de conditionnement, de conservation et de livraison.'
    ];

    const qtyString = cartPayload.totalAmount > 0
      ? `${totalQty} unité${totalQty > 1 ? 's' : ''} (${cartPayload.totalAmount.toLocaleString('fr-FR')} FCFA)`
      : `${totalQty} unité${totalQty > 1 ? 's' : ''} (Tarif sur devis)`;

    this.devisForm.patchValue({
      dairyProduct: matchedProduct,
      estimatedQuantity: qtyString,
      deliveryFrequency: 'ponctuel',
      message: messageLines.join('\n')
    });
  }

  clearCartSource(): void {
    this.cartSourceData.set(null);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem('lawtan_devis_cart');
      } catch {
        // ignore
      }
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
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          sessionStorage.removeItem('lawtan_devis_cart');
        } catch {
          // ignore
        }
      }
    }, 600);
  }

  resetForm(): void {
    this.clearCartSource();
    this.devisForm.reset({
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
