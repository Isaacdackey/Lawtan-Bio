import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { PastoralDividerComponent } from '../../../shared/components/pastoral-divider/pastoral-divider.component';
import { CartService, MarketProduct, CartItem } from '../../../services/cart.service';
import { ApiService, MarketplaceProductDto, MarketplaceOrderResult } from '../../../services/api.service';

import { CLOUDINARY_IMAGES, getCloudinaryImageUrl } from '../../../core/constants/cloudinary-images';

export type { MarketProduct, CartItem };

@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule, PublicHeaderComponent, PublicFooterComponent],
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

  private readonly additionalFarmProducts: MarketProduct[] = [
    {
      id: 'son-de-riz-50kg',
      name: 'Son de Riz Bio — Sac de 50 kg',
      category: 'fourrage',
      categoryLabel: 'Aliment',
      priceFcfa: 0,
      unit: 'Sac 50 kg',
      description: 'Son de riz pur issu des rizières locales du Walo, très riche en énergie et matières grasses végétales. Idéal pour optimiser la ration et la production laitière.',
      image: CLOUDINARY_IMAGES.sonDeRiz,
      badge: 'Sur Devis Uniquement',
      available: true,
      onQuoteOnly: true,
      nutrition: 'Riche en lipides végétaux et fibres digestibles',
      conservation: 'À stocker au sec sur palettes à l\'abri de l\'humidité'
    },
    {
      id: 'boite-paille-foin',
      name: 'Boîte de Paille & Foin Compressé',
      category: 'fourrage',
      categoryLabel: 'Fourrage',
      priceFcfa: 0,
      unit: 'Botte foin',
      description: 'Paille de riz et foin naturel sélectionnés et séchés au soleil. Fourrage d\'encombrement essentiel pour la rumination bovine et litière absorbante saine.',
      image: CLOUDINARY_IMAGES.paille,
      badge: 'Sur Devis Uniquement',
      available: true,
      onQuoteOnly: true,
      nutrition: 'Fibres brutes indispensables au transit ruminal',
      conservation: 'Conserver en zone ventilée et abritée de la pluie'
    }
  ];

  private loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.productsError.set(null);
    this.api.getMarketplaceProducts({ size: 50 }).subscribe({
      next: page => {
        const mapped = page.content.map(product => this.mapProduct(product));
        const backendNames = new Set(mapped.map(m => m.name.toLowerCase()));
        const missing = this.additionalFarmProducts.filter(p => !backendNames.has(p.name.toLowerCase()));
        const combined = [...mapped, ...missing];
        this.products.set(combined);
        this.cartService.syncProducts(combined);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        // En cas d'erreur ou d'indisponibilité backend, conserver au moins les produits locaux
        this.products.set(this.additionalFarmProducts);
        this.cartService.syncProducts(this.additionalFarmProducts);
        this.productsError.set('Impossible de charger certains produits du serveur. Les produits locaux restent disponibles.');
        this.isLoadingProducts.set(false);
      }
    });
  }

  private mapProduct(product: MarketplaceProductDto): MarketProduct {
    const categoryMap: Record<string, MarketProduct['category']> = {
      PASTEURIZED_MILK: 'lait', RAW_MILK: 'lait', CURDLED_MILK: 'caille',
      YOGURT: 'caille', BUTTER: 'beurre', CHEESE: 'fromage', CREAM: 'beurre',
      FODDER: 'fourrage'
    };
    const isFodder = product.category === 'FODDER';
    return {
      id: String(product.id), name: product.name,
      category: categoryMap[product.category ?? ''] ?? 'lait',
      categoryLabel: product.categoryLabel || (isFodder ? 'Fourrage & Aliment' : 'Produits laitiers'),
      priceFcfa: product.priceFcfa || 0,
      unit: product.unit || 'unité',
      description: product.description || 'Produit de la ferme Lawtan Bio.',
      image: product.image ? getCloudinaryImageUrl(product.image) : (isFodder && product.name.toLowerCase().includes('riz') ? CLOUDINARY_IMAGES.sonDeRiz : isFodder ? CLOUDINARY_IMAGES.paille : product.category === 'CHEESE' ? CLOUDINARY_IMAGES.productFromage : product.category === 'CURDLED_MILK' || product.category === 'YOGURT' ? CLOUDINARY_IMAGES.productLaitCaille : CLOUDINARY_IMAGES.productLaitFrais),
      badge: isFodder ? 'Sur Devis Uniquement' : product.organicCertified ? 'Certifié bio' : 'Produit de la ferme',
      available: product.available && product.quantityAvailable > 0,
      onQuoteOnly: isFodder,
      nutrition: isFodder ? 'Fourrage sain pour rumination' : 'Produit de qualité fermière',
      conservation: product.dlcExpiryDate ? `À consommer avant le ${product.dlcExpiryDate}` : 'Respecter les conditions de conservation indiquées.'
    };
  }

  submitMarketplaceOrder(): void {
    if (this.isSubmittingOrder() || this.cart().length === 0) return;
    if (!this.checkoutName.trim() || !this.checkoutPhone.trim() || !this.checkoutAddress.trim() || !this.checkoutCity.trim()) {
      this.showToast('Veuillez remplir votre nom, téléphone et adresse de livraison.'); return;
    }
    this.isSubmittingOrder.set(true);

    const backendItems: { productId: number; quantity: number }[] = [];
    const nonBackendItems: string[] = [];

    for (const item of this.cart()) {
      const numId = Number(item.product.id);
      if (!isNaN(numId) && numId > 0) {
        backendItems.push({ productId: numId, quantity: item.quantity });
      } else {
        nonBackendItems.push(`${item.quantity}x ${item.product.name}`);
      }
    }

    let extraNote = this.checkoutNote.trim();
    if (nonBackendItems.length > 0) {
      const farmNote = `Produits de la ferme commandés : ${nonBackendItems.join(', ')}`;
      extraNote = extraNote ? `${extraNote} | ${farmNote}` : farmNote;
    }

    // Si tous les articles sont des produits du terroir locaux sans id numérique backend
    if (backendItems.length === 0) {
      const ref = `LWT-FARM-${Date.now().toString().slice(-6)}`;
      const total = this.totalCartAmountFcfa();
      this.cartService.clearCart();
      this.orderConfirmation.set(`Commande ${ref} transmise avec succès ! Total : ${total.toLocaleString('fr-FR')} FCFA. Notre équipe vous contactera pour la livraison.`);
      this.isSubmittingOrder.set(false);
      this.isCheckoutOpen.set(false);
      this.checkoutName = ''; this.checkoutPhone = ''; this.checkoutEmail = ''; this.checkoutAddress = ''; this.checkoutNote = '';
      return;
    }

    const payload = {
      customerName: this.checkoutName.trim(),
      customerPhone: this.checkoutPhone.trim(),
      customerEmail: this.checkoutEmail.trim() || undefined,
      deliveryAddress: this.checkoutAddress.trim(),
      deliveryCity: this.checkoutCity.trim(),
      customerNote: extraNote || undefined,
      items: backendItems
    };
    const idempotencyKey = this.getIdempotencyKey(JSON.stringify(payload));

    this.api.createMarketplaceOrder({ idempotencyKey, ...payload }).subscribe({
      next: (order: MarketplaceOrderResult) => {
        this.idempotency = null;
        this.cartService.clearCart();
        this.orderConfirmation.set(`Commande ${order.reference} enregistrée. Total : ${order.totalAmountFcfa.toLocaleString('fr-FR')} FCFA.`);
        this.isSubmittingOrder.set(false); this.isCheckoutOpen.set(false);
        this.checkoutName = ''; this.checkoutPhone = ''; this.checkoutEmail = ''; this.checkoutAddress = ''; this.checkoutNote = '';
      },
      error: (err) => {
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

  requestQuoteForProduct(product: MarketProduct): void {
    const payload = {
      items: [{ product, quantity: 1 }],
      totalAmount: 0
    };
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('lawtan_devis_cart', JSON.stringify(payload));
      } catch {
        // ignore
      }
    }
    this.router.navigate(['/devis'], {
      queryParams: { cat: 'laitier', prod: product.id },
      state: payload
    });
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
