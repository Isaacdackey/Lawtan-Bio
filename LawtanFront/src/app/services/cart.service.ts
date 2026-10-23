import { Injectable, signal, computed } from '@angular/core';

export interface MarketProduct {
  id: string;
  name: string;
  category: 'lait' | 'caille' | 'beurre' | 'fromage' | 'fourrage';
  categoryLabel: string;
  priceFcfa: number;
  unit: string;
  description: string;
  image: string;
  badge: string;
  available: boolean;
  onQuoteOnly?: boolean;
  nutrition: string;
  conservation: string;
}

export interface CartItem {
  product: MarketProduct;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart = signal<CartItem[]>([]);
  isCartDrawerOpen = signal<boolean>(false);

  totalCartCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  totalCartAmountFcfa = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.quantity * item.product.priceFcfa), 0);
  });

  constructor() {
    this.loadFromStorage();
  }

  toggleCartDrawer(): void {
    this.isCartDrawerOpen.update(v => !v);
  }

  openCartDrawer(): void {
    this.isCartDrawerOpen.set(true);
  }

  closeCartDrawer(): void {
    this.isCartDrawerOpen.set(false);
  }

  syncProducts(products: MarketProduct[]): void {
    const byId = new Map(products.map(product => [product.id, product]));
    this.cart.update(items => items
      .filter(item => byId.has(item.product.id))
      .map(item => ({ ...item, product: byId.get(item.product.id)! })));
    this.saveToStorage();
  }

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
    this.saveToStorage();
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
    this.saveToStorage();
  }

  removeFromCart(productId: string): void {
    this.cart.update(items => items.filter(i => i.product.id !== productId));
    this.saveToStorage();
  }

  clearCart(): void {
    this.cart.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('lawtan_cart', JSON.stringify(this.cart()));
      } catch (e) {
        console.error(e);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem('lawtan_cart');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cart.set(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
