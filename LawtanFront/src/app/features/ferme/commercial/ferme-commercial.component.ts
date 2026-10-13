import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';

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

  activeCommercialSubTab = signal<'invoices' | 'customers' | 'payments'>('invoices');
  invoiceFilterStatus = signal<string>('ALL');
  invoicesSearchTerm = signal<string>('');

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

  ngOnInit(): void {}

  navigateToCommercialSubTab(tab: 'invoices' | 'customers' | 'payments'): void {
    this.activeCommercialSubTab.set(tab);
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
