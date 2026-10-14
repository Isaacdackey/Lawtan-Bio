import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { PastoralDividerComponent } from '../../../shared/components/pastoral-divider/pastoral-divider.component';

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
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule, PublicHeaderComponent, PublicFooterComponent, PastoralDividerComponent],
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.css'
})
export class BoutiqueComponent {
  private router = inject(Router);

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
      id: 'beurre-fermier-250g',
      name: 'Beurre Fermier Pur Baratté — Pain 250g',
      category: 'beurre',
      categoryLabel: 'Beurre Fermier',
      priceFcfa: 2500,
      unit: 'Pain de beurre 250g',
      description: 'Baratté à la ferme à partir de crème fraîche crue entière. Arôme subtil de noisette et texture fondante à souhait.',
      image: '/images/product-beurre.jpg',
      badge: '100% Crème Entière',
      available: true,
      nutrition: '82% Matière Grasse noble • Vitamines A & E',
      conservation: 'À conserver au frais à 4°C (DLC 30 jours)'
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

  cart = signal<CartItem[]>([]);
  isCartDrawerOpen = signal<boolean>(false);
  orderToastMessage = signal<string | null>(null);

  totalCartCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  totalCartAmountFcfa = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.quantity * item.product.priceFcfa), 0);
  });

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const q = this.searchQuery().toLowerCase().trim();

    return this.products.filter(p => {
      const matchCat = (cat === 'all') || (p.category === cat);
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  });

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

    this.showToast(`${product.name} ajouté au panier !`);
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
    this.router.navigate(['/devis']);
  }

  getWhatsAppOrderLink(): string {
    const items = this.cart();
    if (items.length === 0) return 'https://wa.me/221771234567';

    let msg = `Bonjour Ferme LAWTAN BIO,\nJe souhaite passer une commande directe de produits laitiers :\n\n`;
    items.forEach(i => {
      msg += `• ${i.quantity}x ${i.product.name} (${(i.product.priceFcfa * i.quantity).toLocaleString('fr-FR')} FCFA)\n`;
    });
    msg += `\nTotal estimé : ${this.totalCartAmountFcfa().toLocaleString('fr-FR')} FCFA\nMerci de me confirmer la livraison !`;

    return `https://wa.me/221771234567?text=${encodeURIComponent(msg)}`;
  }

  private showToast(msg: string): void {
    this.orderToastMessage.set(msg);
    setTimeout(() => {
      this.orderToastMessage.set(null);
    }, 3500);
  }
}
