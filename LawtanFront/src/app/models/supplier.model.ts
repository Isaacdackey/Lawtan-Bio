export interface Supplier {
  id?: number;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  category?: string; // FOURRAGE_ALIMENT, EMBALLAGE_PACKAGING, EQUIPEMENT_PIECES, VETERINAIRE_SANTE, AUTRE
  nineaNumber?: string;
  paymentTerms?: string;
  totalOrdersCount?: number;
  totalSpentFcfa?: number;
  bioCertified?: boolean;
  active?: boolean;
  notes?: string;
  createdAt?: string;
}
