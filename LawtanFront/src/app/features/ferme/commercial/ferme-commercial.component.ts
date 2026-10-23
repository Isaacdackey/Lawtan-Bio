import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService, MarketplaceOrderResult } from '../../../services/api.service';

import { ProductStock } from '../../../models/transformation.model';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  issueDate: string;
  dueDate: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
  totalAmountFcfa: number;
  paidAmountFcfa: number;
  remainingAmountFcfa: number;
  paymentMethod: string;
  status: 'PAID' | 'ISSUED' | 'OVERDUE';
}

export interface CustomerItem {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  ordersCount: number;
  totalSpentFcfa: number;
}

export interface PaymentItem {
  id: string;
  transactionRef: string;
  invoiceNumber: string;
  customerName: string;
  amountFcfa: number;
  paymentDate: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-ferme-commercial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ferme-commercial.component.html',
  styleUrl: './ferme-commercial.component.css'
})
export class FermeCommercialComponent implements OnInit {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  apiService = inject(ApiService);

  activeCommercialSubTab = signal<'invoices' | 'customers' | 'payments' | 'marketplace' | 'products'>('invoices');
  productStocks = signal<ProductStock[]>([]);
  productStocksLoading = signal<boolean>(false);
  stockFilterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  activeStocksCount = computed(() => this.productStocks().filter(s => (s.quantityAvailable || 0) > 0).length);
  archivedStocksCount = computed(() => this.productStocks().filter(s => !(s.quantityAvailable > 0)).length);

  filteredProductStocks = computed(() => {
    const list = this.productStocks();
    const filter = this.stockFilterStatus();
    if (filter === 'ACTIVE') return list.filter(s => (s.quantityAvailable || 0) > 0);
    if (filter === 'ARCHIVED') return list.filter(s => !(s.quantityAvailable > 0));
    return list;
  });

  isEditStockModalOpen = signal<boolean>(false);
  isNewStockModalOpen = signal<boolean>(false);
  selectedStockForEdit = signal<ProductStock | null>(null);

  stockForm = {
    id: undefined as number | undefined,
    productName: '',
    quantityAvailable: 0,
    unit: 'Bouteille 1L',
    unitPriceFcfa: 1000,
    dlcExpiryDate: '',
    storageLocation: 'Chambre Froide Laiterie (+4°C)',
    isOrganicCertified: true,
    imageUrl: ''
  };

  handleProductPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Upload direct sur Cloudinary dans le dossier produits
      this.apiService.uploadMedia(file, 'produits').subscribe({
        next: (res) => {
          this.stockForm.imageUrl = res.url;
        },
        error: () => {
          // Fallback aperçu local si offline
          const reader = new FileReader();
          reader.onload = (e) => {
            this.stockForm.imageUrl = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeProductPhoto(): void {
    this.stockForm.imageUrl = '';
  }
  marketplaceOrders = signal<MarketplaceOrderResult[]>([]);
  marketplaceOrdersLoading = signal<boolean>(false);
  marketplaceOrdersError = signal<string | null>(null);
  private api = inject(ApiService);
  invoiceFilterStatus = signal<string>('ALL');
  invoicesSearchTerm = signal<string>('');

  private readonly orderFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED'];

  readonly orderStatusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PREPARING: 'En préparation',
    READY_FOR_DELIVERY: 'Prête à livrer',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée'
  };

  /** Statut actuel + étape suivante + annulation (même règle que le backend). */
  allowedOrderStatuses(current: string): string[] {
    if (current === 'DELIVERED' || current === 'CANCELLED') return [current];
    const i = this.orderFlow.indexOf(current);
    const next = i >= 0 && i < this.orderFlow.length - 1 ? [this.orderFlow[i + 1]] : [];
    return [current, ...next, 'CANCELLED'];
  }


  // Modales
  isNewInvoiceModalOpen = signal<boolean>(false);
  isNewCustomerModalOpen = signal<boolean>(false);
  isRecordPaymentModalOpen = signal<boolean>(false);

  selectedInvoiceForPayment = signal<InvoiceItem | null>(null);

  // Données Factures
  invoices = signal<InvoiceItem[]>([
    {
      id: 'inv-1',
      invoiceNumber: 'FAC-2026-1001',
      customerName: 'Hôtel Terrou-Bi Dakar',
      customerPhone: '+221 77 123 45 67',
      issueDate: '2026-10-10',
      dueDate: '2026-10-25',
      items: [
        { productName: 'Lait Frais Bio Pasteuris\u00e9 (Bouteille 1L)', quantity: 150, unitPrice: 1200 },
        { productName: 'Fromage Gouda Fermier Bio', quantity: 20, unitPrice: 8500 }
      ],
      totalAmountFcfa: 350000,
      paidAmountFcfa: 350000,
      remainingAmountFcfa: 0,
      paymentMethod: 'Virement Bancaire',
      status: 'PAID'
    },
    {
      id: 'inv-2',
      invoiceNumber: 'FAC-2026-1002',
      customerName: 'Épicerie Fine Bio Almadies',
      customerPhone: '+221 78 456 78 90',
      issueDate: '2026-10-11',
      dueDate: '2026-10-18',
      items: [
        { productName: 'Lait Frais Bio (1L)', quantity: 80, unitPrice: 1200 },
        { productName: 'Yaourt Nature Bio (Lot de 4)', quantity: 30, unitPrice: 2200 },
        { productName: 'Beurre Traditionnel Bio (250g)', quantity: 25, unitPrice: 2500 }
      ],
      totalAmountFcfa: 224500,
      paidAmountFcfa: 224500,
      remainingAmountFcfa: 0,
      paymentMethod: 'Wave Business',
      status: 'PAID'
    },
    {
      id: 'inv-3',
      invoiceNumber: 'FAC-2026-1003',
      customerName: 'Restaurant Le Lagon 1',
      customerPhone: '+221 77 987 65 43',
      issueDate: '2026-10-12',
      dueDate: '2026-10-19',
      items: [
        { productName: 'Lait Cru Bio (Bidon Inox 20L)', quantity: 5, unitPrice: 16000 },
        { productName: 'Fromage Frais Bio Feta', quantity: 15, unitPrice: 4500 }
      ],
      totalAmountFcfa: 147500,
      paidAmountFcfa: 0,
      remainingAmountFcfa: 147500,
      paymentMethod: 'Orange Money Pro',
      status: 'ISSUED'
    },
    {
      id: 'inv-4',
      invoiceNumber: 'FAC-2026-1004',
      customerName: 'Fatou Binetou Diallo (Particulier)',
      customerPhone: '+221 77 333 22 11',
      issueDate: '2026-10-12',
      dueDate: '2026-10-12',
      items: [
        { productName: 'Lait Caill\u00e9 Traditionnel Sow (1L)', quantity: 6, unitPrice: 1500 },
        { productName: 'Beurre Bio (250g)', quantity: 2, unitPrice: 2500 }
      ],
      totalAmountFcfa: 14000,
      paidAmountFcfa: 14000,
      remainingAmountFcfa: 0,
      paymentMethod: 'Esp\u00e8ces Comptant',
      status: 'PAID'
    }
  ]);

  // Clients
  customers = signal<CustomerItem[]>([
    {
      id: 'cust-1',
      name: 'Hôtel Terrou-Bi Dakar',
      type: 'Hôtellerie & Restauration (B2B)',
      phone: '+221 77 123 45 67',
      address: 'Route de la Corniche Ouest, Dakar',
      ordersCount: 12,
      totalSpentFcfa: 4200000
    },
    {
      id: 'cust-2',
      name: 'Épicerie Fine Bio Almadies',
      type: 'Distribution Bio & Épicerie',
      phone: '+221 78 456 78 90',
      address: 'Zone Résidentielle Almadies',
      ordersCount: 8,
      totalSpentFcfa: 1850000
    },
    {
      id: 'cust-3',
      name: 'Restaurant Le Lagon 1',
      type: 'Restaurant Gastronomique',
      phone: '+221 77 987 65 43',
      address: 'Plateau, Dakar',
      ordersCount: 5,
      totalSpentFcfa: 737500
    },
    {
      id: 'cust-4',
      name: 'Fatou Binetou Diallo',
      type: 'Abonnée Particulière Panier Bio',
      phone: '+221 77 333 22 11',
      address: 'Mermoz, Dakar',
      ordersCount: 16,
      totalSpentFcfa: 224000
    }
  ]);

  // Encaissements
  payments = signal<PaymentItem[]>([
    {
      id: 'pay-1',
      transactionRef: 'WAVE-TX-98472',
      invoiceNumber: 'FAC-2026-1002',
      customerName: 'Épicerie Fine Bio Almadies',
      amountFcfa: 224500,
      paymentDate: '2026-10-11',
      paymentMethod: 'Wave'
    },
    {
      id: 'pay-2',
      transactionRef: 'BANK-VIR-5510',
      invoiceNumber: 'FAC-2026-1001',
      customerName: 'Hôtel Terrou-Bi Dakar',
      amountFcfa: 350000,
      paymentDate: '2026-10-10',
      paymentMethod: 'Virement'
    },
    {
      id: 'pay-3',
      transactionRef: 'CASH-REC-104',
      invoiceNumber: 'FAC-2026-1004',
      customerName: 'Fatou Binetou Diallo',
      amountFcfa: 14000,
      paymentDate: '2026-10-12',
      paymentMethod: 'Espèces'
    }
  ]);

  // Résumé commercial
  commercialSummary = computed(() => {
    const list = this.invoices();
    const totalRev = list.reduce((acc, i) => acc + i.totalAmountFcfa, 0);
    const totalPaid = list.reduce((acc, i) => acc + i.paidAmountFcfa, 0);
    const totalOut = list.reduce((acc, i) => acc + i.remainingAmountFcfa, 0);
    const avgOrder = list.length > 0 ? Math.round(totalRev / list.length) : 0;

    return {
      totalRevenueFcfa: totalRev,
      totalCollectedFcfa: totalPaid,
      totalOutstandingFcfa: totalOut,
      averageOrderValueFcfa: avgOrder,
      totalInvoicesCount: list.length,
      paidInvoicesCount: list.filter(i => i.status === 'PAID').length,
      pendingInvoicesCount: list.filter(i => i.status !== 'PAID').length,
      totalCustomersCount: this.customers().length
    };
  });

  filteredInvoices = computed(() => {
    const st = this.invoiceFilterStatus();
    const q = this.invoicesSearchTerm().toLowerCase().trim();

    return this.invoices().filter(inv => {
      let match = true;
      if (st !== 'ALL' && inv.status !== st) match = false;
      if (q && !inv.invoiceNumber.toLowerCase().includes(q) && !inv.customerName.toLowerCase().includes(q)) match = false;
      return match;
    });
  });

  // Formulaire Nouvelle Facture
  newInvoiceForm = {
    customerName: '',
    customerPhone: '',
    productName: 'Lait Frais Bio Pasteuris\u00e9 (Bouteille 1L)',
    quantity: 10,
    unitPrice: 1200,
    paymentMethod: 'Wave'
  };

  // Formulaire Nouveau Client
  newCustomerForm = {
    name: '',
    type: 'Particulier',
    phone: '',
    address: ''
  };

  paymentAmountInput = signal<number>(0);
  paymentMethodInput = signal<string>('Wave');

  ngOnInit(): void {
    this.loadProductStocks();
  }

  loadProductStocks(): void {
    this.productStocksLoading.set(true);
    this.api.getAllStocks().subscribe({
      next: stocks => {
        this.productStocks.set(stocks || []);
        this.productStocksLoading.set(false);
      },
      error: () => {
        // Fallback résilient : charger depuis le catalogue public si la session doit être renouvelée
        this.api.getMarketplaceProducts({ size: 100 }).subscribe({
          next: page => {
            const mapped: ProductStock[] = (page.content || []).map(p => ({
              id: p.id,
              productName: p.name,
              quantityAvailable: p.quantityAvailable,
              unit: p.unit,
              unitPriceFcfa: p.priceFcfa,
              totalValueFcfa: p.quantityAvailable * p.priceFcfa,
              dlcExpiryDate: p.dlcExpiryDate || undefined,
              isOrganicCertified: p.organicCertified !== false
            }));
            this.productStocks.set(mapped);
            this.productStocksLoading.set(false);
          },
          error: () => {
            this.notificationService.afficherToast('Erreur lors du chargement des stocks de produits.');
            this.productStocksLoading.set(false);
          }
        });
      }
    });
  }

  openEditStockModal(stock: ProductStock): void {
    this.selectedStockForEdit.set(stock);
    this.stockForm = {
      id: stock.id,
      productName: stock.productName,
      quantityAvailable: stock.quantityAvailable,
      unit: stock.unit,
      unitPriceFcfa: stock.unitPriceFcfa,
      dlcExpiryDate: stock.dlcExpiryDate || '',
      storageLocation: stock.storageLocation || 'Chambre Froide Laiterie (+4°C)',
      isOrganicCertified: stock.isOrganicCertified !== false,
      imageUrl: stock.imageUrl || ''
    };
    this.isEditStockModalOpen.set(true);
  }

  openNewStockModal(): void {
    const today = new Date();
    const dlc = new Date();
    dlc.setDate(today.getDate() + 14);

    this.selectedStockForEdit.set(null);
    this.stockForm = {
      id: undefined,
      productName: '',
      quantityAvailable: 50,
      unit: 'Bouteille 1L',
      unitPriceFcfa: 1000,
      dlcExpiryDate: dlc.toISOString().split('T')[0],
      storageLocation: 'Chambre Froide Laiterie (+4°C)',
      isOrganicCertified: true,
      imageUrl: ''
    };
    this.isNewStockModalOpen.set(true);
  }

  saveStock(): void {
    if (!this.stockForm.productName || !this.stockForm.unitPriceFcfa) {
      this.notificationService.afficherToast('Veuillez renseigner le nom et le prix du produit.');
      return;
    }

    const payload: ProductStock = {
      id: this.stockForm.id,
      productName: this.stockForm.productName.trim(),
      quantityAvailable: Number(this.stockForm.quantityAvailable) || 0,
      unit: this.stockForm.unit,
      unitPriceFcfa: Number(this.stockForm.unitPriceFcfa) || 0,
      totalValueFcfa: (Number(this.stockForm.quantityAvailable) || 0) * (Number(this.stockForm.unitPriceFcfa) || 0),
      dlcExpiryDate: this.stockForm.dlcExpiryDate || undefined,
      storageLocation: this.stockForm.storageLocation,
      isOrganicCertified: this.stockForm.isOrganicCertified,
      imageUrl: this.stockForm.imageUrl || undefined
    };

    this.api.createOrUpdateStock(payload).subscribe({
      next: saved => {
        this.notificationService.afficherToast(`Produit « ${saved.productName} » enregistré avec succès !`);
        this.isEditStockModalOpen.set(false);
        this.isNewStockModalOpen.set(false);
        this.loadProductStocks();
      },
      error: () => {
        this.notificationService.afficherToast("Erreur lors de l'enregistrement du produit.");
      }
    });
  }

  toggleArchiveProductStock(stock: ProductStock): void {
    if (!stock.id) return;
    const isCurrentlyActive = (stock.quantityAvailable || 0) > 0;
    const newQty = isCurrentlyActive ? 0 : 50; // 0 = hors-ligne / archivé, > 0 = en rayon
    const actionLabel = isCurrentlyActive ? 'archiver et masquer de la boutique' : 'remettre en rayon sur la boutique';

    if (!confirm(`Voulez-vous ${actionLabel} le produit « ${stock.productName} » ?`)) return;

    const payload: ProductStock = {
      ...stock,
      quantityAvailable: newQty,
      totalValueFcfa: newQty * (stock.unitPriceFcfa || 0)
    };

    this.api.createOrUpdateStock(payload).subscribe({
      next: () => {
        const msg = isCurrentlyActive
          ? `Produit « ${stock.productName} » archivé (retiré de la boutique avec succès).`
          : `Produit « ${stock.productName} » remis en rayon sur la boutique !`;
        this.notificationService.afficherToast(msg);
        this.loadProductStocks();
      },
      error: () => {
        this.notificationService.afficherToast('Erreur lors de la mise à jour du statut du produit.');
      }
    });
  }

  loadMarketplaceOrders(): void {
    this.marketplaceOrdersLoading.set(true);
    this.marketplaceOrdersError.set(null);
    this.api.getMarketplaceOrders({ size: 100 }).subscribe({
      next: page => { this.marketplaceOrders.set(page.content); this.marketplaceOrdersLoading.set(false); },
      error: () => { this.marketplaceOrdersError.set('Impossible de charger les commandes marketplace. Vérifiez votre connexion et vos droits.'); this.marketplaceOrdersLoading.set(false); }
    });
  }
  
  changeMarketplaceOrderStatus(order: MarketplaceOrderResult, status: string): void {
    if (status === order.status) return;
    if (status === 'CANCELLED' && !confirm('Annuler cette commande ? Le stock réservé sera remis en vente.')) {
      this.loadMarketplaceOrders(); // remet le select sur l'ancien statut
      return;
    }
    this.api.updateMarketplaceOrderStatus(order.id, status).subscribe({
      next: updated => this.marketplaceOrders.update(items => items.map(item => item.id === updated.id ? updated : item)),
      error: err => {
        this.marketplaceOrdersError.set(err?.error?.message || 'Le statut de la commande n’a pas pu être modifié.');
        this.loadMarketplaceOrders();
      }
    });
  }


  navigateToCommercialSubTab(tab: 'invoices' | 'customers' | 'payments' | 'marketplace'): void {
    this.activeCommercialSubTab.set(tab);
    if (tab === 'marketplace') this.loadMarketplaceOrders();
  }

  filterInvoices(status: string): void {
    this.invoiceFilterStatus.set(status);
  }

  openNewInvoiceModal(): void {
    this.isNewInvoiceModalOpen.set(true);
  }

  submitNewInvoice(): void {
    if (!this.newInvoiceForm.customerName.trim()) return;

    const total = this.newInvoiceForm.quantity * this.newInvoiceForm.unitPrice;
    const count = this.invoices().length + 1;
    const newInv: InvoiceItem = {
      id: 'inv-' + Date.now(),
      invoiceNumber: `FAC-2026-10${count < 10 ? '0' + count : count}`,
      customerName: this.newInvoiceForm.customerName,
      customerPhone: this.newInvoiceForm.customerPhone || '+221 77 000 00 00',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: [{
        productName: this.newInvoiceForm.productName,
        quantity: this.newInvoiceForm.quantity,
        unitPrice: this.newInvoiceForm.unitPrice
      }],
      totalAmountFcfa: total,
      paidAmountFcfa: total,
      remainingAmountFcfa: 0,
      paymentMethod: this.newInvoiceForm.paymentMethod,
      status: 'PAID'
    };

    this.invoices.update(list => [newInv, ...list]);
    this.notificationService.afficherToast(`Facture ${newInv.invoiceNumber} émise avec succès (${total.toLocaleString()} FCFA) !`);
    this.isNewInvoiceModalOpen.set(false);
  }

  openNewCustomerModal(): void {
    this.isNewCustomerModalOpen.set(true);
  }

  submitNewCustomer(): void {
    if (!this.newCustomerForm.name.trim()) return;

    const newCust: CustomerItem = {
      id: 'cust-' + Date.now(),
      name: this.newCustomerForm.name,
      type: this.newCustomerForm.type,
      phone: this.newCustomerForm.phone,
      address: this.newCustomerForm.address,
      ordersCount: 0,
      totalSpentFcfa: 0
    };

    this.customers.update(list => [newCust, ...list]);
    this.notificationService.afficherToast(`Client "${newCust.name}" enregistré au répertoire !`);
    this.isNewCustomerModalOpen.set(false);
  }

  openRecordPaymentModal(inv: InvoiceItem): void {
    this.selectedInvoiceForPayment.set(inv);
    this.paymentAmountInput.set(inv.remainingAmountFcfa > 0 ? inv.remainingAmountFcfa : inv.totalAmountFcfa);
    this.isRecordPaymentModalOpen.set(true);
  }

  submitRecordPayment(): void {
    const inv = this.selectedInvoiceForPayment();
    if (!inv) return;

    this.invoices.update(list => list.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          paidAmountFcfa: i.totalAmountFcfa,
          remainingAmountFcfa: 0,
          status: 'PAID',
          paymentMethod: this.paymentMethodInput()
        };
      }
      return i;
    }));

    const newPay: PaymentItem = {
      id: 'pay-' + Date.now(),
      transactionRef: 'ENC-' + Math.floor(10000 + Math.random() * 90000),
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      amountFcfa: this.paymentAmountInput(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: this.paymentMethodInput()
    };

    this.payments.update(list => [newPay, ...list]);
    this.notificationService.afficherToast(`Paiement de ${newPay.amountFcfa.toLocaleString()} FCFA enregistré pour ${inv.customerName} !`);
    this.isRecordPaymentModalOpen.set(false);
  }
}
