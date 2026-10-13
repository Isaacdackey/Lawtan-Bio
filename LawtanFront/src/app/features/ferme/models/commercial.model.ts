export type CustomerType = 'SUPERMARKET' | 'HOTEL_RESTAURANT' | 'GROCERY_BIO' | 'INDIVIDUAL';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';

export interface Customer {
  id?: number;
  name: string;
  companyName?: string;
  customerType: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  nineaNumber?: string;
  totalOrdersCount?: number;
  totalSpentFcfa?: number;
  balanceDueFcfa?: number;
  notes?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  id?: number;
  productId?: number;
  productName: string;
  productType?: string;
  quantity: number;
  unit: string;
  unitPriceFcfa: number;
  lineTotalFcfa: number;
}

export interface SaleInvoice {
  id?: number;
  invoiceNumber: string;
  customerId: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerNinea?: string;
  issueDate: string;
  dueDate?: string;
  subTotalFcfa: number;
  discountFcfa?: number;
  taxFcfa?: number;
  totalAmountFcfa: number;
  paidAmountFcfa: number;
  remainingAmountFcfa: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  items?: InvoiceItem[];
  createdAt?: string;
}

export interface PaymentTransaction {
  id?: number;
  invoiceId: number;
  invoiceNumber?: string;
  customerId?: number;
  customerName?: string;
  paymentDate?: string;
  amountPaidFcfa: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  receiptNumber?: string;
  receivedBy?: string;
  notes?: string;
}

export interface CommercialSummary {
  totalRevenueFcfa: number;
  totalCollectedFcfa: number;
  totalOutstandingFcfa: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  totalCustomersCount: number;
  averageOrderValueFcfa: number;
}
