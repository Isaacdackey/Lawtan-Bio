import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { PastoralDividerComponent } from '../../../shared/components/pastoral-divider/pastoral-divider.component';
import { CartService, MarketProduct, CartItem } from '../../../services/cart.service';
import { ApiService, MarketplaceProductDto, MarketplaceOrderResult } from '../../../services/api.service';

export type { MarketProduct, CartItem };

@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule, PublicHeaderComponent, PublicFooterComponent, PastoralDividerComponent],
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.css'
})
export class BoutiqueComponent {
  private router = inject(Router);
  private api = inject(ApiService);
  cartService = inject(CartService);

  get cart() { return this.cartService.cart; }
  get isCartDrawerOpen() { return this.cartService.isCartDrawerOpen; }
  get totalCartCount() { return this.cartService.totalCartCount; }
  get totalCartAmountFcfa() { return this.cartService.totalCartAmountFcfa; }

  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  products = signal<MarketProduct[]>([]);
  isLoadingProducts = signal<boolean>(true);
  productsError = signal<string | null>(null);
  isCheckoutOpen = signal<boolean>(false);
  isSubmittingOrder = signal<boolean>(false);
  checkoutName = '';
  checkoutPhone = '';
  checkoutEmail = '';
  checkoutAddress = '';
  checkoutCity = 'Dakar';
  checkoutNote = '';
  orderConfirmation = signal<string | null>(null);

  constructor() { this.loadProducts(); }

  private idempotency: { fingerprint: string; key: string } | null = null;

  private getIdempotencyKey(fingerprint: string): string {
    if (this.idempotency?.fingerprint !== fingerprint) {
      const key = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `lwt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      this.idempotency = { fingerprint, key };
    }
    return this.idempotency.key;
  }

  private loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.productsError.set(null);
    this.api.getMarketplaceProducts({ size: 50 }).subscribe({
      next: page => {
        const mapped = page.content.map(product => this.mapProduct(product));
        this.products.set(mapped);
        this.cartService.syncProducts(mapped);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.productsError.set('Impossible de charger les produits. Vérifiez que le backend est démarré.');
        this.isLoadingProducts.set(false);
      }
    });
  }

  private mapProduct(product: MarketplaceProductDto): MarketProduct {
    const categoryMap: Record<string, MarketProduct['category']> = {
      PASTEURIZED_MILK: 'lait', RAW_MILK: 'lait', CURDLED_MILK: 'caille',
      YOGURT: 'caille', BUTTER: 'beurre', CHEESE: 'fromage', CREAM: 'beurre'
    };
    return {
      id: String(product.id), name: product.name,
      category: categoryMap[product.category ?? ''] ?? 'lait',
      categoryLabel: product.categoryLabel || 'Produits laitiers',
      priceFcfa: product.priceFcfa, unit: product.unit || 'unité',
      description: product.description || 'Produit laitier de la ferme Lawtan Bio.',
      image: product.image || '/images/product-lait-frais.jpg',
      badge: product.organicCertified ? 'Certifié bio' : 'Produit de la ferme',
      available: product.available && product.quantityAvailable > 0,
      nutrition: 'Produit laitier de la ferme',
      conservation: product.dlcExpiryDate ? `À consommer avant le ${product.dlcExpiryDate}` : 'Respecter les conditions de conservation indiquées.'
    };
  }

  submitMarketplaceOrder(): void {
    if (this.isSubmittingOrder() || this.cart().length === 0) return;
    if (!this.checkoutName.trim() || !this.checkoutPhone.trim() || !this.checkoutAddress.trim() || !this.checkoutCity.trim()) {
      this.showToast('Veuillez remplir votre nom, téléphone et adresse de livraison.'); return;
    }
    this.isSubmittingOrder.set(true);

    const items = this.cart().map(item => ({ productId: Number(item.product.id), quantity: item.quantity }));
    const payload = {
      customerName: this.checkoutName.trim(),
      customerPhone: this.checkoutPhone.trim(),
      customerEmail: this.checkoutEmail.trim() || undefined,
      deliveryAddress: this.checkoutAddress.trim(),
      deliveryCity: this.checkoutCity.trim(),
      customerNote: this.checkoutNote.trim() || undefined,
      items
    };
    const idempotencyKey = this.getIdempotencyKey(JSON.stringify(payload));

    this.api.createMarketplaceOrder({ idempotencyKey, ...payload }).subscribe({
      next: (order: MarketplaceOrderResult) => {
        this.idempotency = null; // commande créée : la prochaine aura une nouvelle clé
        this.cartService.clearCart();
        this.orderConfirmation.set(`Commande ${order.reference} enregistrée. Total : ${order.totalAmountFcfa.toLocaleString('fr-FR')} FCFA.`);
        this.isSubmittingOrder.set(false); this.isCheckoutOpen.set(false);
        this.checkoutName = ''; this.checkoutPhone = ''; this.checkoutEmail = ''; this.checkoutAddress = ''; this.checkoutNote = '';
      },
      error: (err) => {
        // On garde la clé : si la commande avait été créée avant la coupure, le retry renvoie la même commande.
        this.showToast(err?.error?.message || 'Commande impossible. Vérifiez la connexion puis réessayez.');
        this.isSubmittingOrder.set(false); this.loadProducts();
      }
    });
  }

  orderToastMessage = signal<string | null>(null);

  filteredProducts = computed(() => {
    const list = this.products();
    const cat = this.selectedCategory();
    const q = this.searchQuery().toLowerCase().trim();

    return list.filter(p => {
      const matchCat = (cat === 'all') || (p.category === cat);
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  });

  addToCart(product: MarketProduct): void {
    if (!product.available) return;
    this.cartService.addToCart(product);
    this.showToast(`${product.name} ajouté au panier !`);
  }

  updateQuantity(productId: string, delta: number): void {
    this.cartService.updateQuantity(productId, delta);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  toggleCartDrawer(): void {
    this.cartService.toggleCartDrawer();
  }

  closeCartDrawer(): void {
    this.cartService.closeCartDrawer();
  }

  goToDevis(): void {
    const items = this.cart();
    this.closeCartDrawer();

    if (items.length > 0) {
      const payload = {
        items,
        totalAmount: this.totalCartAmountFcfa()
      };
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          sessionStorage.setItem('lawtan_devis_cart', JSON.stringify(payload));
        } catch {
          // ignore
        }
      }
      this.router.navigate(['/devis'], {
        queryParams: { cat: 'laitier', fromCart: '1' },
        state: payload
      });
    } else {
      this.router.navigate(['/devis'], {
        queryParams: { cat: 'laitier' }
      });
    }
  }

  getWhatsAppOrderLink(): string {
    const items = this.cart();
    if (items.length === 0) return 'https://wa.me/221777657656';

    let msg = `Bonjour Ferme LAWTAN BIO,\nJe souhaite passer une commande directe de produits laitiers :\n\n`;
    items.forEach(i => {
      msg += `• ${i.quantity}x ${i.product.name} (${(i.product.priceFcfa * i.quantity).toLocaleString('fr-FR')} FCFA)\n`;
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
}
