import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, inject, signal, computed, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { PastoralDividerComponent } from '../../../shared/components/pastoral-divider/pastoral-divider.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { RevealService } from '../../../shared/services/reveal.service';

export interface SliderSlide {
  id: number;
  image: string;
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  ctaText: string;
  ctaTarget: string;
  secondaryCtaText: string;
  secondaryCtaTarget: string;
  metricLabel: string;
  metricValue: string;
}

export interface MarketProduct {
  id: string;
  name: string;
  category: 'lait' | 'caille' | 'beurre' | 'fromage';
  categoryLabel: string;
  priceFcfa: number;
  unit: string;
  description: string;
  image: string;
  badge: string;
  available: boolean;
  nutrition: string;
  conservation: string;
}

export interface CartItem {
  product: MarketProduct;
  quantity: number;
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule, PublicHeaderComponent, PublicFooterComponent, PastoralDividerComponent, RevealDirective],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit, AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private revealService = inject(RevealService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sliderInterval?: any;

  currentYear: number = new Date().getFullYear();

  // === STATISTIQUES ANIMÉES (TABULAR NUMS) ===
  countLait = signal<number>(0);
  countTetes = signal<number>(0);
  countSolaire = signal<number>(0);
  countPurete = signal<number>(0);
  hasAnimatedStats = false;

  // === SLIDER HERO STATE ===
  currentSlide = signal<number>(0);
  isSliderPaused = signal<boolean>(false);

  slides: SliderSlide[] = [
    {
      id: 0,
      image: '/images/VacheHolsteindevantfermelaitièremoderne.png',
      badge: 'Élevage Bovin d\'Élite • Cheptel Sélectionné',
      title: 'L\'excellence laitière sénégalaise,',
      titleHighlight: 'un cheptel d\'élite nourri au respect du vivant.',
      description: 'Vaches laitières de haute lignée génétique élevées en plein air à Dagana, alimentation fourragère naturelle sans intrants chimiques et suivi vétérinaire individualisé pour un lait noble et d\'une richesse exceptionnelle.',
      ctaText: 'Découvrir Notre Élevage',
      ctaTarget: 'apropos',
      secondaryCtaText: 'Nos Engagements Qualité',
      secondaryCtaTarget: 'pourquoi',
      metricValue: '100% Naturel',
      metricLabel: 'Bien-Être Animal & Pâturage'
    },
    {
      id: 1,
      image: '/images/imagelaitquicoule.png',
      badge: 'Traite Mécanique & Haute Technologie',
      title: 'Une laiterie moderne de pointe,',
      titleHighlight: 'pureté absolue, hygiène et chaîne du froid 4°C.',
      description: 'Du pis de nos vaches à nos cuves inox réfrigérées sous vide : traite mécanisée automatisée, pasteurisation douce préservant les nutriments essentiels et zéro contact manuel pour une sécurité alimentaire irréprochable.',
      ctaText: 'Notre Processus de Traite',
      ctaTarget: 'pourquoi',
      secondaryCtaText: 'Demander un Devis Pro',
      secondaryCtaTarget: 'devis',
      metricValue: '4°C Immédiat',
      metricLabel: 'Refroidissement Garanti'
    },
    {
      id: 2,
      image: '/images/Produits laitiers frais à la ferme.png',
      badge: 'Fraîcheur Fermière • Du Pré à Votre Table',
      title: 'Savourez la générosité de nos produits,',
      titleHighlight: 'lait frais entier, Sow onctueux, yaourts & fromages.',
      description: 'Retrouvez l\'authenticité et la saveur pure du terroir du Walo : lait entier pasteurisé en bouteille verre, lait caillé Sow traditionnel, yaourts brassés et fromages affinés livrés avec fraîcheur garantie.',
      ctaText: 'Commander à la Boutique',
      ctaTarget: 'boutique',
      secondaryCtaText: 'Commander via WhatsApp',
      secondaryCtaTarget: 'whatsapp',
      metricValue: '100% Frais du Jour',
      metricLabel: 'Traite Matinale Quotidienne'
    }
  ];

  // === À PROPOS / NOTRE HISTOIRE (INSPIRATION ACCORDÉON & RÉVÉLATION COULEUR) ===
  activeAboutTab = signal<'histoire' | 'cheptel' | 'solaire' | 'equipe' | null>('histoire');

    activeHistoryPhoto = computed(() => {
    switch (this.activeAboutTab()) {
      case 'histoire': return '/images/VacheHolsteindevantfermelaitièremoderne.png';
      case 'cheptel':  return '/images/produits-laitiers-frais-ferme.png';
      case 'solaire':  return '/images/traite-lait-frais.jpg';
      case 'equipe':   return '/images/imagelaitquicoule.png';
      default:         return '/images/VacheHolsteindevantfermelaitièremoderne.png';
    }
  });
  
  activeHistoryBadge = computed(() => {
    switch (this.activeAboutTab()) {
      case 'histoire': return 'Ferme Modèle • Terroir Sénégalais';
      case 'cheptel': return 'Guzérat & Métisse • Bien-Être Animal';
      case 'solaire': return 'Centrale Solaire • Chaîne du Froid 4°C';
      case 'equipe': return '8 Professionnels • Rigueur & Passion';
      default: return 'Ferme LAWTAN BIO';
    }
  });

  toggleAboutChapter(tab: 'histoire' | 'cheptel' | 'solaire' | 'equipe'): void {
    if (this.activeAboutTab() === tab) {
      this.activeAboutTab.set(null);
    } else {
      this.activeAboutTab.set(tab);
    }
  }

  // === MARKETPLACE PRODUCTS ===
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  products: MarketProduct[] = [
    {
      id: 'lait-frais-1l',
      name: 'Lait Frais Entier Pasteurisé 1L',
      category: 'lait',
      categoryLabel: 'Lait Frais',
      priceFcfa: 1200,
      unit: 'Bouteille en verre 1L',
      description: 'Lait entier 100% naturel issu de notre traite du matin. Pasteurisation douce préservant vitamines A, D et calcium.',
      image: '/images/product-lait-frais.jpg',
      badge: 'Bestseller du Matin',
      available: true,
      nutrition: '3.8% Matière Grasse • 3.2% Protéines',
      conservation: 'À conserver entre 2°C et 4°C (DLC 5 jours)'
    },
    {
      id: 'lait-frais-5l',
      name: 'Lait Frais Entier — Bidon Familial 5L',
      category: 'lait',
      categoryLabel: 'Lait Frais',
      priceFcfa: 5500,
      unit: 'Bidon scellé 5L',
      description: 'Format économique pour grandes familles, restaurants, pâtisseries et écoles. Traite du jour garantie.',
      image: '/images/product-lait-frais.jpg',
      badge: 'Format Éco & Restauration',
      available: true,
      nutrition: 'Richesse naturelle intégrale • Zéro écrémage',
      conservation: 'À conserver à 4°C dans son bidon hermétique'
    },
    {
      id: 'lait-caille-500g',
      name: 'Lait Caillé Artisanal (Sow) — Pot 500g',
      category: 'caille',
      categoryLabel: 'Lait Caillé (Sow)',
      priceFcfa: 1500,
      unit: 'Pot en grès 500g',
      description: 'Préparé selon la tradition pastorale sénégalaise avec des ferments lactiques nobles. Texture onctueuse et goût velouté incomparable.',
      image: '/images/product-lait-caille.jpg',
      badge: 'Recette Traditionnelle',
      available: true,
      nutrition: 'Probiotiques naturels • Digestion facile',
      conservation: 'À conserver au frais à 4°C (DLC 10 jours)'
    },
    {
      id: 'lait-caille-2l',
      name: 'Lait Caillé Traditionnel (Sow) — Seau 2L',
      category: 'caille',
      categoryLabel: 'Lait Caillé (Sow)',
      priceFcfa: 5000,
      unit: 'Seau alimentaire 2L',
      description: 'Idéal pour les cérémonies, familles nombreuses ou consommation quotidienne de Thiakry et desserts traditionnels.',
      image: '/images/product-lait-caille.jpg',
      badge: 'Générosité Terroir',
      available: true,
      nutrition: 'Texture veloutée riche en ferments actifs',
      conservation: 'À conserver à 4°C (DLC 10 jours)'
    },
    {
      id: 'yaourt-brasse-bio-nature',
      name: 'Yaourt Brassé Bio Nature (Pot 125g)',
      category: 'caille',
      categoryLabel: 'Yaourt & Fermenté',
      priceFcfa: 500,
      unit: 'Pot 125g',
      description: 'Yaourt ferme et onctueux élaboré à partir de lait bio frais de nos vaches avec ferments lactiques vivants.',
      image: '/images/product-lait-caille.jpg',
      badge: 'Bio Certifié',
      available: true,
      nutrition: 'Ferments lactiques vivants • Riche en calcium',
      conservation: 'À conserver au frais à 4°C (DLC 21 jours)'
    },
    {
      id: 'fromage-fermier-artisanal',
      name: 'Fromage Frais Fermier aux Herbes du Terroir',
      category: 'fromage',
      categoryLabel: 'Innovation Fromagère',
      priceFcfa: 3500,
      unit: 'Meulette fermière 300g',
      description: 'Nouveauté issue de notre atelier de transformation fromagère. Affiné délicatement avec des aromates cultivés à la ferme.',
      image: '/images/product-fromage.jpg',
      badge: 'Bientôt Disponible',
      available: false,
      nutrition: 'Riche en calcium et protéines nobles',
      conservation: 'En cours de certification & lancement'
    }
  ];

  // === SHOPPING CART / RESERVATION STATE ===
  cart = signal<CartItem[]>([]);
  isCartDrawerOpen = signal<boolean>(false);
  orderToastMessage = signal<string | null>(null);

  totalCartCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  totalCartAmountFcfa = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.quantity * item.product.priceFcfa), 0);
  });

  // Niveau dynamique de lait dans le bidon fermier (en %)
  churnMilkLevelPercent = computed(() => {
    const count = this.totalCartCount();
    if (count === 0) return 0;
    return Math.min(32 + (count * 16), 90);
  });

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const q = this.searchQuery().toLowerCase().trim();

    return this.products.filter(p => {
      const matchCat = cat === 'all' || p.category === cat;
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  });

  ngOnInit(): void {
    this.startSliderAutoplay();
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => this.scrollTo(fragment), 200);
      }
    });
  }

  scrollTo(target: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!target) return;
    if (target === 'devis' || target === 'contact' || target === 'login' || target === 'boutique' || target === 'marketplace') {
      const dest = (target === 'marketplace') ? 'boutique' : target;
      this.router.navigate(['/' + dest]);
      return;
    }
    let attempts = 0;
    const checkAndScroll = () => {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < 20) {
        attempts++;
        setTimeout(checkAndScroll, 60);
      }
    };
    checkAndScroll();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.setupStatsAnimation();
    this.setupHeroParallax();
  }

  ngOnDestroy(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  // --- Slider Controls ---
  startSliderAutoplay(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
    this.sliderInterval = setInterval(() => {
      if (!this.isSliderPaused()) {
        this.nextSlide(false);
      }
    }, 12000);
  }

  private restartAutoplay(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
    this.startSliderAutoplay();
  }

  nextSlide(isManual: boolean = true): void {
    this.currentSlide.update(curr => (curr + 1) % this.slides.length);
    if (isManual) {
      this.restartAutoplay();
    }
  }

  prevSlide(): void {
    this.currentSlide.update(curr => (curr - 1 + this.slides.length) % this.slides.length);
    this.restartAutoplay();
  }

  goToSlide(idx: number): void {
    this.currentSlide.set(idx);
    this.restartAutoplay();
  }

  setSliderPaused(paused: boolean): void {
    this.isSliderPaused.set(paused);
  }

  getSlideBackground(image: string): string {
    return `url('${encodeURI(image)}')`;
  }

  // --- Marketplace Cart Operations ---
  addToCart(product: MarketProduct): void {
    if (!product.available) return;

    this.cart.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...items, { product, quantity: 1 }];
      }
    });
  }

  updateQuantity(productId: string, delta: number): void {
    this.cart.update(items => {
      return items.map(i => {
        if (i.product.id === productId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter((i): i is CartItem => i !== null);
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update(items => items.filter(i => i.product.id !== productId));
  }

  toggleCartDrawer(): void {
    this.isCartDrawerOpen.update(v => !v);
  }

  closeCartDrawer(): void {
    this.isCartDrawerOpen.set(false);
  }

  goToDevis(): void {
    this.closeCartDrawer();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    this.router.navigate(['/devis']).then(() => {
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
    });
  }

  getWhatsAppOrderLink(): string {
    const items = this.cart();
    if (items.length === 0) return 'https://wa.me/221777657656';

    let msg = `Bonjour Ferme LAWTAN BIO,\nJe souhaite passer une commande directe de produits laitiers :\n\n`;
    items.forEach(i => {
      msg += `• ${i.quantity}x ${i.product.name} (${i.product.priceFcfa * i.quantity} FCFA)\n`;
    });
    msg += `\nTotal estimé : ${this.totalCartAmountFcfa().toLocaleString('fr-FR')} FCFA\nMerci de me confirmer la livraison !`;

    return `https://wa.me/221777657656?text=${encodeURIComponent(msg)}`;
  }

  private showToast(msg: string): void {
    this.orderToastMessage.set(msg);
    setTimeout(() => {
      this.orderToastMessage.set(null);
    }, 3500);
  }

  private setupStatsAnimation(): void {
    const statsCard = this.el.nativeElement.querySelector('.slide-visual-col');
    if (!statsCard) return;

    this.revealService.observe(statsCard, () => {
      if (this.hasAnimatedStats) return;
      this.hasAnimatedStats = true;

      this.ngZone.runOutsideAngular(() => {
        const duration = 1400; // ms
        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic: 1 - pow(1 - p, 3)
          const easeOut = 1 - Math.pow(1 - progress, 3);

          this.ngZone.run(() => {
            this.countLait.set(Math.round(easeOut * 1250));
            this.countTetes.set(Math.round(easeOut * 9));
            this.countSolaire.set(Math.round(easeOut * 100));
            this.countPurete.set(Math.round(easeOut * 98));
          });

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      });
    });
  }

  private setupHeroParallax(): void {
    const heroSection = this.el.nativeElement.querySelector('.hero-slider-section');
    if (!heroSection) return;

    this.ngZone.runOutsideAngular(() => {
      heroSection.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = heroSection.getBoundingClientRect();
        const mouseXRatio = ((e.clientX - rect.left) / rect.width) - 0.5; // -0.5 à +0.5
        // Parallax horizontal léger clampé à max 24px
        const parallaxX = mouseXRatio * 24;
        heroSection.style.setProperty('--parallax-x', `${parallaxX}px`);
      }, { passive: true });
    });
  }
}
