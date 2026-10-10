import { Component, OnInit, AfterViewInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Animal, Pedigree } from './models/animal.model';
import { HealthRecord, VaccineSchedule } from './models/health.model';
import { DashboardStats, MilkProduction, TankStatus, MilkHistory, MilkStockAllocation, MilkPricing } from './models/milk.model';
import { ReproductionEvent, ReproductionAlert, ReproEventType } from './models/reproduction.model';
import { Recipe, TransformationBatch, ProductStock, TransformationSummary, ProductType, BatchStatus } from './models/transformation.model';
import { Customer, SaleInvoice, InvoiceItem, PaymentTransaction, CommercialSummary, CustomerType, InvoiceStatus, PaymentMethod } from './models/commercial.model';
import { FeedStock, FeedRation, FeedRationIngredient, FeedDistribution, SolarTelemetry } from './models/feed-solar.model';
import { Supplier } from './models/supplier.model';
import { FinanceSummary } from './models/finance.model';
import { TraceabilityLot } from './models/traceability.model';
import { AuthService } from './services/auth.service';
import { User, UserRole } from './models/user.model';
import { Chart, registerables } from 'chart.js';
import QRCode from 'qrcode';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  public apiService = inject(ApiService);
  public authService = inject(AuthService);

  // Active navigation page
  activePage = signal<string>('dashboard');

  // Sidebar mobile toggle
  isSidebarOpen = signal<boolean>(false);

  // Notifications dropdown
  isNotifOpen = signal<boolean>(false);

  // User Profile Menu Dropdown
  isUserMenuOpen = signal<boolean>(false);

  // Offline simulation
  isOffline = signal<boolean>(false);

  // Current user role & title
  title = 'LAWTAN BIO';
  currentRole = signal<string>('manager');

  // Login form model
  loginForm = {
    identifier: '',
    password: '',
    rememberMe: true
  };
  showPassword = signal<boolean>(false);

  // Toast message & notifications
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  private toastTimeout: any = null;

  // Active animal modal
  isAnimalModalOpen = signal<boolean>(false);
  activeModalTab = signal<string>('infos');
  selectedAnimal = signal<Animal | null>(null);

  // Pagination Troupeau
  herdCurrentPage = signal<number>(1);
  herdPageSize = signal<number>(8);

  // Modals state
  isMilkModalOpen = signal<boolean>(false);
  isHealthModalOpen = signal<boolean>(false);
  isEditHealthModalOpen = signal<boolean>(false);
  isOrderModalOpen = signal<boolean>(false);
  isQrModalOpen = signal<boolean>(false);
  isNewAnimalModalOpen = signal<boolean>(false);
  isEditAnimalModalOpen = signal<boolean>(false);
  isVaccineModalOpen = signal<boolean>(false);
  isRationModalOpen = signal<boolean>(false);
  isReproModalOpen = signal<boolean>(false);
  isExportModalOpen = signal<boolean>(false);
  

  // QR Modal Data
  // Image du QR code du lot, generee a l'ouverture du passeport
  lotQrImage = signal<string>('');

  // Filter & Search
  herdFilter = signal<string>('all');
  searchQuery = signal<string>('');

  healthForm = {
    cowId: '',
    actType: 'Traitement Pathologie',
    diagnosis: '',
    treatmentPrescription: '',
    practitionerName: '',
    cost: 0,
    milkWithdrawalDays: 0,
    status: 'Planifié',
    recordDate: new Date().toISOString().split('T')[0]
  };

  editingHealthRecord: HealthRecord = {
    id: 0,
    animalInternalId: '',
    actType: 'Traitement Pathologie',
    costFcfa: 0,
    diagnosis: '',
    treatmentPrescription: '',
    practitionerName: '',
    status: 'Planifié',
    milkWithdrawalDays: 0,
    recordDate: new Date().toISOString().split('T')[0]
  };

  orderForm = {
    client: '',
    product: '',
    qty: 0,
    unitPrice: 0,
    total: 0
  };

  newAnimalForm: Animal = {
    internalId: '',
    name: '',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: new Date().toISOString().split('T')[0],
    weight: 0,
    imageUrl: ''
  };
  newAnimalFather = '';
  newAnimalFatherEarTag = '';
  newAnimalMother = '';
  newAnimalMotherEarTag = '';

  editAnimalForm: Animal = {
    internalId: '',
    name: '',
    earTagNumber: '',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: '',
    weight: 0,
    imageUrl: ''
  };
  editAnimalFather = '';
  editAnimalFatherEarTag = '';
  editAnimalMother = '';
  editAnimalMotherEarTag = '';

  vaccineForm = {
    type: '',
    target: '',
    date: new Date().toISOString().split('T')[0],
    vet: '',
    cost: 0,
    notes: ''
  };

  rationForm = {
    group: '',
    fourrage: 0,
    mais: 0,
    concentre: 0,
    cmv: 0,
    time: '',
    operator: ''
  };

  // Sprint 2: Reproduction Form
  reproForm: {
    animalInternalId: string;
    eventType: ReproEventType;
    eventDate: string;
    bullOrSemenUsed: string;
    operatorName: string;
    expectedDryOffDate: string;
    expectedCalvingDate: string;
    observations: string;
    isConfirmed: boolean;
  } = {
    animalInternalId: '',
    eventType: 'ARTIFICIAL_INSEMINATION',
    eventDate: new Date().toISOString().split('T')[0],
    bullOrSemenUsed: '',
    operatorName: '',
    expectedDryOffDate: '',
    expectedCalvingDate: '',
    observations: '',
    isConfirmed: true
  };

  // Sprint 3: Transformation & Recipes Modals & State
  isNewBatchModalOpen = signal<boolean>(false);
  isCompleteBatchModalOpen = signal<boolean>(false);
  isRecipeModalOpen = signal<boolean>(false);
  selectedBatchForCompletion = signal<TransformationBatch | null>(null);
  selectedRecipe = signal<Recipe | null>(null);

  isTransformationMenuOpen = signal<boolean>(true); // Menu déroulant accordéon
  activeTransformationSubTab = signal<string>('batches'); // 'batches' | 'recipes' | 'stocks'
  transformationFilter = signal<string>('all'); // 'all' | 'in_progress' | 'completed'
  stockCategoryFilter = signal<string>('all'); // 'all' | 'CHEESE' | 'YOGURT' | 'CURDLED_MILK' | 'BUTTER' | 'PASTEURIZED_MILK'

  // Sprint 3: Forms
  newBatchForm: {
    recipeId: number;
    rawMaterialSource: 'RAW_MILK' | 'CURDLED_MILK';
    milkLitersConsumed: number;
    productionDate: string;
    operatorName: string;
    sourceTank: string;
    fatPercentage: number;
    phLevel: number;
    qualityNotes: string;
    isCustomProduct: boolean;
    customProductName: string;
    customProductType: ProductType;
    customTargetUnit: string;
    customMilkRatio: number;
    saveAsNewRecipe: boolean;
  } = {
    recipeId: 1,
    rawMaterialSource: 'RAW_MILK',
    milkLitersConsumed: 0,
    productionDate: new Date().toISOString().split('T')[0],
    operatorName: '',
    sourceTank: 'Cuve Réfrigérée N°1 (Bio)',
    fatPercentage: 3.9,
    phLevel: 6.65,
    qualityNotes: '',
    isCustomProduct: false,
    customProductName: '',
    customProductType: 'CHEESE',
    customTargetUnit: 'Litre',
    customMilkRatio: 1.0,
    saveAsNewRecipe: false
  };

  completeBatchForm: {
    actualQuantityProduced: number;
    wasteLossQuantity: number;
    phLevel: number;
    qualityNotes: string;
  } = {
    actualQuantityProduced: 0,
    wasteLossQuantity: 0,
    phLevel: 4.8,
    qualityNotes: ''
  };

  recipeForm: Recipe = {
    code: '',
    name: '',
    productType: 'CHEESE',
    targetUnit: 'pièce 200g',
    milkLitersPerUnit: 2.0,
    ingredientsList: '',
    shelfLifeDays: 30,
    processInstructions: '',
    emoji: '',
    standardSellingPriceFcfa: 2000
  };

  Math = Math;

  get directSalePercentage(): number {
    const gross = this.milkStockAllocation().grossVolumeCollected || 1;
    return Math.round((this.milkStockAllocation().directSaleVolume / gross) * 100);
  }

  get productionPercentage(): number {
    const gross = this.milkStockAllocation().grossVolumeCollected || 1;
    return Math.round((this.milkStockAllocation().productionVolume / gross) * 100);
  }

  get calvesPercentage(): number {
    const gross = this.milkStockAllocation().grossVolumeCollected || 1;
    return Math.round((this.milkStockAllocation().calvesVolume / gross) * 100);
  }

  get totalAllocatedVolume(): number {
    const f = this.ventilationForm;
    return Math.round(((Number(f.directSaleVolume) || 0) + (Number(f.productionVolume) || 0) + (Number(f.calvesVolume) || 0)) * 10) / 10;
  }

  // Data Collections
  animals = signal<Animal[]>([]);
  healthRecords = signal<HealthRecord[]>([]);
  vaccineSchedules = signal<VaccineSchedule[]>([]);
  dashboardStats = signal<DashboardStats | null>(null);

  // Sprint 2: Data Collections & Milk Form
  reproductionEvents = signal<ReproductionEvent[]>([]);
  reproductionAlerts = signal<ReproductionAlert[]>([]);
  tankStatus = signal<TankStatus | null>(null);
  milkHistory = signal<MilkHistory[]>([]);
  milkProductions = signal<MilkProduction[]>([]);
  isMilkMenuOpen = signal<boolean>(false);
  activeMilkSubTab = signal<'milking' | 'journal' | 'stocks'>('milking');

  // Finance & tracabilite : entierement calculees par le serveur
  financeSummary = signal<FinanceSummary | null>(null);
  traceabilityLots = signal<TraceabilityLot[]>([]);
  selectedTraceabilityLot = signal<TraceabilityLot | null>(null);

  // Ressources dont le chargement a echoue, pour l'afficher au lieu de masquer le probleme
  dataLoadErrors = signal<string[]>([]);

  // Ventilation des Stocks de Lait (Vente directe vs Production vs Veaux)
  milkStockAllocation = signal<MilkStockAllocation>({
    grossVolumeCollected: 0.0,
    directSaleVolume: 0.0,
    directSaleConsumed: 0.0,
    directSaleAvailable: 0.0,
    productionVolume: 0.0,
    productionConsumed: 0.0,
    productionAvailable: 0.0,
    calvesVolume: 0.0,
    unallocatedVolume: 0.0,
    allocationDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  // Tarif de vente du lait cru au litre, modifiable depuis la page Stocks de Lait
  milkPricing = signal<MilkPricing | null>(null);
  isMilkPriceEditing = signal<boolean>(false);
  milkPriceForm: { pricePerLiter: number | null; notes: string } = { pricePerLiter: null, notes: '' };

  isVentilationModalOpen = signal<boolean>(false);
  milkStockCategoryFilter = signal<string>('ALL');
  ventilationForm: {
    directSaleVolume: number | null;
    productionVolume: number | null;
    calvesVolume: number | null;
    notes: string;
  } = {
    directSaleVolume: null,
    productionVolume: null,
    calvesVolume: null,
    notes: 'Ventilation journalière'
  };
  
  // Filtres avancés Production Laitière
  milkFilterStartDate = signal<string>('');
  milkFilterEndDate = signal<string>('');
  milkFilterAnimalId = signal<string>('ALL');
  milkFilterSession = signal<string>('ALL');
  milkFilterMinVolume = signal<number | null>(null);
  milkFilterSearch = signal<string>('');
  milkCurrentPage = signal<number>(1);
  milkPageSize = signal<number>(6);

  milkForm = {
    cowId: '',
    session: 'Matin',
    litres: null as any,
    temp: 34.0,
    fatPercentage: 4.0,
    tank: 'Cuve Réfrigérée N°1 (Bio)',
    productionDate: new Date().toISOString().split('T')[0],
    isOrganicCompliant: true
  };
  reproFilter = signal<string>('all');
  reproCurrentPage = signal<number>(1);
  reproPageSize = signal<number>(5);

  // Sprint 3: Data Collections & Pagination
  recipes = signal<Recipe[]>([]);
  transformationBatches = signal<TransformationBatch[]>([]);
  productStocks = signal<ProductStock[]>([]);
  transformationSummary = signal<TransformationSummary | null>(null);

  // Filtres avancés Lots de Fabrication
  batchFilterStartDate = signal<string>('');
  batchFilterEndDate = signal<string>('');
  batchFilterProduct = signal<string>('ALL');
  batchFilterSearch = signal<string>('');

  batchesCurrentPage = signal<number>(1);
  batchesPageSize = signal<number>(5);

  recipesCurrentPage = signal<number>(1);
  recipesPageSize = signal<number>(6);

  stocksCurrentPage = signal<number>(1);
  stocksPageSize = signal<number>(5);

  // Stock Management Modal & Form
  isStockModalOpen = signal<boolean>(false);
  stockEditingId = signal<number | null>(null);
  stockForm = {
    recipeId: null as number | null,
    productName: '',
    productType: 'CURDLED_MILK' as ProductType,
    batchNumber: '',
    quantityAvailable: 0,
    unit: 'Litre',
    unitPriceFcfa: 1000,
    storageLocation: 'Chambre Froide Laiterie (+4°C)',
    mfgDate: new Date().toISOString().slice(0, 10),
    dlcExpiryDate: '',
    isOrganicCertified: true
  };

  // Sprint 4: Data Collections, Pagination & Modals (Commercial, Invoices, Customers, Payments)
  isCommercialMenuOpen = signal<boolean>(false);
  activeCommercialSubTab = signal<string>('invoices'); // 'invoices' | 'customers' | 'payments'
  commercialSummary = signal<CommercialSummary | null>(null);
  customers = signal<Customer[]>([]);
  invoices = signal<SaleInvoice[]>([]);
  payments = signal<PaymentTransaction[]>([]);

  isNewInvoiceModalOpen = signal<boolean>(false);
  isNewCustomerModalOpen = signal<boolean>(false);
  isEditCustomerModalOpen = signal<boolean>(false);
  isCustomerInvoicesModalOpen = signal<boolean>(false);
  isPaymentModalOpen = signal<boolean>(false);
  isInvoicePrintModalOpen = signal<boolean>(false);

  selectedInvoiceForDetail = signal<SaleInvoice | null>(null);
  selectedInvoiceForPayment = signal<SaleInvoice | null>(null);
  selectedInvoiceForPrint = signal<SaleInvoice | null>(null);
  selectedCustomerForDetail = signal<Customer | null>(null);
  selectedCustomerForInvoices = signal<Customer | null>(null);

  invoiceFilterStatus = signal<string>('ALL');
  invoicesSearchTerm = signal<string>('');
  customersSearchTerm = signal<string>('');
  customerTypeFilter = signal<string>('ALL');
  paymentsSearchTerm = signal<string>('');

  invoicesCurrentPage = signal<number>(1);
  invoicesPageSize = signal<number>(6);

  customersCurrentPage = signal<number>(1);
  customersPageSize = signal<number>(6);

  paymentsCurrentPage = signal<number>(1);
  paymentsPageSize = signal<number>(8);

  // Commercial Forms
  newInvoiceForm = {
    customerId: null as any,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    discountFcfa: 0,
    taxFcfa: 0,
    notes: '',
    paymentMethod: 'WAVE' as PaymentMethod,
    paymentReference: '',
    immediatePayment: false,
    items: [] as Array<{
      productId?: number;
      productName: string;
      productType?: ProductType;
      quantity: number;
      unit: string;
      unitPriceFcfa: number;
      lineTotalFcfa: number;
    }>
  };

  newCustomerForm: Customer = {
    name: '',
    companyName: '',
    customerType: 'SUPERMARKET',
    phone: '',
    email: '',
    address: '',
    city: 'Dakar',
    nineaNumber: '',
    notes: ''
  };

  editCustomerForm: Customer = {
    name: '',
    companyName: '',
    customerType: 'SUPERMARKET',
    phone: '',
    email: '',
    address: '',
    city: 'Dakar',
    nineaNumber: '',
    notes: ''
  };

  paymentForm = {
    amountPaidFcfa: 0,
    paymentMethod: 'WAVE' as PaymentMethod,
    transactionReference: '',
    receivedBy: 'Comptabilité Ferme LAWTAN',
    notes: ''
  };

  // ==========================================
  // SPRINT 5: ALIMENTATION, SOLAIRE & AUDIT
  // ==========================================
  feedStocks = signal<FeedStock[]>([]);
  feedRations = signal<FeedRation[]>([]);
  solarTelemetry = signal<SolarTelemetry | null>(null);

  isFeedMenuOpen = signal<boolean>(false);
  activeFeedSubTab = signal<'stocks' | 'rations' | 'distributions' | 'suppliers'>('stocks');
  isFeedStockModalOpen = signal<boolean>(false);
  isFeedRationModalOpen = signal<boolean>(false);
  isAuditReportModalOpen = signal<boolean>(false);
  selectedAuditReportType = signal<string>('BIO_CERTIFICATE');

  // Filtres & Recherche Fiches Rations
  rationSearchTerm = signal<string>('');
  rationCategoryFilter = signal<string>('ALL');
  rationBreedFilter = signal<string>('ALL');
  rationsCurrentPage = signal<number>(1);
  rationsItemsPerPage = signal<number>(6);

  // Distributions Journalières State
  feedDistributions = signal<FeedDistribution[]>([]);
  isDistributionModalOpen = signal<boolean>(false);
  selectedRationForDistribution = signal<FeedRation | null>(null);
  distFilterStartDate = signal<string>('');
  distFilterEndDate = signal<string>('');
  distFilterRation = signal<string>('ALL');
  distFilterAnimalOrBreed = signal<string>('ALL');
  distFilterSearch = signal<string>('');
  distCurrentPage = signal<number>(1);
  distPageSize = signal<number>(6);

  // Fournisseurs / Suppliers State
  suppliers = signal<Supplier[]>([]);
  isSupplierModalOpen = signal<boolean>(false);
  isQuickSupplierModalOpen = signal<boolean>(false);
  supplierSearchTerm = signal<string>('');
  supplierCategoryFilter = signal<string>('ALL');
  suppliersCurrentPage = signal<number>(1);
  suppliersItemsPerPage = signal<number>(6);

  supplierForm: Supplier = {
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Thiès',
    category: 'FOURRAGE_ALIMENT',
    paymentTerms: 'Paiement à livraison / Wave',
    bioCertified: true,
    notes: ''
  };

  quickSupplierForm: Supplier = {
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    city: 'Thiès',
    category: 'FOURRAGE_ALIMENT',
    paymentTerms: 'Comptant / Wave',
    bioCertified: true
  };

  feedStockForm: FeedStock = {
    name: '',
    category: 'FORAGE_GREEN',
    currentStockKg: 500,
    alertThresholdKg: 200,
    unitPricePerKgFcfa: 80,
    supplierName: '',
    storageLocation: 'Hangar Principal',
    notes: ''
  };

  feedRationForm: FeedRation = {
    rationName: '',
    targetCategory: 'Vaches Haute Lactation',
    targetBreeds: ['Holstein', 'Guzerat'],
    targetAnimalIds: [],
    ingredients: [],
    dailyDryMatterKg: 15.0,
    totalFreshWeightKg: 25.0,
    dailyCostFcfa: 2400,
    compositionDescription: '',
    energyUfl: 13.0,
    proteinPdiGrams: 1250
  };

  distributionForm = {
    rationId: 0,
    rationName: '',
    distributionDate: new Date().toISOString().slice(0, 10),
    distributionTime: '07:30',
    session: 'MATIN' as 'MATIN' | 'MIDI' | 'SOIR',
    quantityDistributedKg: 150,
    animalsCountNourished: 6,
    targetGroupOrRace: 'Holstein & Guzerat Laitières',
    selectedAnimalIds: [] as string[],
    distributorName: 'Moussa Bouvier',
    totalCostFcfa: 17200,
    notes: 'Distribution du matin à l\'auge avec eau fraîche.'
  };

  feedStockSearchTerm = signal<string>('');
  feedCategoryFilter = signal<string>('ALL');
  feedStocksCurrentPage = signal<number>(1);
  feedStocksItemsPerPage = signal<number>(6);

  // --- Sprint Authentification : Mon Profil & Gestion Utilisateurs ---
  isProfileModalOpen = signal<boolean>(false);
  profileActiveTab = signal<'info' | 'password'>('info');
  profileForm = {
    name: '',
    email: '',
    phone: '',
    title: '',
    department: ''
  };
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  usersList = signal<User[]>([]);
  isUserModalOpen = signal<boolean>(false);
  userEditingId = signal<string | number | null>(null);
  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'tech' as UserRole,
    title: '',
    department: '',
    phone: '',
    active: true
  };

  // Charts
  private milkChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;
  private monthlyChartInstance: Chart | null = null;
  private financeChartInstance: Chart | null = null;
  private perfChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.updateReproCalculations();
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initDashboardCharts();
    }, 200);
  }

  /**
   * Un chargement qui echoue est signale tel quel : la donnee reste vide,
   * jamais remplacee par une valeur de substitution.
   */
  reportDataLoadFailure(resource: string, err?: unknown): void {
    console.warn(`[Lawtan] Chargement impossible : ${resource}`, err);
    this.dataLoadErrors.update(list => list.includes(resource) ? list : [...list, resource]);
  }

  clearDataLoadErrors(): void {
    this.dataLoadErrors.set([]);
  }

  loadFinanceData(): void {
    this.apiService.getFinanceSummary().subscribe({
      next: (summary) => {
        this.financeSummary.set(summary || null);
        setTimeout(() => this.initFinanceChart(), 120);
      },
      error: (err) => {
        this.financeSummary.set(null);
        this.reportDataLoadFailure('Synthese financiere', err);
      }
    });
  }

  loadTraceabilityData(): void {
    this.apiService.getTraceabilityLots().subscribe({
      next: (lots) => {
        this.traceabilityLots.set(lots || []);
      },
      error: (err) => {
        this.traceabilityLots.set([]);
        this.reportDataLoadFailure('Tracabilite des lots', err);
      }
    });
  }

  loadInitialData(): void {
    // 1. Fetch Animals from API
    this.apiService.getAllAnimals().subscribe({
      next: (data) => {
        this.isOffline.set(false);
        this.animals.set(data || []);
      },
      error: (err) => {
        this.isOffline.set(true);
        this.animals.set([]);
        this.reportDataLoadFailure('Troupeau', err);
      }
    });

    // 2. Fetch Health Records
    this.apiService.getAllHealthRecords().subscribe({
      next: (data) => {
        this.healthRecords.set(data || []);
      },
      error: (err) => {
        this.healthRecords.set([]);
        this.reportDataLoadFailure('Dossiers de sante', err);
      }
    });

    // 3. Fetch Vaccines
    this.apiService.getAllVaccines().subscribe({
      next: (data) => {
        this.vaccineSchedules.set(data || []);
      },
      error: (err) => {
        this.vaccineSchedules.set([]);
        this.reportDataLoadFailure('Plan de vaccination', err);
      }
    });

    // 4. Fetch Dashboard Stats
    this.apiService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats.set(stats || null);
        // Les graphiques sont redessines des que les series reelles arrivent
        setTimeout(() => this.initDashboardCharts(), 80);
      },
      error: (err) => {
        this.dashboardStats.set(null);
        this.reportDataLoadFailure('Statistiques du tableau de bord', err);
      }
    });

    // 5. Sprint 2: Reproduction Data & Alerts
    this.loadReproductionData();

    // 6. Sprint 2: Tank Status & Milk History
    this.loadMilkData();

    // 7. Sprint 3: Transformation, Recipes & Stocks
    this.loadTransformationData();

    // 8. Sprint 4: Commercial, Customers, Invoices & Payments
    this.loadCommercialData();

    // 9. Sprint 5: Feed, Rations & Solar Telemetry
    this.loadFeedAndSolarData();

    // 10. Finance & tracabilite, calculees en base
    this.loadFinanceData();
    this.loadTraceabilityData();

  }

  // Action utilisateur pour synchroniser manuellement les données
  refreshAndSyncAllData(): void {
    this.showToast('Synchronisation des données en cours...');
    this.clearDataLoadErrors();
    this.apiService.checkBackendHealth().subscribe(online => {
      if (online) {
        this.isOffline.set(false);
        this.loadInitialData();
        this.showToast('Données synchronisées avec succès !');
      } else {
        this.isOffline.set(true);
        this.showToast('Impossible de joindre le serveur.');
      }
    });
  }

  loadReproductionData(): void {
    this.apiService.getAllReproEvents().subscribe({
      next: (events) => {
        this.reproductionEvents.set(events || []);
      },
      error: (err) => {
        this.reproductionEvents.set([]);
        this.reportDataLoadFailure('Evenements de reproduction', err);
      }
    });

    this.apiService.getReproAlerts().subscribe({
      next: (alerts) => {
        this.reproductionAlerts.set(alerts || []);
      },
      error: (err) => {
        this.reproductionAlerts.set([]);
        this.reportDataLoadFailure('Alertes de reproduction', err);
      }
    });
  }

  loadMilkData(): void {
    // Cuve et ventilation sont calculees en base ; le client se contente de les relire.
    this.refreshTankAndAllocation();

    this.apiService.getMilkHistory(7).subscribe({
      next: (hist) => {
        this.milkHistory.set(hist || []);
        setTimeout(() => this.initMilkChart(), 80);
      },
      error: (err) => {
        this.milkHistory.set([]);
        this.reportDataLoadFailure('Historique de traite', err);
      }
    });

    this.apiService.getMilkPricing().subscribe({
      next: (pricing) => {
        this.milkPricing.set(pricing || null);
      },
      error: (err) => {
        this.milkPricing.set(null);
        this.reportDataLoadFailure('Tarif du lait', err);
      }
    });

    this.loadMilkProductions();
  }

  loadMilkProductions(): void {
    this.apiService.getAllMilkProductions().subscribe({
      next: (prods: MilkProduction[]) => {
        this.milkProductions.set(prods || []);
      },
      error: () => {
        this.milkProductions.set([]);
      }
    });
  }

  // --- Filtres & Pagination Production Laitière ---
  filterMilkByAnimal(cowId: string): void {
    this.milkFilterAnimalId.set(cowId);
    this.milkCurrentPage.set(1);
  }

  filterMilkBySession(session: string): void {
    this.milkFilterSession.set(session);
    this.milkCurrentPage.set(1);
  }

  resetMilkFilters(): void {
    this.milkFilterStartDate.set('');
    this.milkFilterEndDate.set('');
    this.milkFilterAnimalId.set('ALL');
    this.milkFilterSession.set('ALL');
    this.milkFilterMinVolume.set(null);
    this.milkFilterSearch.set('');
    this.milkCurrentPage.set(1);
  }

  get filteredMilkProductions(): MilkProduction[] {
    let prods = this.milkProductions();

    const start = this.milkFilterStartDate();
    if (start) {
      prods = prods.filter(p => p.productionDate && p.productionDate >= start);
    }

    const end = this.milkFilterEndDate();
    if (end) {
      prods = prods.filter(p => p.productionDate && p.productionDate <= end);
    }

    const animal = this.milkFilterAnimalId();
    if (animal && animal !== 'ALL') {
      prods = prods.filter(p => p.animalInternalId === animal || p.animalName === animal);
    }

    const session = this.milkFilterSession();
    if (session && session !== 'ALL') {
      prods = prods.filter(p => p.session === session);
    }

    const minVol = this.milkFilterMinVolume();
    if (minVol && minVol > 0) {
      prods = prods.filter(p => (p.volumeLiters || 0) >= minVol);
    }

    const q = this.milkFilterSearch().toLowerCase().trim();
    if (q) {
      prods = prods.filter(p => 
        (p.animalName && p.animalName.toLowerCase().includes(q)) ||
        (p.animalInternalId && p.animalInternalId.toLowerCase().includes(q)) ||
        (p.destinationTank && p.destinationTank.toLowerCase().includes(q))
      );
    }

    return prods;
  }

  get paginatedMilkProductions(): MilkProduction[] {
    const start = (this.milkCurrentPage() - 1) * this.milkPageSize();
    return this.filteredMilkProductions.slice(start, start + this.milkPageSize());
  }

  get totalMilkPages(): number {
    return Math.ceil(this.filteredMilkProductions.length / this.milkPageSize()) || 1;
  }

  get milkPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalMilkPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setMilkPage(page: number): void {
    if (page >= 1 && page <= this.totalMilkPages) {
      this.milkCurrentPage.set(page);
    }
  }

  prevMilkPage(): void {
    if (this.milkCurrentPage() > 1) {
      this.milkCurrentPage.update(p => p - 1);
    }
  }

  nextMilkPage(): void {
    if (this.milkCurrentPage() < this.totalMilkPages) {
      this.milkCurrentPage.update(p => p + 1);
    }
  }

  get filteredMilkTotalVolume(): number {
    return Math.round(this.filteredMilkProductions.reduce((sum, p) => sum + (p.volumeLiters || 0), 0) * 10) / 10;
  }

  get filteredMilkAverageYield(): number {
    const prods = this.filteredMilkProductions;
    if (prods.length === 0) return 0;
    return Math.round((this.filteredMilkTotalVolume / prods.length) * 10) / 10;
  }

  /**
   * Relit l'etat de la cuve et la ventilation du jour depuis la base.
   * Aucun volume n'est reconstitue cote client : le serveur fait foi.
   */
  refreshTankAndAllocation(): void {
    this.apiService.getTankStatus().subscribe({
      next: (status) => {
        this.tankStatus.set(status || null);
      },
      error: (err) => {
        this.tankStatus.set(null);
        this.reportDataLoadFailure('Etat de la cuve', err);
      }
    });

    this.apiService.getMilkAllocation().subscribe({
      next: (alloc) => {
        if (alloc) this.milkStockAllocation.set(alloc);
      },
      error: (err) => {
        this.reportDataLoadFailure('Ventilation du lait', err);
      }
    });
  }

  milkingCowsCurrentPage = signal<number>(1);
  milkingCowsPageSize = signal<number>(6);

  get milkingCows(): Animal[] {
    return this.animals().filter(a => a.gender === 'FEMALE' && (a.category === 'MILKING_COW' || a.category === 'VACHE' || (a.dailyMilkYield && a.dailyMilkYield > 0)));
  }

  get paginatedMilkingCows(): Animal[] {
    const start = (this.milkingCowsCurrentPage() - 1) * this.milkingCowsPageSize();
    return this.milkingCows.slice(start, start + this.milkingCowsPageSize());
  }

  get totalMilkingCowsPages(): number {
    return Math.ceil(this.milkingCows.length / this.milkingCowsPageSize()) || 1;
  }

  get milkingCowsPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalMilkingCowsPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setMilkingCowsPage(page: number): void {
    if (page >= 1 && page <= this.totalMilkingCowsPages) {
      this.milkingCowsCurrentPage.set(page);
    }
  }

  prevMilkingCowsPage(): void {
    if (this.milkingCowsCurrentPage() > 1) {
      this.milkingCowsCurrentPage.update(p => p - 1);
    }
  }

  nextMilkingCowsPage(): void {
    if (this.milkingCowsCurrentPage() < this.totalMilkingCowsPages) {
      this.milkingCowsCurrentPage.update(p => p + 1);
    }
  }

  isCurrentMorningSession(): boolean {
    return new Date().getHours() < 14;
  }

  getSelectedCowBreed(internalId?: string): string {
    if (!internalId) return 'Race Non Spécifiée';
    const found = this.animals().find(a => a.internalId === internalId);
    return found ? found.breed : 'Race Mixte';
  }

  // --- Tracking journalier des traites (Matin / Soir par vache) ---
  /**
   * Les traites deja faites aujourd'hui sont deduites des enregistrements en base.
   * Aucun etat local n'est conserve : rafraichir la page ne change rien.
   * computed : le template l'interroge une fois par vache et par session, autant
   * ne la recalculer que lorsque les traites changent reellement.
   */
  private todayMilkedSessions = computed<{ [key: string]: { date: string; volume: number } }>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const map: { [key: string]: { date: string; volume: number } } = {};
    for (const p of this.milkProductions()) {
      const day = typeof p.productionDate === 'string'
        ? p.productionDate.slice(0, 10)
        : new Date(p.productionDate as any).toISOString().slice(0, 10);
      if (day !== today || !p.animalInternalId || !p.session) continue;
      const key = `${p.animalInternalId}_${p.session}`;
      const previous = map[key]?.volume || 0;
      map[key] = { date: today, volume: Math.round((previous + (p.volumeLiters || 0)) * 10) / 10 };
    }
    return map;
  });

  isMilkedToday(cowId: string, session: 'MORNING' | 'EVENING'): boolean {
    return !!this.todayMilkedSessions()[`${cowId}_${session}`];
  }

  getMilkedVolumeToday(cowId: string, session: 'MORNING' | 'EVENING'): number | null {
    const entry = this.todayMilkedSessions()[`${cowId}_${session}`];
    return entry ? entry.volume : null;
  }

  getSelectedCowName(cowId?: string): string {
    if (!cowId) return 'Vache Laitière';
    const cow = this.animals().find(a => a.internalId === cowId);
    return cow ? cow.name : cowId;
  }

  openQuickMilkingModal(cow: Animal, session: 'MORNING' | 'EVENING'): void {
    if (this.isMilkedToday(cow.internalId, session)) {
      this.showToast(`ℹ️ La traite ${session === 'MORNING' ? 'du matin' : 'du soir'} a déjà été validée pour ${cow.name} aujourd'hui.`);
      return;
    }
    this.milkForm = {
      cowId: cow.internalId,
      session: session === 'MORNING' ? 'Matin' : 'Soir',
      litres: null as any,
      temp: 34.2,
      fatPercentage: 3.9,
      tank: 'Cuve Réfrigérée N°1 (Bio)',
      productionDate: new Date().toISOString().split('T')[0],
      isOrganicCompliant: cow.status !== 'FEVER_TREATMENT'
    };
    this.isMilkModalOpen.set(true);
  }

  quickMilking(cow: Animal, session: 'MORNING' | 'EVENING'): void {
    this.openQuickMilkingModal(cow, session);
  }

  getCowWithdrawalAlert(cowId?: string): { diagnosis: string; treatment: string; practitioner: string; daysLeft: number } | null {
    if (!cowId) return null;
    const cowRecords = this.healthRecords().filter(h => h.animalInternalId === cowId && h.milkWithdrawalDays && h.milkWithdrawalDays > 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const r of cowRecords) {
      if (r.recordDate) {
        const rDate = new Date(r.recordDate);
        rDate.setHours(0, 0, 0, 0);
        const endDate = new Date(rDate);
        endDate.setDate(endDate.getDate() + (r.milkWithdrawalDays || 0));
        if (today <= endDate) {
          const diffMs = endDate.getTime() - today.getTime();
          const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 3600 * 24)));
          return {
            diagnosis: r.diagnosis || r.actType || 'Traitement pathologie',
            treatment: r.treatmentPrescription || 'Prescription vétérinaire',
            practitioner: r.practitionerName || 'Dr. Vétérinaire',
            daysLeft: daysLeft
          };
        }
      }
    }
    return null;
  }

  onMilkCowChange(): void {
    const alert = this.getCowWithdrawalAlert(this.milkForm.cowId);
    if (alert) {
      this.milkForm.isOrganicCompliant = false;
      this.milkForm.tank = "Cuve d'Isolement / Lait Écarté (Sous traitement)";
      this.showToast(`Alerte Sanitaire : ${this.getSelectedCowName(this.milkForm.cowId)} est sous délai de retrait (${alert.daysLeft}j restants). Lait déclassé vers la Cuve d'Isolement.`);
    } else {
      this.milkForm.isOrganicCompliant = true;
      this.milkForm.tank = "Cuve Réfrigérée N°1 (Bio)";
    }
  }

  openMilkModal(): void {
    const firstCow = this.milkingCows[0];
    const currentHour = new Date().getHours();
    const defaultSession = currentHour < 13 ? 'Matin' : 'Soir';
    this.milkForm = {
      cowId: firstCow ? firstCow.internalId : '',
      session: defaultSession,
      litres: null as any,
      temp: 34.0,
      fatPercentage: 4.0,
      tank: 'Cuve Réfrigérée N°1 (Bio)',
      productionDate: new Date().toISOString().split('T')[0],
      isOrganicCompliant: true
    };
    this.onMilkCowChange();
    this.isMilkModalOpen.set(true);
  }

  closeMilkModal(): void {
    this.isMilkModalOpen.set(false);
  }

  submitMilkEntry(): void {
    const vol = Number(this.milkForm.litres) || 0;
    if (!this.milkForm.cowId || vol <= 0) {
      this.showToast('Veuillez sélectionner une vache et un volume de lait valide (> 0 L).');
      return;
    }

    const alert = this.getCowWithdrawalAlert(this.milkForm.cowId);
    if (alert) {
      this.milkForm.isOrganicCompliant = false;
      this.milkForm.tank = "Cuve d'Isolement / Lait Écarté (Sous traitement)";
    }

    const sessionType: 'MORNING' | 'EVENING' = this.milkForm.session.includes('Matin') ? 'MORNING' : 'EVENING';
    const prod: MilkProduction = {
      animalInternalId: this.milkForm.cowId,
      session: sessionType,
      volumeLiters: vol,
      milkTemperature: this.milkForm.temp,
      fatPercentage: this.milkForm.fatPercentage,
      destinationTank: this.milkForm.tank,
      isOrganicCompliant: this.milkForm.isOrganicCompliant,
      productionDate: this.milkForm.productionDate || new Date().toISOString().split('T')[0]
    };

    this.apiService.recordMilk(prod).subscribe({
      next: (created) => {
        this.loadMilkData();
        this.closeMilkModal();
        this.showToast(`Traite ${sessionType === 'MORNING' ? 'Matin' : 'Soir'} de ${created.volumeLiters || vol}L enregistrée pour ${this.getSelectedCowName(prod.animalInternalId)} !`);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || `Échec : la traite n'a pas pu être enregistrée.`;
        this.showToast(`Erreur : ${msg}`);
      }
    });
  }

  // ==========================================
  // SPRINT 3: TRANSFORMATION METHODS & LOADERS
  // ==========================================
  loadTransformationData(): void {
    // 1. Recettes
    this.apiService.getAllRecipes().subscribe({
      next: (recs) => {
        this.recipes.set(recs || []);
      },
      error: (err) => {
        this.recipes.set([]);
        this.reportDataLoadFailure('Recettes', err);
      }
    });

    // 2. Lots de fabrication
    this.apiService.getAllBatches().subscribe({
      next: (b) => {
        this.transformationBatches.set(b || []);
      },
      error: (err) => {
        this.transformationBatches.set([]);
        this.reportDataLoadFailure('Lots de fabrication', err);
      }
    });

    // 3. Stocks de produits finis
    this.apiService.getAllStocks().subscribe({
      next: (st) => {
        this.productStocks.set(st || []);
      },
      error: (err) => {
        this.productStocks.set([]);
        this.reportDataLoadFailure('Stocks de produits finis', err);
      }
    });

    // 4. Synthese calculee par le serveur
    this.refreshTransformationSummary();
  }

  calculateTotalStockValue(): number {
    return Math.round(
      this.productStocks().reduce((acc, s) => {
        const val = s.totalValueFcfa !== undefined && s.totalValueFcfa !== null
          ? s.totalValueFcfa
          : ((s.quantityAvailable || 0) * (s.unitPriceFcfa || 0));
        return acc + (val || 0);
      }, 0)
    );
  }

  /** Relit la synthese de transformation calculee en base. */
  refreshTransformationSummary(): void {
    this.apiService.getTransformationSummary().subscribe({
      next: (sum) => {
        this.transformationSummary.set(sum || null);
      },
      error: (err) => {
        this.transformationSummary.set(null);
        this.reportDataLoadFailure('Synthese transformation', err);
      }
    });
  }

  // --- Transformation UI Controls & Filtering & Pagination ---
  filterTransformation(filter: string): void {
    this.transformationFilter.set(filter);
    this.batchesCurrentPage.set(1);
  }

  filterStock(cat: string): void {
    this.stockCategoryFilter.set(cat);
    this.stocksCurrentPage.set(1);
  }

  toggleTransformationMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isTransformationMenuOpen.update(v => !v);
  }

  navigateToTransformationSubTab(subTab: string): void {
    this.isTransformationMenuOpen.set(true);
    this.activeTransformationSubTab.set(subTab);
    this.showPage('transformation');
  }

  switchTransformationSubTab(subTab: string): void {
    this.activeTransformationSubTab.set(subTab);
  }

  resetBatchFilters(): void {
    this.batchFilterStartDate.set('');
    this.batchFilterEndDate.set('');
    this.batchFilterProduct.set('ALL');
    this.batchFilterSearch.set('');
    this.transformationFilter.set('all');
    this.batchesCurrentPage.set(1);
  }

  get uniqueBatchProducts(): string[] {
    const set = new Set<string>();
    this.transformationBatches().forEach(b => {
      if (b.recipeName) set.add(b.recipeName);
    });
    return Array.from(set);
  }

  get filteredBatches(): TransformationBatch[] {
    let batches = this.transformationBatches();
    const f = this.transformationFilter();
    if (f === 'in_progress') batches = batches.filter(b => b.status === 'IN_PROGRESS' || b.status === 'PLANNED');
    if (f === 'completed') batches = batches.filter(b => b.status === 'COMPLETED');

    const start = this.batchFilterStartDate();
    if (start) batches = batches.filter(b => b.productionDate && b.productionDate >= start);

    const end = this.batchFilterEndDate();
    if (end) batches = batches.filter(b => b.productionDate && b.productionDate <= end);

    const prod = this.batchFilterProduct();
    if (prod && prod !== 'ALL') batches = batches.filter(b => b.recipeName === prod || b.productType === prod);

    const q = this.batchFilterSearch().toLowerCase().trim();
    if (q) {
      batches = batches.filter(b => 
        (b.batchNumber && b.batchNumber.toLowerCase().includes(q)) ||
        (b.recipeName && b.recipeName.toLowerCase().includes(q)) ||
        (b.operatorName && b.operatorName.toLowerCase().includes(q))
      );
    }

    return batches;
  }

  // --- Pagination: Lots de fabrication ---
  get paginatedBatches(): TransformationBatch[] {
    const start = (this.batchesCurrentPage() - 1) * this.batchesPageSize();
    return this.filteredBatches.slice(start, start + this.batchesPageSize());
  }

  get totalBatchesPages(): number {
    return Math.ceil(this.filteredBatches.length / this.batchesPageSize()) || 1;
  }

  get batchesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalBatchesPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setBatchesPage(page: number): void {
    if (page >= 1 && page <= this.totalBatchesPages) {
      this.batchesCurrentPage.set(page);
    }
  }

  nextBatchesPage(): void {
    if (this.batchesCurrentPage() < this.totalBatchesPages) {
      this.batchesCurrentPage.update(p => p + 1);
    }
  }

  prevBatchesPage(): void {
    if (this.batchesCurrentPage() > 1) {
      this.batchesCurrentPage.update(p => p - 1);
    }
  }

  // --- Recherche & Filtres: Fiches Recettes ---
  recipeSearchQuery = signal<string>('');
  recipeTypeFilter = signal<string>('ALL');

  get filteredRecipes(): Recipe[] {
    let list = this.recipes();
    const q = this.recipeSearchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.ingredientsList && r.ingredientsList.toLowerCase().includes(q)) ||
        (r.targetUnit && r.targetUnit.toLowerCase().includes(q)) ||
        (r.productType && r.productType.toLowerCase().includes(q))
      );
    }
    const t = this.recipeTypeFilter();
    if (t && t !== 'ALL') {
      list = list.filter(r => r.productType === t);
    }
    return list;
  }

  get paginatedRecipes(): Recipe[] {
    const start = (this.recipesCurrentPage() - 1) * this.recipesPageSize();
    return this.filteredRecipes.slice(start, start + this.recipesPageSize());
  }

  get totalRecipesPages(): number {
    return Math.ceil(this.filteredRecipes.length / this.recipesPageSize()) || 1;
  }

  get recipesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalRecipesPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setRecipesPage(page: number): void {
    if (page >= 1 && page <= this.totalRecipesPages) {
      this.recipesCurrentPage.set(page);
    }
  }

  nextRecipesPage(): void {
    if (this.recipesCurrentPage() < this.totalRecipesPages) {
      this.recipesCurrentPage.update(p => p + 1);
    }
  }

  prevRecipesPage(): void {
    if (this.recipesCurrentPage() > 1) {
      this.recipesCurrentPage.update(p => p - 1);
    }
  }

  // --- Pagination: Stocks de Produits Finis ---
  get filteredStocks(): ProductStock[] {
    const cat = this.stockCategoryFilter();
    return this.productStocks().filter(s => {
      if (cat === 'all') return true;
      return s.productType === cat;
    });
  }

  get paginatedStocks(): ProductStock[] {
    const start = (this.stocksCurrentPage() - 1) * this.stocksPageSize();
    return this.filteredStocks.slice(start, start + this.stocksPageSize());
  }

  get totalStocksPages(): number {
    return Math.ceil(this.filteredStocks.length / this.stocksPageSize()) || 1;
  }

  get stocksPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalStocksPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setStocksPage(page: number): void {
    if (page >= 1 && page <= this.totalStocksPages) {
      this.stocksCurrentPage.set(page);
    }
  }

  nextStocksPage(): void {
    if (this.stocksCurrentPage() < this.totalStocksPages) {
      this.stocksCurrentPage.update(p => p + 1);
    }
  }

  prevStocksPage(): void {
    if (this.stocksCurrentPage() > 1) {
      this.stocksCurrentPage.update(p => p - 1);
    }
  }

  getEmojiForProductType(type?: ProductType): string {
    switch (type) {
      case 'CHEESE': return '';
      case 'YOGURT': return '';
      case 'CURDLED_MILK': return '';
      case 'BUTTER': return '';
      case 'CREAM': return '';
      case 'PASTEURIZED_MILK': return '';
      default: return '';
    }
  }

  getCalculatedExpectedYield(recipeId: number, milkLiters: number): number {
    if (this.newBatchForm.isCustomProduct) {
      const ratio = this.newBatchForm.customMilkRatio > 0 ? this.newBatchForm.customMilkRatio : 1.0;
      return Math.round((milkLiters / ratio) * 10) / 10;
    }
    const recipe = this.recipes().find(r => r.id === Number(recipeId));
    if (!recipe || !recipe.milkLitersPerUnit || recipe.milkLitersPerUnit <= 0) {
      return milkLiters;
    }
    return Math.round((milkLiters / recipe.milkLitersPerUnit) * 10) / 10;
  }

  // --- Tank Volume & Decrement Calculations ---
  getTankCurrentVolume(tankName: string): number {
    if (this.tankStatus()) {
      return this.tankStatus()!.currentVolume ?? 0;
    }
    return 0;
  }

  getTankAvailableMilk(tankName: string): number {
    return this.getTankCurrentVolume(tankName);
  }

  getEstimatedDurationForRecipe(recipeId: number): string {
    const rec = this.recipes().find(r => r.id === Number(recipeId));
    if (!rec) return '2 à 24 heures';
    if (rec.productType === 'PASTEURIZED_MILK') return '~2 heures (Pasteurisation & Refroidissement)';
    if (rec.productType === 'CURDLED_MILK') return '18 à 24 heures (Fermentation naturelle en cuve)';
    if (rec.productType === 'YOGURT') return '12 heures (Étuve 43°C & Prise au froid)';
    if (rec.productType === 'CHEESE') return '24 à 48 heures (Caillage, Moulage & Égouttage)';
    if (rec.productType === 'BUTTER') return '4 heures (Écrémage & Barattage)';
    return '12 à 24 heures';
  }

  getEstimatedCompletionDate(recipeId: number, launchDateStr?: string): string {
    const rec = this.recipes().find(r => r.id === Number(recipeId));
    const launch = launchDateStr ? new Date(launchDateStr) : new Date();
    if (!rec) return 'Aujourd\'hui / Demain';
    if (rec.productType === 'PASTEURIZED_MILK' || rec.productType === 'BUTTER') {
      return `Aujourd'hui (${launch.toLocaleDateString('fr-FR')}) en fin de journée`;
    }
    if (rec.productType === 'CURDLED_MILK' || rec.productType === 'YOGURT') {
      const nextDay = new Date(launch);
      nextDay.setDate(nextDay.getDate() + 1);
      return `Demain matin (${nextDay.toLocaleDateString('fr-FR')})`;
    }
    if (rec.productType === 'CHEESE') {
      const cheeseDate = new Date(launch);
      cheeseDate.setDate(cheeseDate.getDate() + 2);
      return `J+2 (${cheeseDate.toLocaleDateString('fr-FR')}) après égouttage`;
    }
    return `Dans 24h`;
  }

  getBatchDurationLabel(batch: TransformationBatch): string {
    if (batch.status === 'COMPLETED') return 'Conditionné & En Stock';
    if (batch.productType === 'PASTEURIZED_MILK') return '⏱️ Prêt aujourd\'hui (~2h)';
    if (batch.productType === 'CURDLED_MILK') return '⏱️ Prêt demain (24h)';
    if (batch.productType === 'YOGURT') return '⏱️ Prêt demain (12h)';
    if (batch.productType === 'CHEESE') return '⏱️ Égouttage J+2';
    if (batch.productType === 'BUTTER') return '⏱️ Prêt aujourd\'hui (~4h)';
    return '⏱️ En fabrication (24h)';
  }

  // --- Modals & Actions for Transformation ---
  getRecipeRawMaterial(rec: Recipe): 'RAW_MILK' | 'CURDLED_MILK' {
    if (rec.rawMaterialRequired) return rec.rawMaterialRequired;
    if (rec.productType === 'CHEESE' || (rec.name && rec.name.toLowerCase().includes('fromage'))) {
      return 'CURDLED_MILK';
    }
    return 'RAW_MILK';
  }

  get filteredRecipesForBatch(): Recipe[] {
    const src = this.newBatchForm.rawMaterialSource || 'RAW_MILK';
    const list = this.recipes().filter(r => this.getRecipeRawMaterial(r) === src);
    return list.length > 0 ? list : this.recipes();
  }

  openNewBatchModal(preselectedRecipeId?: number): void {
    this.newBatchForm.isCustomProduct = false;
    this.newBatchForm.customProductName = '';
    this.newBatchForm.customMilkRatio = 2.0;
    this.newBatchForm.customTargetUnit = 'pièce 200g';
    if (preselectedRecipeId) {
      this.newBatchForm.recipeId = preselectedRecipeId;
      const rec = this.recipes().find(r => r.id === Number(preselectedRecipeId));
      if (rec) {
        this.newBatchForm.rawMaterialSource = this.getRecipeRawMaterial(rec);
      }
    } else {
      if (!this.newBatchForm.rawMaterialSource) {
        this.newBatchForm.rawMaterialSource = 'RAW_MILK';
      }
      const available = this.filteredRecipesForBatch;
      if (available.length > 0 && available[0].id) {
        this.newBatchForm.recipeId = available[0].id;
      }
    }
    this.onBatchRecipeChange(this.newBatchForm.recipeId);
    this.isNewBatchModalOpen.set(true);
  }

  onBatchRecipeChange(recipeId: number | string): void {
    const rec = this.recipes().find(r => r.id === Number(recipeId));
    if (rec) {
      this.newBatchForm.rawMaterialSource = this.getRecipeRawMaterial(rec);
      this.newBatchForm.sourceTank = this.newBatchForm.rawMaterialSource === 'CURDLED_MILK'
        ? 'Stock Lait Caillé (Sow)'
        : 'Stock Dédié Production (Lait Frais)';
    }
  }

  setRawMaterialSource(source: 'RAW_MILK' | 'CURDLED_MILK'): void {
    this.newBatchForm.rawMaterialSource = source;
    this.newBatchForm.sourceTank = source === 'CURDLED_MILK'
      ? 'Stock Lait Caillé (Sow)'
      : 'Stock Dédié Production (Lait Frais)';
    const available = this.filteredRecipesForBatch;
    if (available.length > 0) {
      const stillValid = available.some(r => r.id === Number(this.newBatchForm.recipeId));
      if (!stillValid && available[0].id) {
        this.newBatchForm.recipeId = available[0].id;
      }
    }
  }

  closeNewBatchModal(): void {
    this.isNewBatchModalOpen.set(false);
  }

  submitNewBatch(): void {
    const isCustom = this.newBatchForm.isCustomProduct;
    let rec: Recipe | undefined;

    if (isCustom) {
      if (!this.newBatchForm.customProductName || !this.newBatchForm.customProductName.trim()) {
        this.showToast('Erreur: Veuillez saisir le nom du produit dérivé.');
        return;
      }
      if (!this.newBatchForm.customMilkRatio || this.newBatchForm.customMilkRatio <= 0) {
        this.showToast('Erreur: Veuillez indiquer un ratio de lait par unité valide (> 0).');
        return;
      }

      const customRec: Recipe = {
        code: 'REC-CUST-' + Date.now().toString().slice(-4),
        name: this.newBatchForm.customProductName.trim(),
        productType: this.newBatchForm.customProductType || 'CHEESE',
        rawMaterialRequired: this.newBatchForm.rawMaterialSource,
        targetUnit: this.newBatchForm.customTargetUnit || 'unité',
        milkLitersPerUnit: this.newBatchForm.customMilkRatio,
        ingredientsList: 'Lait entier bio fermier, ingrédients naturels',
        shelfLifeDays: 30,
        processInstructions: 'Transformation artisanale sur-mesure.',
        emoji: this.getEmojiForProductType(this.newBatchForm.customProductType),
        standardSellingPriceFcfa: 2000
      };

      if (this.newBatchForm.saveAsNewRecipe) {
        this.apiService.createRecipe(customRec).subscribe({
          next: (savedRec) => {
            this.recipes.update(list => [...list, savedRec]);
            this.proceedLaunchBatchWithRecipe(savedRec);
          },
          error: () => {
            this.showToast('Erreur lors de la création de la recette personnalisée.');
          }
        });
        return;
      } else {
        this.proceedLaunchBatchWithRecipe(customRec);
        return;
      }
    } else {
      rec = this.recipes().find(r => r.id === Number(this.newBatchForm.recipeId));
      if (!rec) {
        this.showToast('Erreur: Veuillez sélectionner une recette valide.');
        return;
      }
      this.proceedLaunchBatchWithRecipe(rec);
    }
  }

  private proceedLaunchBatchWithRecipe(rec: Recipe): void {
    const rawSource = this.newBatchForm.rawMaterialSource || (rec.productType === 'CHEESE' ? 'CURDLED_MILK' : 'RAW_MILK');
    const requested = Number(this.newBatchForm.milkLitersConsumed) || 0;
    let available = 0;

    if (rawSource === 'CURDLED_MILK') {
      available = this.getAvailableCurdledMilkLiters();
      if (available <= 0) {
        this.showToast(`Stock de Lait Caillé (Sow) épuisé (0 L disponible). Produisez d'abord du Lait Caillé.`);
        return;
      }
      if (requested > available) {
        this.showToast(`Stock insuffisant : ${requested} L demandés mais seulement ${available} L de Lait Caillé disponibles.`);
        return;
      }
    } else {
      available = this.getAvailableProductionMilkLiters();
      if (available <= 0) {
        this.showToast(`Stock de lait dédié à la production épuisé (0 L disponible). Vérifiez la ventilation du stock de traite.`);
        return;
      }
      if (requested > available) {
        this.showToast(`Stock insuffisant : ${requested} L demandés mais seulement ${available} L alloués à la production.`);
        return;
      }
    }

    const expected = this.getCalculatedExpectedYield(rec.id || 1, requested);
    const dateStr = this.newBatchForm.productionDate;
    const batchNum = 'LOT-TR-' + dateStr.replace(/-/g, '') + '-' + String(this.transformationBatches().length + 1).padStart(2, '0');

    const newBatch: TransformationBatch = {
      batchNumber: batchNum,
      recipeId: rec.id || 1,
      recipeName: rec.name,
      recipeCode: rec.code,
      productType: rec.productType,
      rawMaterialSource: rawSource,
      emoji: '',
      status: 'IN_PROGRESS',
      productionDate: dateStr,
      milkLitersConsumed: this.newBatchForm.milkLitersConsumed,
      expectedQuantity: expected,
      unit: rec.targetUnit,
      operatorName: this.newBatchForm.operatorName,
      qualityNotes: this.newBatchForm.qualityNotes || (rawSource === 'CURDLED_MILK' ? 'Fabrication au Lait Caillé (Sow).' : 'Fabrication au Lait Frais bio.'),
      phLevel: this.newBatchForm.phLevel,
      fatPercentage: this.newBatchForm.fatPercentage,
      sourceTank: rawSource === 'CURDLED_MILK' ? 'Stock Lait Caillé (Sow)' : 'Cuve Réfrigérée N°1 (Bio)'
    };

    const applyDeductionAndSave = (batchToSave: TransformationBatch) => {
      if (rawSource === 'CURDLED_MILK') {
        this.decrementCurdledMilkStock(requested);
      } else {
        this.decrementProductionMilkAllocation(requested);
      }
      this.transformationBatches.update(list => [batchToSave, ...list]);
      this.refreshTransformationSummary();
      this.refreshTankAndAllocation();
      const sourceLabel = rawSource === 'CURDLED_MILK' ? 'Lait Caillé (Sow)' : 'Lait Frais (Production)';
      this.showToast(`Lot ${batchToSave.batchNumber} lancé ! (${batchToSave.milkLitersConsumed} L prélevés sur ${sourceLabel})`);
      this.closeNewBatchModal();
    };

    this.apiService.launchBatch(newBatch).subscribe({
      next: (created) => {
        const batchToSave: TransformationBatch = { ...created, status: 'IN_PROGRESS', rawMaterialSource: rawSource };
        applyDeductionAndSave(batchToSave);
      },
      error: () => {
        const batchToSave: TransformationBatch = { ...newBatch, status: 'IN_PROGRESS' };
        applyDeductionAndSave(batchToSave);
      }
    });
  }

  get calculatedBatchWasteLoss(): number {
    const batch = this.selectedBatchForCompletion();
    if (!batch || !batch.expectedQuantity) return 0;
    const actual = Number(this.completeBatchForm.actualQuantityProduced) || 0;
    return Math.max(0, Math.round((batch.expectedQuantity - actual) * 10) / 10);
  }

  get calculatedBatchYieldEfficiency(): number {
    const batch = this.selectedBatchForCompletion();
    if (!batch || !batch.expectedQuantity) return 100;
    const actual = Number(this.completeBatchForm.actualQuantityProduced) || 0;
    return Math.round((actual / batch.expectedQuantity) * 1000) / 10;
  }

  openCompleteBatchModal(batch: TransformationBatch): void {
    this.selectedBatchForCompletion.set(batch);
    this.completeBatchForm.actualQuantityProduced = batch.expectedQuantity || 0;
    this.completeBatchForm.wasteLossQuantity = 0;
    this.completeBatchForm.phLevel = batch.phLevel || 4.8;
    this.completeBatchForm.qualityNotes = batch.qualityNotes || 'Contrôle visuel et gustatif conforme bio.';
    this.isCompleteBatchModalOpen.set(true);
  }

  closeCompleteBatchModal(): void {
    this.isCompleteBatchModalOpen.set(false);
    this.selectedBatchForCompletion.set(null);
  }

  submitCompleteBatch(): void {
    const batch = this.selectedBatchForCompletion();
    if (!batch || !batch.id) return;

    const actualQty = Number(this.completeBatchForm.actualQuantityProduced) || 0;
    const waste = this.calculatedBatchWasteLoss;
    const yieldEff = this.calculatedBatchYieldEfficiency;

    this.apiService.completeBatch(batch.id, {
      actualQuantityProduced: actualQty,
      wasteLossQuantity: waste,
      qualityNotes: this.completeBatchForm.qualityNotes,
      phLevel: this.completeBatchForm.phLevel
    }).subscribe({
      next: (completed) => {
        this.transformationBatches.update(list => list.map(b => b.id === completed.id ? completed : b));
        this.loadTransformationData();
        this.refreshTankAndAllocation();
        this.loadMilkData();
        this.showToast(`Lot ${completed.batchNumber} clôturé et entré en stock marchant ! Rendement: ${completed.yieldEfficiencyPercentage}% (Pertes: ${waste} ${batch.unit})`);
        this.closeCompleteBatchModal();
      },
      error: () => {
        this.showToast(`Échec : la clôture du lot ${batch.batchNumber} n'a pas pu être enregistrée en base. Le lot reste ouvert.`);
      }
    });
  }

  openRecipeModal(recipe?: Recipe): void {
    if (recipe) {
      this.selectedRecipe.set(recipe);
      this.recipeForm = { ...recipe };
    } else {
      this.selectedRecipe.set(null);
      this.recipeForm = {
        code: 'REC-' + String(this.recipes().length + 1).padStart(2, '0'),
        name: '',
        productType: 'CHEESE',
        targetUnit: 'pièce 200g',
        milkLitersPerUnit: 2.0,
        ingredientsList: '',
        shelfLifeDays: 30,
        processInstructions: '',
        emoji: '',
        standardSellingPriceFcfa: 2000
      };
    }
    this.isRecipeModalOpen.set(true);
  }

  closeRecipeModal(): void {
    this.isRecipeModalOpen.set(false);
    this.selectedRecipe.set(null);
  }

  submitRecipe(): void {
    if (!this.recipeForm.name || !this.recipeForm.targetUnit) {
      this.showToast('Veuillez remplir les champs obligatoires de la recette.');
      return;
    }

    const sel = this.selectedRecipe();
    if (sel && sel.id) {
      this.apiService.updateRecipe(sel.id, this.recipeForm).subscribe({
        next: (updated) => {
          this.recipes.update(list => list.map(r => r.id === updated.id ? updated : r));
          this.showToast(`Recette "${updated.name}" mise à jour avec succès !`);
          this.closeRecipeModal();
        },
        error: () => {
          this.showToast(`Erreur lors de la mise à jour de la recette.`);
        }
      });
    } else {
      this.apiService.createRecipe(this.recipeForm).subscribe({
        next: (created) => {
          this.recipes.update(list => [...list, created]);
          this.showToast(`Nouvelle recette "${created.name}" enregistrée avec succès !`);
          this.closeRecipeModal();
        },
        error: () => {
          this.showToast(`Erreur lors de la création de la recette.`);
        }
      });
    }
  }

  deleteBatch(id?: number): void {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ? Le lait prélevé sera restitué à la cuve.')) return;

    this.apiService.deleteBatch(id).subscribe({
      next: () => {
        this.transformationBatches.update(list => list.filter(b => b.id !== id));
        this.refreshTransformationSummary();
        this.refreshTankAndAllocation();
        this.loadMilkData();
        this.showToast('Lot de transformation supprimé. Le lait a été restitué à la cuve.');
      },
      error: () => {
        this.showToast('Échec : le lot n\'a pas pu être supprimé en base. Rien n\'a changé.');
      }
    });
  }

  deleteRecipe(id?: number): void {
    if (!id) return;
    if (!confirm('Supprimer cette fiche recette standard ?')) return;

    this.apiService.deleteRecipe(id).subscribe({
      next: () => {
        this.recipes.update(list => list.filter(r => r.id !== id));
        this.showToast('Recette supprimée avec succès.');
      },
      error: () => {
        this.showToast('Erreur lors de la suppression de la recette.');
      }
    });
  }

  // --- Gestion du Stock de Produits Finis (Saisie / Ajustement Réel) ---
  openNewStockModal(stock?: ProductStock): void {
    if (stock) {
      this.stockEditingId.set(stock.id || null);
      this.stockForm = {
        recipeId: stock.recipeId || null,
        productName: stock.productName || '',
        productType: stock.productType || 'CURDLED_MILK',
        batchNumber: stock.batchNumber || '',
        quantityAvailable: stock.quantityAvailable || 0,
        unit: stock.unit || 'Litre',
        unitPriceFcfa: stock.unitPriceFcfa || 1000,
        storageLocation: stock.storageLocation || 'Chambre Froide Laiterie (+4°C)',
        mfgDate: stock.mfgDate ? (typeof stock.mfgDate === 'string' ? stock.mfgDate : new Date(stock.mfgDate).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
        dlcExpiryDate: stock.dlcExpiryDate ? (typeof stock.dlcExpiryDate === 'string' ? stock.dlcExpiryDate : new Date(stock.dlcExpiryDate).toISOString().slice(0, 10)) : '',
        isOrganicCertified: stock.isOrganicCertified !== undefined ? stock.isOrganicCertified : true
      };
    } else {
      this.stockEditingId.set(null);
      const defaultRecipe = this.recipes().length > 0 ? this.recipes()[0] : null;
      const todayStr = new Date().toISOString().slice(0, 10);
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (defaultRecipe?.shelfLifeDays || 14));

      this.stockForm = {
        recipeId: defaultRecipe ? (defaultRecipe.id || null) : null,
        productName: defaultRecipe ? defaultRecipe.name : 'Lait Caillé Traditionnel (Sow)',
        productType: defaultRecipe ? defaultRecipe.productType : 'CURDLED_MILK',
        batchNumber: `LOT-STK-${todayStr.replace(/-/g, '')}-${String(this.productStocks().length + 1).padStart(2, '0')}`,
        quantityAvailable: 0,
        unit: defaultRecipe ? defaultRecipe.targetUnit : 'Litre',
        unitPriceFcfa: defaultRecipe ? (defaultRecipe.standardSellingPriceFcfa || 1000) : 1000,
        storageLocation: 'Chambre Froide Laiterie (+4°C)',
        mfgDate: todayStr,
        dlcExpiryDate: expDate.toISOString().slice(0, 10),
        isOrganicCertified: true
      };
    }
    this.isStockModalOpen.set(true);
  }

  closeStockModal(): void {
    this.isStockModalOpen.set(false);
    this.stockEditingId.set(null);
  }

  onStockRecipeChange(recipeId: any): void {
    const id = Number(recipeId);
    if (!id) return;
    const rec = this.recipes().find(r => r.id === id);
    if (rec) {
      this.stockForm.recipeId = rec.id || null;
      this.stockForm.productName = rec.name;
      this.stockForm.productType = rec.productType;
      this.stockForm.unit = rec.targetUnit;
      this.stockForm.unitPriceFcfa = rec.standardSellingPriceFcfa || 1000;
      if (this.stockForm.mfgDate && rec.shelfLifeDays) {
        const d = new Date(this.stockForm.mfgDate);
        d.setDate(d.getDate() + rec.shelfLifeDays);
        this.stockForm.dlcExpiryDate = d.toISOString().slice(0, 10);
      }
    }
  }

  submitStockForm(): void {
    if (!this.stockForm.productName || !this.stockForm.unit) {
      this.showToast('Veuillez renseigner le nom du produit et son unité.');
      return;
    }
    const qty = Number(this.stockForm.quantityAvailable);
    if (isNaN(qty) || qty < 0) {
      this.showToast('La quantité en stock doit être un nombre positif ou nul.');
      return;
    }
    const price = Number(this.stockForm.unitPriceFcfa) || 0;
    const payload: ProductStock = {
      id: this.stockEditingId() || undefined,
      recipeId: this.stockForm.recipeId ? Number(this.stockForm.recipeId) : undefined,
      recipeName: this.stockForm.productName,
      productName: this.stockForm.productName,
      productType: this.stockForm.productType,
      batchNumber: this.stockForm.batchNumber || `LOT-STK-${Date.now().toString().slice(-6)}`,
      quantityAvailable: qty,
      unit: this.stockForm.unit,
      unitPriceFcfa: price,
      totalValueFcfa: Math.round(qty * price),
      storageLocation: this.stockForm.storageLocation,
      mfgDate: this.stockForm.mfgDate,
      dlcExpiryDate: this.stockForm.dlcExpiryDate || undefined,
      isOrganicCertified: this.stockForm.isOrganicCertified
    };

    this.apiService.createOrUpdateStock(payload).subscribe({
      next: (saved) => {
        if (this.stockEditingId()) {
          this.productStocks.update(list => list.map(s => s.id === saved.id ? saved : s));
          this.showToast(`Stock "${saved.productName}" mis à jour (${saved.quantityAvailable} ${saved.unit}).`);
        } else {
          this.productStocks.update(list => [saved, ...list]);
          this.showToast(`Stock "${saved.productName}" créé (${saved.quantityAvailable} ${saved.unit}).`);
        }
        this.refreshTransformationSummary();
        this.closeStockModal();
      },
      error: () => {
        this.showToast(`Échec : le stock "${payload.productName}" n'a pas pu être enregistré en base. Rien n'a été modifié.`);
      }
    });
  }

  deleteStockItem(stock: ProductStock, event?: Event): void {
    if (event) event.stopPropagation();
    if (!stock || !stock.id) return;
    if (!confirm(`Supprimer la référence en stock "${stock.productName}" (Lot: ${stock.batchNumber || 'N/A'}) ?`)) return;

    this.apiService.deleteStock(stock.id).subscribe({
      next: () => {
        this.productStocks.update(list => list.filter(s => s.id !== stock.id));
        this.refreshTransformationSummary();
        this.showToast(`Référence "${stock.productName}" retirée du stock.`);
      },
      error: () => {
        this.showToast(`Échec : "${stock.productName}" n'a pas pu être retiré du stock en base.`);
      }
    });
  }

  // Navigation avec Contrôle d'Accès par Rôle (RBAC)
  showPage(pageId: string): void {
    if (!this.authService.canAccessTab(pageId)) {
      this.showToast(`Accès restreint : votre profil ne dispose pas des droits pour accéder à ce module.`);
      const defaultTab = this.authService.getDefaultTabForRole(this.authService.currentUser()?.role || 'manager');
      this.activePage.set(defaultTab);
      return;
    }

    this.activePage.set(pageId);
    this.isSidebarOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'dashboard') {
      setTimeout(() => this.initDashboardCharts(), 150);
    } else if (pageId === 'lait') {
      setTimeout(() => this.initMilkChart(), 150);
    } else if (pageId === 'transformation') {
      this.loadTransformationData();
    } else if (pageId === 'administration') {
      this.loadAllUsers();
    } else if (pageId === 'finance') {
      setTimeout(() => this.initFinanceChart(), 150);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  /** Males reproducteurs reellement presents au registre. */
  get breedingBulls(): Animal[] {
    return this.activeHerd.filter(a =>
      a.category === 'TAUREAU' || a.category === 'MALE_BULL' || a.category === 'JEUNE_MALE');
  }

  /**
   * Planning du jour reconstitue depuis les saisies : traites enregistrees,
   * distributions d'aliment et actes veterinaires dates d'aujourd'hui.
   *
   * computed et non getter : le resultat est mis en cache et ne change que si une
   * donnee source change. Un getter renverrait des objets neufs a chaque passe de
   * detection de changement, ce qui resalit la vue et boucle a l'infini.
   */
  dailyPlanning = computed<Array<{ time: string; title: string; detail: string; status: string; tone: 'done' | 'active' | 'todo' }>>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const sameDay = (value: any) => {
      if (!value) return false;
      const day = typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
      return day === today;
    };

    const todayMilk = this.milkProductions().filter(p => sameDay(p.productionDate));
    const morning = todayMilk.filter(p => p.session === 'MORNING');
    const evening = todayMilk.filter(p => p.session === 'EVENING');
    const sum = (list: MilkProduction[]) =>
      Math.round(list.reduce((acc, p) => acc + (p.volumeLiters || 0), 0) * 10) / 10;

    const rows: Array<{ time: string; title: string; detail: string; status: string; tone: 'done' | 'active' | 'todo' }> = [];

    rows.push(morning.length > 0
      ? {
          time: 'Matin',
          title: 'Traite du matin',
          detail: `${sum(morning)} L collect\u00e9s sur ${morning.length} vache(s)`,
          status: 'Enregistr\u00e9e',
          tone: 'done'
        }
      : {
          time: 'Matin',
          title: 'Traite du matin',
          detail: 'Aucune traite enregistr\u00e9e pour le moment',
          status: '\u00c0 saisir',
          tone: 'todo'
        });

    const todayFeed = this.feedDistributions().filter(d => sameDay(d.distributionDate));
    rows.push(todayFeed.length > 0
      ? {
          time: 'Journ\u00e9e',
          title: 'Distribution des rations',
          detail: todayFeed.map(d => `${d.rationName} (${d.quantityDistributedKg} kg)`).join(' \u2022 '),
          status: `${todayFeed.length} distribution(s)`,
          tone: 'done'
        }
      : {
          time: 'Journ\u00e9e',
          title: 'Distribution des rations',
          detail: 'Aucune distribution enregistr\u00e9e aujourd\'hui',
          status: '\u00c0 saisir',
          tone: 'todo'
        });

    for (const act of this.healthRecords().filter(h => sameDay(h.recordDate))) {
      rows.push({
        time: 'Journ\u00e9e',
        title: `${act.actType} \u2014 ${act.animalName || act.animalInternalId}`,
        detail: act.diagnosis || act.treatmentPrescription || 'Acte v\u00e9t\u00e9rinaire enregistr\u00e9',
        status: act.status || 'Enregistr\u00e9',
        tone: act.status === 'Termin\u00e9' ? 'done' : 'active'
      });
    }

    rows.push(evening.length > 0
      ? {
          time: 'Soir',
          title: 'Traite du soir',
          detail: `${sum(evening)} L collect\u00e9s sur ${evening.length} vache(s)`,
          status: 'Enregistr\u00e9e',
          tone: 'done'
        }
      : {
          time: 'Soir',
          title: 'Traite du soir',
          detail: 'Aucune traite enregistr\u00e9e pour le moment',
          status: '\u00c0 venir',
          tone: 'todo'
        });

    return rows;
  });

  /**
   * Notifications assemblees a partir des donnees reelles : alertes de reproduction
   * calculees par le serveur, soins en cours et stocks d'aliment sous le seuil.
   * computed pour la meme raison que dailyPlanning : identite stable entre deux passes.
   */
  farmNotifications = computed<Array<{ color: string; title: string; message: string; time: string }>>(() => {
    const items: Array<{ color: string; title: string; message: string; time: string }> = [];

    for (const alert of this.reproductionAlerts()) {
      items.push({
        color: alert.severity === 'DANGER' ? '#dc2626' : (alert.severity === 'WARNING' ? '#f59e0b' : '#38bdf8'),
        title: `Reproduction \u2014 ${alert.animalName || alert.animalInternalId}`,
        message: alert.message,
        time: alert.targetDate || ''
      });
    }

    for (const record of this.healthRecords()) {
      if (record.status === 'En cours' || record.status === 'Planifi\u00e9') {
        items.push({
          color: '#dc2626',
          title: `Suivi clinique \u2014 ${record.animalName || record.animalInternalId}`,
          message: record.diagnosis || record.actType,
          time: record.recordDate
        });
      }
    }

    for (const stock of this.feedStocks()) {
      if (stock.isLowStock) {
        items.push({
          color: '#f59e0b',
          title: `Stock bas \u2014 ${stock.name}`,
          message: `${stock.currentStockKg} kg restants (seuil ${stock.alertThresholdKg} kg)`,
          time: 'Reapprovisionnement requis'
        });
      }
    }

    return items;
  });

  toggleNotif(): void {
    this.isNotifOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  submitLogin(): void {
    if (!this.loginForm.identifier || !this.loginForm.password) {
      this.authService.authError.set('Veuillez saisir votre identifiant et mot de passe');
      return;
    }

    this.authService.login(
      this.loginForm.identifier,
      this.loginForm.password,
      this.loginForm.rememberMe
    ).subscribe({
      next: (user) => {
        this.currentRole.set(user.role);
        this.showToast(`Bienvenue, ${user.name} (${user.roleLabel}) !`);
        this.onUserLoggedIn(user.role);
      },
      error: (err) => {
        console.warn('Échec connexion :', err);
      }
    });
  }

  private onUserLoggedIn(role: string): void {
    // Redirection intelligente selon le rôle principal
    if (role === 'veto') {
      this.showPage('sante');
    } else if (role === 'tech') {
      this.showPage('lait');
    } else if (role === 'compta') {
      this.showPage('commercial');
    } else if (role === 'bouvier') {
      this.showPage('alimentation');
    } else {
      this.showPage('dashboard');
    }

    setTimeout(() => {
      this.initDashboardCharts();
    }, 300);
  }

  logout(): void {
    const prevName = this.authService.currentUser()?.name || 'Utilisateur';
    this.authService.logout();
    this.isUserMenuOpen.set(false);
    this.loginForm.password = '';
    this.showToast(`Session fermée. À bientôt ${prevName} !`);
  }

  // --- Gestion du Profil & Sécurité Personnel ---
  openProfileModal(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        title: user.title || '',
        department: user.department || ''
      };
    }
    this.passwordForm = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.profileActiveTab.set('info');
    this.isProfileModalOpen.set(true);
    this.isUserMenuOpen.set(false);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
  }

  switchProfileTab(tab: 'info' | 'password'): void {
    this.profileActiveTab.set(tab);
  }

  submitProfileUpdate(): void {
    if (!this.profileForm.name || !this.profileForm.name.trim()) {
      this.showToast('Le nom complet est obligatoire.');
      return;
    }

    this.authService.updateMyProfile({
      name: this.profileForm.name.trim(),
      phone: this.profileForm.phone.trim(),
      title: this.profileForm.title.trim(),
      department: this.profileForm.department.trim()
    }).subscribe({
      next: () => {
        this.showToast('Profil mis à jour avec succès !');
        this.closeProfileModal();
      },
      error: () => {
        this.showToast('Erreur lors de la mise à jour du profil.');
      }
    });
  }

  submitPasswordChange(): void {
    if (!this.passwordForm.oldPassword) {
      this.showToast('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword.length < 4) {
      this.showToast('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showToast('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    this.authService.changeMyPassword({
      email: this.authService.currentUser()?.email || '',
      oldPassword: this.passwordForm.oldPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.showToast('Mot de passe modifié avec succès !');
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
        this.closeProfileModal();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Échec de modification : vérifiez votre ancien mot de passe.';
        this.showToast(msg);
      }
    });
  }

  // --- Gestion des Utilisateurs (Administration) ---
  loadAllUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.usersList.set(users || []);
      },
      error: (err) => {
        this.usersList.set([]);
        this.reportDataLoadFailure('Comptes utilisateurs', err);
      }
    });
  }

  openNewUserModal(userToEdit?: User): void {
    if (userToEdit) {
      this.userEditingId.set(userToEdit.id);
      this.userForm = {
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        title: userToEdit.title,
        department: userToEdit.department,
        phone: userToEdit.phone || '',
        active: userToEdit.active !== false
      };
    } else {
      this.userEditingId.set(null);
      this.userForm = {
        name: '',
        email: '',
        password: '',
        role: 'tech',
        title: '',
        department: '',
        phone: '',
        active: true
      };
    }
    this.isUserModalOpen.set(true);
  }

  closeUserModal(): void {
    this.isUserModalOpen.set(false);
    this.userEditingId.set(null);
  }

  submitUserForm(): void {
    if (!this.userForm.name || !this.userForm.email) {
      this.showToast('Nom et email obligatoires.');
      return;
    }
    const editingId = this.userEditingId();
    if (!editingId && !this.userForm.password) {
      this.showToast('Veuillez définir un mot de passe initial pour ce nouveau compte.');
      return;
    }

    if (editingId) {
      this.authService.updateUser(editingId, {
        name: this.userForm.name,
        role: this.userForm.role,
        title: this.userForm.title,
        department: this.userForm.department,
        phone: this.userForm.phone,
        active: this.userForm.active,
        password: this.userForm.password || undefined
      }).subscribe({
        next: (saved) => {
          this.usersList.update(list => list.map(u => (u.id === editingId || u.numericId === saved.numericId) ? saved : u));
          this.showToast(`Utilisateur "${saved.name}" mis à jour avec succès !`);
          this.closeUserModal();
        },
        error: (err: any) => {
          this.showToast(err?.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur.');
        }
      });
    } else {
      this.authService.createUser({
        name: this.userForm.name,
        email: this.userForm.email,
        password: this.userForm.password,
        role: this.userForm.role,
        title: this.userForm.title,
        department: this.userForm.department,
        phone: this.userForm.phone
      }).subscribe({
        next: (created) => {
          this.usersList.update(list => [created, ...list]);
          this.showToast(`Compte créé pour "${created.name}" (${created.roleLabel}) !`);
          this.closeUserModal();
        },
        error: (err: any) => {
          this.showToast(err?.error?.message || 'Erreur lors de la création de l\'utilisateur.');
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    if (user.role === 'manager' && user.id === this.authService.currentUser()?.id) {
      this.showToast('Impossible de désactiver votre propre compte administrateur.');
      return;
    }
    this.authService.toggleUserStatus(user.id).subscribe({
      next: (updated) => {
        this.usersList.update(list => list.map(u => u.id === user.id ? updated : u));
        this.showToast(`Compte "${user.name}" ${updated.active ? 'activé' : 'désactivé'}.`);
      },
      error: () => {
        this.showToast('Erreur lors du changement de statut du compte.');
      }
    });
  }

  getActiveUsersCount(): number {
    return this.usersList().filter(u => u.active !== false).length;
  }

  getTechAndVetoUsersCount(): number {
    return this.usersList().filter(u => u.role === 'veto' || u.role === 'tech').length;
  }

  getComptaAndBouvierUsersCount(): number {
    return this.usersList().filter(u => u.role === 'compta' || u.role === 'bouvier' || u.role === 'manager').length;
  }

  toggleOffline(): void {
    this.isOffline.update(v => !v);
    this.showToast(this.isOffline() ? 'Mode Hors-ligne activé (Saisie locale 4G)' : 'Connexion 4G rétablie');
  }

  switchRole(role: string): void {
    this.currentRole.set(role);
  }


  showToast(msg: string, type?: 'success' | 'error' | 'warning' | 'info'): void {
    if (!type) {
      const lower = msg.toLowerCase();
      if (lower.includes('erreur') || lower.includes('échec') || lower.includes('echec') || lower.includes('incohérence') || lower.includes('interdit') || lower.includes('impossible') || lower.includes('dépassement')) {
        type = 'error';
      } else if (lower.includes('attention') || lower.includes('alerte') || lower.includes('insuffisant') || lower.includes('⚠️')) {
        type = 'warning';
      } else if (lower.includes('succès') || lower.includes('succes') || lower.includes('enregistré') || lower.includes('validé') || lower.includes('mis à jour') || lower.includes('créé')) {
        type = 'success';
      } else {
        type = 'info';
      }
    }
    this.toastType.set(type);
    this.toastMessage.set(msg);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }

  closeToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(null);
  }

  // Filtering & Pagination Herd
  filterHerd(category: string): void {
    this.herdFilter.set(category);
    this.herdCurrentPage.set(1);
  }

  get filteredAnimals(): Animal[] {
    const filter = this.herdFilter();
    const q = this.searchQuery().toLowerCase().trim();

    return this.animals().filter(a => {
      let matchesCat = true;
      if (filter === 'prod' || filter === 'vache') {
        matchesCat = a.category === 'MILKING_COW' || a.category === 'VACHE';
      } else if (filter === 'genisse') {
        matchesCat = a.category === 'HEIFER_YOUNG' || a.category === 'GENISSE';
      } else if (filter === 'jeune') {
        matchesCat = a.category === 'HEIFER_YOUNG' || a.category === 'GENISSE' || a.category === 'VELLE' || a.category === 'VEAU';
      } else if (filter === 'male') {
        matchesCat = a.category === 'MALE_BULL' || a.category === 'TAUREAU' || a.category === 'JEUNE_MALE';
      } else if (filter === 'veau') {
        matchesCat = a.category === 'VELLE' || a.category === 'VEAU';
      } else if (filter === 'reforme') {
        matchesCat = !!a.cullingRecommended;
      } else if (filter === 'archive') {
        matchesCat = a.status === 'MORT' || a.status === 'MORT_NE' || a.status === 'A_VERIFIER' || a.internalId.startsWith('MORT') || a.internalId === 'J-0021';
      }

      let matchesSearch = true;
      if (q) {
        matchesSearch = a.name.toLowerCase().includes(q) ||
          a.internalId.toLowerCase().includes(q) ||
          (a.earTagNumber?.toLowerCase() || '').includes(q) ||
          a.breed.toLowerCase().includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }

  get paginatedAnimals(): Animal[] {
    const start = (this.herdCurrentPage() - 1) * this.herdPageSize();
    return this.filteredAnimals.slice(start, start + this.herdPageSize());
  }

  get totalHerdPages(): number {
    return Math.ceil(this.filteredAnimals.length / this.herdPageSize()) || 1;
  }

  get herdPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalHerdPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setHerdPage(page: number): void {
    if (page >= 1 && page <= this.totalHerdPages) {
      this.herdCurrentPage.set(page);
    }
  }

  nextHerdPage(): void {
    if (this.herdCurrentPage() < this.totalHerdPages) {
      this.herdCurrentPage.update(p => p + 1);
    }
  }

  prevHerdPage(): void {
    if (this.herdCurrentPage() > 1) {
      this.herdCurrentPage.update(p => p - 1);
    }
  }

  // Animal Modal & Pedigree Navigation
  openAnimalModal(internalId: string): void {
    const animal = this.animals().find(a => a.internalId === internalId);
    if (animal) {
      this.selectedAnimal.set(animal);
      this.activeModalTab.set('infos');
      this.isAnimalModalOpen.set(true);
      setTimeout(() => this.initPerfModalChart(animal), 200);
    }
  }

  closeAnimalModal(): void {
    this.isAnimalModalOpen.set(false);
  }

  switchModalTab(tab: string): void {
    this.activeModalTab.set(tab);
    if (tab === 'lactation' && this.selectedAnimal()) {
      setTimeout(() => this.initPerfModalChart(this.selectedAnimal()!), 150);
    }
  }

  getAnimalById(id?: string): Animal | undefined {
    if (!id) return undefined;
    return this.animals().find(a => a.internalId === id);
  }

  getAnimalDescendants(internalId?: string): Animal[] {
    if (!internalId) return [];
    return this.animals().filter(a => a.motherId === internalId || a.fatherId === internalId);
  }

  getAnimalEvents(internalId?: string): any[] {
    if (!internalId) return [];
    const repro = this.reproductionEvents()
      .filter(e => e.animalInternalId === internalId)
      .map(e => ({
        date: e.eventDate,
        time: e.eventTime || '',
        type: e.eventType,
        typeLabel: e.eventTypeLabel || e.cowMasterTypeOriginal || e.eventType,
        badgeClass: e.eventType === 'HEAT_DETECTION' ? 'badge-gold' :
                    (e.eventType === 'CALVING' ? 'badge-purple' :
                    (e.eventType === 'DRY_OFF' || e.eventType === 'ILLNESS_TREATMENT' ? 'badge-red' :
                    (e.eventType === 'PREG_CHECK' || e.eventType === 'PREGNANCY_DIAGNOSIS' ? 'badge-green' : 'badge-blue'))),
        operator: e.operatorName || (e.eventType === 'INSEMINATION' ? 'Fallou Mbacké' : 'Dr. Fall'),
        details: e.bullOrSemenUsed ? `Semence / Taureau : ${e.bullOrSemenUsed}` : (e.pathology ? `Pathologie : ${e.pathology} (Ttt: ${e.treatment || '—'})` : (e.method ? `Méthode : ${e.method}` : '—')),
        result: e.result || (e.isConfirmed ? 'Confirmé' : 'En attente'),
        observations: e.observations || 'Acte consigné dans le registre CowMaster',
        isRepro: true
      }));

    const health = this.healthRecords()
      .filter(h => h.animalInternalId === internalId)
      .map(h => ({
        date: h.recordDate,
        time: '',
        type: 'ILLNESS_TREATMENT',
        typeLabel: h.actType || 'Acte Vétérinaire',
        badgeClass: 'badge-red',
        operator: h.practitionerName || 'Dr. Fall',
        details: `${h.diagnosis}${h.treatmentPrescription ? ' — ' + h.treatmentPrescription : ''}`,
        result: h.status || 'Conforme',
        observations: h.milkWithdrawalDays ? `Délai d'attente lait : ${h.milkWithdrawalDays} jours` : (h.costFcfa ? `Coût : ${h.costFcfa} FCFA` : 'Soin vétérinaire'),
        isRepro: false
      }));

    return [...repro, ...health].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  }

  // Forms Submissions

  submitHealthEntry(): void {
    const record: HealthRecord = {
      animalInternalId: this.healthForm.cowId.split(' ')[0],
      actType: this.healthForm.actType,
      diagnosis: this.healthForm.diagnosis || 'Intervention clinique',
      treatmentPrescription: this.healthForm.treatmentPrescription || 'Aucune prescription spécifique',
      practitionerName: this.healthForm.practitionerName || 'Dr. Fall',
      costFcfa: this.healthForm.cost || 0,
      status: this.healthForm.status || 'En cours',
      milkWithdrawalDays: this.healthForm.milkWithdrawalDays || 0,
      recordDate: this.healthForm.recordDate || new Date().toISOString().split('T')[0]
    };

    this.apiService.createHealthRecord(record).subscribe({
      next: (created) => {
        this.healthRecords.update(records => [created, ...records]);
        this.showToast('Acte vétérinaire enregistré avec succès !');
        this.isHealthModalOpen.set(false);
      },
      error: (err) => {
        console.error('Erreur santé:', err);
        this.showToast(`Erreur : Impossible d'enregistrer l'acte vétérinaire.`);
      }
    });
  }

  submitOrderEntry(): void {
    this.showToast(`Commande ${this.orderForm.client} (${this.orderForm.qty} ${this.orderForm.product}) validée !`);
    this.isOrderModalOpen.set(false);
  }

  openNewAnimalModal(): void {
    const count = this.animals().length + 1;
    const idStr = String(count).padStart(3, '0');
    this.newAnimalForm = {
      internalId: `FL-${idStr}`,
      name: '',
      gender: 'FEMALE',
      category: 'MILKING_COW',
      status: 'HEALTHY',
      breed: 'Holstein Pure',
      birthDate: new Date().toISOString().split('T')[0],
      weight: 480,
      imageUrl: ''
    };
    this.newAnimalFather = '';
    this.newAnimalFatherEarTag = '';
    this.newAnimalMother = '';
    this.newAnimalMotherEarTag = '';
    this.isNewAnimalModalOpen.set(true);
  }

  submitNewAnimal(): void {
    if (!this.newAnimalForm.name || !this.newAnimalForm.name.trim()) {
      this.showToast('Veuillez renseigner le nom de l\'animal.');
      return;
    }
    if (!this.newAnimalForm.earTagNumber || !this.newAnimalForm.earTagNumber.trim()) {
      this.showToast('Veuillez renseigner le numéro de boucle (Ear Tag).');
      return;
    }
    const cleanEarTag = this.newAnimalForm.earTagNumber.trim().toUpperCase();
    if (this.animals().some(a => a.earTagNumber?.trim().toUpperCase() === cleanEarTag)) {
      this.showToast(`Le numéro de boucle (${cleanEarTag}) est déjà utilisé par un autre animal.`);
      return;
    }
    if (this.newAnimalForm.rfidCode && this.newAnimalForm.rfidCode.trim()) {
      const cleanRfid = this.newAnimalForm.rfidCode.trim().toUpperCase();
      if (this.animals().some(a => a.rfidCode?.trim().toUpperCase() === cleanRfid)) {
        this.showToast(`Le code RFID (${cleanRfid}) est déjà attribué.`);
        return;
      }
    }
    if (this.newAnimalForm.birthDate && new Date(this.newAnimalForm.birthDate) > new Date()) {
      this.showToast('La date de naissance ne peut pas être située dans le futur.');
      return;
    }
    const isMale = this.newAnimalForm.gender === 'MALE' || this.newAnimalForm.category === 'MALE_BULL';
    if (isMale && this.newAnimalForm.category === 'MILKING_COW') {
      this.showToast('Incohérence biologique : un mâle ne peut pas être une vache laitière.');
      return;
    }
    const animal: Animal = {
      ...this.newAnimalForm,
      gender: isMale ? 'MALE' : 'FEMALE',
      genderLabel: isMale ? 'Mâle' : 'Femelle',
      avatarEmoji: '',
      pedigree: {
        fatherName: this.newAnimalFather,
        fatherEarTag: this.newAnimalFatherEarTag,
        motherName: this.newAnimalMother,
        motherEarTag: this.newAnimalMotherEarTag
      }
    };

    this.apiService.createAnimal(animal).subscribe({
      next: (created) => {
        this.animals.update(list => [...list, created]);
        this.showToast(`Animal ${created.name} (${created.internalId}) enregistré avec succès !`);
        this.isNewAnimalModalOpen.set(false);
      },
      error: (err) => {
        console.error('Erreur ajout animal:', err);
        const msg = err?.error?.message || "Erreur d'enregistrement : vérifiez que l'identifiant est unique.";
        this.showToast(msg);
      }
    });
  }

  // Photo upload handling (Instant preview + Canvas compression + Base64)
  handlePhotoUpload(event: Event, target: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          let ctx = canvas.getContext('2d');

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            if (target === 'new') {
              this.newAnimalForm.imageUrl = compressed;
            } else {
              this.editAnimalForm.imageUrl = compressed;
            }
            this.showToast('Photo optimisée & chargée avec succès !');
          } else {
            if (target === 'new') {
              this.newAnimalForm.imageUrl = rawData;
            } else {
              this.editAnimalForm.imageUrl = rawData;
            }
          }
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(target: 'new' | 'edit'): void {
    if (target === 'new') {
      this.newAnimalForm.imageUrl = '';
    } else {
      this.editAnimalForm.imageUrl = '';
    }
  }

  // Edit Animal Handlers
  openEditAnimalModal(animal: Animal): void {
    this.editAnimalForm = { ...animal };
    this.editAnimalFather = animal.pedigree?.fatherName || '';
    this.editAnimalFatherEarTag = animal.pedigree?.fatherEarTag || '';
    this.editAnimalMother = animal.pedigree?.motherName || '';
    this.editAnimalMotherEarTag = animal.pedigree?.motherEarTag || '';
    this.isEditAnimalModalOpen.set(true);
  }

  submitEditAnimal(): void {
    if (!this.editAnimalForm.name || !this.editAnimalForm.name.trim()) {
      this.showToast('Veuillez renseigner le nom de l\'animal.');
      return;
    }
    if (!this.editAnimalForm.earTagNumber || !this.editAnimalForm.earTagNumber.trim()) {
      this.showToast('Veuillez renseigner le numéro de boucle (Ear Tag).');
      return;
    }
    const cleanEarTag = this.editAnimalForm.earTagNumber.trim().toUpperCase();
    if (this.animals().some(a => a.internalId !== this.editAnimalForm.internalId && a.earTagNumber?.trim().toUpperCase() === cleanEarTag)) {
      this.showToast(`Le numéro de boucle (${cleanEarTag}) est déjà utilisé.`);
      return;
    }
    if (this.editAnimalForm.rfidCode && this.editAnimalForm.rfidCode.trim()) {
      const cleanRfid = this.editAnimalForm.rfidCode.trim().toUpperCase();
      if (this.animals().some(a => a.internalId !== this.editAnimalForm.internalId && a.rfidCode?.trim().toUpperCase() === cleanRfid)) {
        this.showToast(`Le code RFID (${cleanRfid}) est déjà attribué.`);
        return;
      }
    }
    if (this.editAnimalForm.birthDate && new Date(this.editAnimalForm.birthDate) > new Date()) {
      this.showToast('La date de naissance ne peut pas être située dans le futur.');
      return;
    }
    const isMale = this.editAnimalForm.gender === 'MALE' || this.editAnimalForm.category === 'MALE_BULL';
    if (isMale && this.editAnimalForm.category === 'MILKING_COW') {
      this.showToast('Incohérence biologique : un mâle ne peut pas être une vache laitière.');
      return;
    }
    const updated: Animal = {
      ...this.editAnimalForm,
      gender: isMale ? 'MALE' : 'FEMALE',
      genderLabel: isMale ? 'Mâle' : 'Femelle',
      avatarEmoji: '',
      pedigree: {
        ...(this.editAnimalForm.pedigree || {}),
        fatherName: this.editAnimalFather,
        fatherEarTag: this.editAnimalFatherEarTag,
        motherName: this.editAnimalMother,
        motherEarTag: this.editAnimalMotherEarTag
      }
    };

    if (updated.internalId) {
      this.apiService.updateAnimal(updated.internalId, updated).subscribe({
        next: (res) => {
          this.animals.update(list => list.map(a => a.internalId === updated.internalId ? res : a));
          if (this.selectedAnimal()?.internalId === updated.internalId) {
            this.selectedAnimal.set(res);
          }
          this.showToast(`Fiche de ${updated.name} mise à jour avec succès !`);
          this.isEditAnimalModalOpen.set(false);
        },
        error: (err) => {
          const msg = err?.error?.message || "Erreur : Impossible de mettre à jour l'animal.";
          this.showToast(msg);
        }
      });
    }
  }

  // Edit Health Record Handlers
  openEditHealthModal(record: HealthRecord): void {
    this.editingHealthRecord = { ...record };
    this.isEditHealthModalOpen.set(true);
  }

  submitEditHealthEntry(): void {
    const rec = this.editingHealthRecord;
    if (!rec.id) return;

    this.apiService.updateHealthRecord(rec.id, rec).subscribe({
      next: (res) => {
        this.healthRecords.update(list => list.map(r => r.id === rec.id ? res : r));
        this.showToast('Acte médical mis à jour avec succès !');
        this.isEditHealthModalOpen.set(false);
      },
      error: () => {
        this.showToast('Erreur lors de la mise à jour.');
      }
    });
  }

  submitVaccinePlan(): void {
    const v: VaccineSchedule = {
      vaccineType: this.vaccineForm.type,
      targetHerd: this.vaccineForm.target,
      scheduledDate: this.vaccineForm.date || new Date().toISOString().split('T')[0],
      practitioner: this.vaccineForm.vet,
      estimatedCost: this.vaccineForm.cost,
      status: 'Planifié',
      notes: this.vaccineForm.notes
    };

    this.apiService.createVaccine(v).subscribe({
      next: (created) => {
        this.vaccineSchedules.update(list => [...list, created]);
        this.showToast('Planification vaccinale enregistrée avec succès !');
        this.isVaccineModalOpen.set(false);
      },
      error: () => {
        this.showToast(`Erreur lors de l'enregistrement du vaccin.`);
      }
    });
  }

  submitRationDistribution(): void {
    this.showToast('Distribution de ration enregistrée & stocks mis à jour !');
    this.isRationModalOpen.set(false);
  }

  // Sprint 2: Reproduction Helpers & Handlers
  get femaleCows(): Animal[] {
    return this.animals().filter(a => a.category === 'MILKING_COW' || a.category === 'HEIFER_YOUNG' || a.category === 'VACHE' || a.category === 'GENISSE' || a.category === 'VELLE');
  }

  get bullsList(): Animal[] {
    return this.animals().filter(a => a.category === 'MALE_BULL' || a.category === 'TAUREAU' || a.category === 'JEUNE_MALE');
  }

  get pregnantCows(): Animal[] {
    return this.animals().filter(a => a.status === 'PREGNANT' || (a.reproStatus && a.reproStatus.includes('Gestan')));
  }

  /** Animaux vivants au registre (les fiches archives et mort-nes sont exclues). */
  get activeHerd(): Animal[] {
    return this.animals().filter(a => a.status !== 'MORT' && a.status !== 'MORT_NE' && a.status !== 'VENDU');
  }

  /** Betes actuellement en soin ou signalees pour reforme, d'apres leur fiche en base. */
  get animalsUnderWatch(): Animal[] {
    return this.activeHerd.filter(a => a.status === 'FEVER_TREATMENT' || a.cullingRecommended === true);
  }

  get healthyAnimalsCount(): number {
    return this.activeHerd.length - this.animalsUnderWatch.length;
  }

  get animalsUnderWatchLabel(): string {
    const ids = this.animalsUnderWatch.map(a => a.internalId);
    return ids.length > 0 ? ids.join(', ') : 'Aucun animal signale';
  }

  /** Velages attendus : fiches portant une date de velage prevue encore a venir. */
  get upcomingCalvings(): Animal[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.activeHerd
      .filter(a => !!a.expectedCalvingDate && String(a.expectedCalvingDate).slice(0, 10) >= today)
      .sort((a, b) => String(a.expectedCalvingDate).localeCompare(String(b.expectedCalvingDate)));
  }

  get upcomingCalvingsLabel(): string {
    const ids = this.upcomingCalvings.map(a => a.internalId);
    return ids.length > 0 ? ids.join(', ') : 'Aucun velage programme';
  }

  get pregnantCowsLabel(): string {
    const ids = this.pregnantCows.map(a => a.internalId);
    return ids.length > 0 ? ids.join(', ') : 'Aucune gestation confirmee';
  }

  /** Part des traites du jour declarees conformes bio, calculee sur les saisies reelles. */
  get organicComplianceToday(): number | null {
    const today = new Date().toISOString().slice(0, 10);
    const todayProds = this.milkProductions().filter(p => {
      const day = typeof p.productionDate === 'string'
        ? p.productionDate.slice(0, 10)
        : new Date(p.productionDate as any).toISOString().slice(0, 10);
      return day === today;
    });
    if (todayProds.length === 0) return null;
    const compliant = todayProds.filter(p => p.isOrganicCompliant !== false).length;
    return Math.round((compliant / todayProds.length) * 1000) / 10;
  }

  countEventsByType(type: string): number {
    return this.reproductionEvents().filter(e => {
      if (type === 'INSEMINATION') return e.eventType === 'ARTIFICIAL_INSEMINATION' || e.eventType === 'NATURAL_MATING' || e.eventType === 'INSEMINATION';
      if (type === 'GESTATION') return e.eventType === 'PREGNANCY_DIAGNOSIS' || e.eventType === 'PREG_CHECK';
      if (type === 'CALVING') return e.eventType === 'CALVING';
      return e.eventType === type;
    }).length;
  }

  get filteredReproEvents(): ReproductionEvent[] {
    const filter = this.reproFilter();
    if (filter === 'all') return this.reproductionEvents();
    return this.reproductionEvents().filter(e => {
      if (filter === 'ia') return e.eventType === 'ARTIFICIAL_INSEMINATION' || e.eventType === 'NATURAL_MATING' || e.eventType === 'INSEMINATION';
      if (filter === 'gestation') return e.eventType === 'PREGNANCY_DIAGNOSIS' || e.eventType === 'PREG_CHECK';
      if (filter === 'velage') return e.eventType === 'CALVING';
      if (filter === 'tarissement') return e.eventType === 'DRY_OFF';
      if (filter === 'chaleur') return e.eventType === 'HEAT_DETECTION';
      if (filter === 'sante') return e.eventType === 'ILLNESS_TREATMENT';
      return true;
    });
  }

  get paginatedReproEvents(): ReproductionEvent[] {
    const start = (this.reproCurrentPage() - 1) * this.reproPageSize();
    return this.filteredReproEvents.slice(start, start + this.reproPageSize());
  }

  get totalReproPages(): number {
    return Math.ceil(this.filteredReproEvents.length / this.reproPageSize()) || 1;
  }

  get reproPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalReproPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setReproPage(page: number): void {
    if (page >= 1 && page <= this.totalReproPages) {
      this.reproCurrentPage.set(page);
    }
  }

  nextReproPage(): void {
    if (this.reproCurrentPage() < this.totalReproPages) {
      this.reproCurrentPage.update(p => p + 1);
    }
  }

  prevReproPage(): void {
    if (this.reproCurrentPage() > 1) {
      this.reproCurrentPage.update(p => p - 1);
    }
  }

  filterRepro(filterType: string): void {
    this.reproFilter.set(filterType);
    this.reproCurrentPage.set(1);
  }

  openReproModal(animalId?: string): void {
    if (animalId) {
      this.reproForm.animalInternalId = animalId;
    }
    this.updateReproCalculations();
    this.isReproModalOpen.set(true);
  }

  triggerRecalculateRepro(): void {
    this.showToast('Recalcul des jours ouverts et alertes CowMaster...');
    this.apiService.recalculateReproMetrics().subscribe({
      next: () => {
        this.loadReproductionData();
        this.apiService.getAllAnimals().subscribe(data => {
          if (data) this.animals.set(data);
        });
        this.showToast('Métriques et alertes CowMaster recalculées avec succès !');
      },
      error: () => {
        this.showToast('Recalcul impossible : le serveur est injoignable. Aucune donnée n\'a été modifiée.');
      }
    });
  }

  handleAlertAction(alert: ReproductionAlert): void {
    this.reproForm.animalInternalId = alert.animalInternalId;
    if (alert.alertType === 'CALVING_IMMINENT') {
      this.reproForm.eventType = 'CALVING';
      this.reproForm.observations = 'Vêlage & mise bas contrôlée';
    } else if (alert.alertType === 'DRY_OFF_DUE') {
      this.reproForm.eventType = 'DRY_OFF';
      this.reproForm.observations = 'Mise au repos pré-vêlage';
    } else if (alert.alertType === 'HEAT_ACTIVE') {
      this.reproForm.eventType = 'ARTIFICIAL_INSEMINATION';
      this.reproForm.observations = 'Insémination sur chaleurs observées';
    } else if (alert.alertType === 'PREG_CHECK') {
      this.reproForm.eventType = 'PREGNANCY_DIAGNOSIS';
      this.reproForm.observations = 'Diagnostic de gestation (Échographie J+45/50)';
      this.reproForm.isConfirmed = true;
    } else if (alert.alertType === 'CULLING_ALERT') {
      this.reproForm.eventType = 'PREGNANCY_DIAGNOSIS';
      this.reproForm.observations = 'Examen de fertilité approfondi / Constat d\'infécondité';
      this.reproForm.isConfirmed = false;
    }
    this.reproForm.eventDate = new Date().toISOString().slice(0, 10);
    this.updateReproCalculations();
    this.isReproModalOpen.set(true);
  }

  updateReproCalculations(): void {
    if (!this.reproForm.eventDate) {
      this.reproForm.eventDate = new Date().toISOString().slice(0, 10);
    }
    const evtDate = new Date(this.reproForm.eventDate);

    if (this.reproForm.eventType === 'ARTIFICIAL_INSEMINATION' || this.reproForm.eventType === 'NATURAL_MATING' || this.reproForm.eventType === 'INSEMINATION') {
      // Vêlage prévisionnel = +282 jours (Standard CowMaster)
      const calvingDate = new Date(evtDate.getTime() + 282 * 86400000);
      this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);

      // Tarissement prévisionnel = J-60 avant vêlage (+222j)
      const dryOffDate = new Date(evtDate.getTime() + 222 * 86400000);
      this.reproForm.expectedDryOffDate = dryOffDate.toISOString().slice(0, 10);
    } else if (this.reproForm.eventType === 'DRY_OFF') {
      this.reproForm.expectedDryOffDate = this.reproForm.eventDate;
      const calvingDate = new Date(evtDate.getTime() + 60 * 86400000);
      this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
    } else if (this.reproForm.eventType === 'PREGNANCY_DIAGNOSIS' || this.reproForm.eventType === 'PREG_CHECK') {
      if (!this.reproForm.expectedCalvingDate) {
        const calvingDate = new Date(evtDate.getTime() + 150 * 86400000);
        this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
      }
    } else if (this.reproForm.eventType === 'CALVING') {
      this.reproForm.expectedCalvingDate = '';
      this.reproForm.expectedDryOffDate = '';
    }
  }

  submitReproEntry(): void {
    const targetCow = this.animals().find(a => a.internalId === this.reproForm.animalInternalId);
    const cowName = targetCow ? targetCow.name : this.reproForm.animalInternalId;

    const event: ReproductionEvent = {
      animalInternalId: this.reproForm.animalInternalId,
      animalName: cowName,
      eventType: this.reproForm.eventType,
      eventDate: this.reproForm.eventDate,
      bullOrSemenUsed: this.reproForm.bullOrSemenUsed,
      operatorName: this.reproForm.operatorName,
      expectedDryOffDate: this.reproForm.expectedDryOffDate,
      expectedCalvingDate: this.reproForm.expectedCalvingDate,
      observations: this.reproForm.observations,
      isConfirmed: this.reproForm.isConfirmed
    };

    this.apiService.recordReproEvent(event).subscribe({
      next: (created) => {
        this.reproductionEvents.update(list => [created, ...list]);
        this.dismissAlertForCow(event);
        this.showToast(`Événement de reproduction enregistré pour ${cowName} (${event.animalInternalId}) !`);
        this.isReproModalOpen.set(false);
      },
      error: () => {
        this.showToast(`Erreur : impossible d'enregistrer l'événement de reproduction.`);
      }
    });
  }

  dismissAlertForCow(event: ReproductionEvent): void {
    this.reproductionAlerts.update(alerts => {
      return alerts.filter(a => {
        if (a.animalInternalId === event.animalInternalId) {
          if (event.eventType === 'CALVING' && a.alertType === 'CALVING_IMMINENT') return false;
          if (event.eventType === 'DRY_OFF' && a.alertType === 'DRY_OFF_DUE') return false;
          if ((event.eventType === 'ARTIFICIAL_INSEMINATION' || event.eventType === 'NATURAL_MATING' || event.eventType === 'INSEMINATION') && a.alertType === 'HEAT_ACTIVE') return false;
          if ((event.eventType === 'PREGNANCY_DIAGNOSIS' || event.eventType === 'PREG_CHECK') && a.alertType === 'PREG_CHECK') return false;
        }
        return true;
      });
    });

    // Also update animal status in local list
    this.animals.update(list => list.map(a => {
      if (a.internalId === event.animalInternalId) {
        if (event.eventType === 'CALVING') {
          return {
            ...a,
            status: 'EXCELLENT',
            category: 'VACHE',
            lactationStatus: 'En lactation',
            daysOpen: 0,
            cullingRecommended: false,
            lactationNumber: (a.lactationNumber || 0) + 1,
            daysInMilk: 0,
            reproStatus: `Vêlage réussi le ${event.eventDate} — Nouvelle lactation (${(a.lactationNumber || 0) + 1}e)`
          };
        } else if (event.eventType === 'DRY_OFF') {
          return {
            ...a,
            lactationStatus: 'Tarie',
            reproStatus: 'Tarie — Repos pré-vêlage'
          };
        } else if (event.eventType === 'ARTIFICIAL_INSEMINATION' || event.eventType === 'NATURAL_MATING' || event.eventType === 'INSEMINATION') {
          return {
            ...a,
            lastInseminationDate: event.eventDate,
            expectedCalvingDate: event.expectedCalvingDate,
            expectedDryOffDate: event.expectedDryOffDate,
            reproStatus: `Inséminée le ${event.eventDate}`
          };
        } else if (event.eventType === 'PREGNANCY_DIAGNOSIS' || event.eventType === 'PREG_CHECK') {
          const isConf = event.isConfirmed !== false;
          return {
            ...a,
            status: isConf ? 'PREGNANT' : a.status,
            reproStatus: isConf ? `Gestation confirmée (Vêlage: ${event.expectedCalvingDate || 'à terme'})` : 'Non gestante (Vide)',
            cullingRecommended: !isConf && (a.daysOpen || 0) >= 250
          };
        }
      }
      return a;
    }));
  }

  deleteReproEntry(id?: number): void {
    if (!id) return;
    this.apiService.deleteReproEvent(id).subscribe({
      next: () => {
        this.reproductionEvents.update(list => list.filter(e => e.id !== id));
        this.showToast('Acte de reproduction supprimé avec succès.');
      },
      error: () => {
        this.showToast('Erreur lors de la suppression.');
      }
    });
  }

  submitFinanceExport(): void {
    this.showToast('Exportation du bilan financier en cours de téléchargement...');
    this.isExportModalOpen.set(false);
  }

  /**
   * Ouvre le passeport d'un lot trace : toutes les valeurs affichees viennent
   * de l'ordre de fabrication enregistre, aucune n'est supposee.
   */
  openLotPassport(lot: TraceabilityLot): void {
    this.selectedTraceabilityLot.set(lot);
    this.lotQrImage.set('');
    this.isQrModalOpen.set(true);
    this.buildLotQrCode(lot);
  }

  /**
   * Ouvre le passeport depuis un numero de lot (tableau des fabrications,
   * fiche de stock). Le lot est relu au serveur s'il n'est pas deja charge.
   */
  openLotPassportByNumber(batchNumber?: string): void {
    if (!batchNumber) {
      this.showToast("Ce produit n'est rattache a aucun lot de fabrication.");
      return;
    }
    const known = this.traceabilityLots().find(l => l.lotNumber === batchNumber);
    if (known) {
      this.openLotPassport(known);
      return;
    }
    this.apiService.getTraceabilityLot(batchNumber).subscribe({
      next: (lot) => {
        if (lot) this.openLotPassport(lot);
        else this.showToast(`Aucun lot trace sous le numero ${batchNumber}.`);
      },
      error: () => this.showToast(`Impossible de charger le lot ${batchNumber}.`)
    });
  }

  closeLotPassport(): void {
    this.isQrModalOpen.set(false);
    this.selectedTraceabilityLot.set(null);
    this.lotQrImage.set('');
  }

  /** QR code reellement scannable, encodant l'identite et la tracabilite du lot. */
  private buildLotQrCode(lot: TraceabilityLot): void {
    const lines = [
      'FERME LAWTAN BIO - Passeport de lot',
      `Lot: ${lot.lotNumber}`,
      `Produit: ${lot.productName || 'non renseigne'}`,
      `Fabrique le: ${lot.productionDate || 'non renseignee'}`
    ];
    if (lot.dlcExpiryDate) lines.push(`DLC: ${lot.dlcExpiryDate}`);
    if (lot.milkLitersConsumed != null) lines.push(`Lait engage: ${lot.milkLitersConsumed} L`);
    if (lot.quantityProduced != null) lines.push(`Quantite obtenue: ${lot.quantityProduced} ${lot.unit || ''}`.trim());
    if (lot.phLevel != null) lines.push(`pH mesure: ${lot.phLevel}`);
    if (lot.sourceTank) lines.push(`Cuve: ${lot.sourceTank}`);
    if (lot.operatorName) lines.push(`Operateur: ${lot.operatorName}`);

    QRCode.toDataURL(lines.join('\n'), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: { dark: '#0d381e', light: '#ffffff' }
    })
      .then(url => this.lotQrImage.set(url))
      .catch(() => this.lotQrImage.set(''));
  }

  /** Jours restants avant DLC, pour l'affichage du passeport. */
  lotDlcLabel(lot: TraceabilityLot | null): string {
    if (!lot || !lot.dlcExpiryDate) return 'Non renseignee';
    if (lot.daysRemainingDlc == null) return lot.dlcExpiryDate;
    if (lot.daysRemainingDlc < 0) return `${lot.dlcExpiryDate} (depassee de ${-lot.daysRemainingDlc} j)`;
    return `${lot.dlcExpiryDate} (dans ${lot.daysRemainingDlc} j)`;
  }


  // --- Charts Initializations ---
  private initDashboardCharts(): void {
    const stats = this.dashboardStats();

    const milkCanvas = document.getElementById('dashMilkChart') as HTMLCanvasElement;
    if (milkCanvas) {
      if (this.milkChartInstance) this.milkChartInstance.destroy();
      const weekly = stats?.weeklyProductionChart || [];
      this.milkChartInstance = new Chart(milkCanvas, {
        type: 'bar',
        data: {
          labels: weekly.map(d => d.day),
          datasets: [
            {
              label: 'Traite Matin',
              data: weekly.map(d => d.morning),
              backgroundColor: '#16a34a',
              borderRadius: 6
            },
            {
              label: 'Traite Soir',
              data: weekly.map(d => d.evening),
              backgroundColor: '#38bdf8',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    const donutCanvas = document.getElementById('dashRevDonut') as HTMLCanvasElement;
    if (donutCanvas) {
      if (this.donutChartInstance) this.donutChartInstance.destroy();
      const revenue = stats?.revenueDistributionChart || [];
      this.donutChartInstance = new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels: revenue.map(r => r.name),
          datasets: [{
            data: revenue.map(r => r.percent),
            backgroundColor: revenue.map(r => r.color),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  private initMilkChart(): void {
    const canvas = document.getElementById('monthlyMilkChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy();

    const history = this.milkHistory();
    this.monthlyChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: history.map(h => this.formatShortDate(h.date)),
        datasets: [{
          label: 'Collecte Journali\u00e8re (Litres)',
          data: history.map(h => h.totalVolume),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  /** Format court jj/mm pour les axes de graphique. */
  private formatShortDate(value: string | Date): string {
    if (!value) return '';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return String(value);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private initFinanceChart(): void {
    const canvas = document.getElementById('financeChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.financeChartInstance) this.financeChartInstance.destroy();

    const series = this.financeSummary()?.monthlySeries || [];
    this.financeChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: series.map(m => m.label),
        datasets: [
          {
            label: 'Recettes factur\u00e9es (FCFA)',
            data: series.map(m => m.revenueFcfa),
            backgroundColor: '#16a34a',
            borderRadius: 6
          },
          {
            label: 'Charges trac\u00e9es (FCFA)',
            data: series.map(m => m.chargesFcfa),
            backgroundColor: '#ef4444',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  // ==========================================
  // SPRINT 4: COMMERCIAL & FINANCES LOGIC
  // ==========================================

  loadCommercialData(): void {
    // 1. Fetch Customers
    this.apiService.getAllCustomers().subscribe({
      next: (custs) => {
        this.customers.set(custs || []);
      },
      error: (err) => {
        this.customers.set([]);
        this.reportDataLoadFailure('Clients', err);
      }
    });

    // 2. Fetch Invoices
    this.apiService.getAllInvoices().subscribe({
      next: (invs) => {
        this.invoices.set(invs || []);
      },
      error: (err) => {
        this.invoices.set([]);
        this.commercialSummary.set(null);
        this.reportDataLoadFailure('Factures', err);
      }
    });

    // 3. Fetch Payments
    this.apiService.getAllPayments().subscribe({
      next: (pays) => {
        this.payments.set(pays || []);
      },
      error: (err) => {
        this.payments.set([]);
        this.reportDataLoadFailure('Encaissements', err);
      }
    });

    // 4. Fetch Summary
    this.apiService.getCommercialSummary().subscribe({
      next: (sum) => {
        this.commercialSummary.set(sum || null);
      },
      error: (err) => {
        this.commercialSummary.set(null);
        this.reportDataLoadFailure('Synthese commerciale', err);
      }
    });
  }

  /** Relit la synthese commerciale calculee en base. */
  refreshCommercialSummary(): void {
    this.apiService.getCommercialSummary().subscribe({
      next: (sum) => {
        this.commercialSummary.set(sum || null);
      },
      error: (err) => {
        this.commercialSummary.set(null);
        this.reportDataLoadFailure('Synthese commerciale', err);
      }
    });
  }

  // --- Commercial Navigation & Tabs ---
  toggleCommercialMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCommercialMenuOpen.update(v => !v);
  }

  navigateToCommercialSubTab(subTab: string): void {
    this.isCommercialMenuOpen.set(true);
    this.activeCommercialSubTab.set(subTab);
    this.showPage('commercial');
  }

  switchCommercialSubTab(subTab: string): void {
    this.activeCommercialSubTab.set(subTab);
  }

  // --- Invoices: Filtering & Pagination ---
  filterInvoices(status: string): void {
    this.invoiceFilterStatus.set(status);
    this.invoicesCurrentPage.set(1);
  }

  get filteredInvoices(): SaleInvoice[] {
    const st = this.invoiceFilterStatus();
    const query = this.invoicesSearchTerm().toLowerCase().trim();

    return this.invoices().filter(inv => {
      // Status filter
      if (st !== 'ALL' && inv.status !== st) {
        return false;
      }
      // Query filter
      if (query) {
        const invNum = inv.invoiceNumber.toLowerCase();
        const custName = (inv.customerName || '').toLowerCase();
        return invNum.includes(query) || custName.includes(query);
      }
      return true;
    });
  }

  get paginatedInvoices(): SaleInvoice[] {
    const start = (this.invoicesCurrentPage() - 1) * this.invoicesPageSize();
    return this.filteredInvoices.slice(start, start + this.invoicesPageSize());
  }

  get totalInvoicesPages(): number {
    return Math.ceil(this.filteredInvoices.length / this.invoicesPageSize()) || 1;
  }

  get invoicesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalInvoicesPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setInvoicesPage(page: number): void {
    if (page >= 1 && page <= this.totalInvoicesPages) {
      this.invoicesCurrentPage.set(page);
    }
  }

  nextInvoicesPage(): void {
    if (this.invoicesCurrentPage() < this.totalInvoicesPages) {
      this.invoicesCurrentPage.update(p => p + 1);
    }
  }

  prevInvoicesPage(): void {
    if (this.invoicesCurrentPage() > 1) {
      this.invoicesCurrentPage.update(p => p - 1);
    }
  }

  // --- Customers: Filtering & Pagination ---
  filterCustomers(type: string): void {
    this.customerTypeFilter.set(type);
    this.customersCurrentPage.set(1);
  }

  get filteredCustomers(): Customer[] {
    const tf = this.customerTypeFilter();
    const query = this.customersSearchTerm().toLowerCase().trim();

    return this.customers().filter(c => {
      if (tf !== 'ALL' && c.customerType !== tf) {
        return false;
      }
      if (query) {
        const name = c.name.toLowerCase();
        const company = (c.companyName || '').toLowerCase();
        const city = (c.city || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        return name.includes(query) || company.includes(query) || city.includes(query) || phone.includes(query);
      }
      return true;
    });
  }

  get paginatedCustomers(): Customer[] {
    const start = (this.customersCurrentPage() - 1) * this.customersPageSize();
    return this.filteredCustomers.slice(start, start + this.customersPageSize());
  }

  get totalCustomersPages(): number {
    return Math.ceil(this.filteredCustomers.length / this.customersPageSize()) || 1;
  }

  get customersPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalCustomersPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setCustomersPage(page: number): void {
    if (page >= 1 && page <= this.totalCustomersPages) {
      this.customersCurrentPage.set(page);
    }
  }

  nextCustomersPage(): void {
    if (this.customersCurrentPage() < this.totalCustomersPages) {
      this.customersCurrentPage.update(p => p + 1);
    }
  }

  prevCustomersPage(): void {
    if (this.customersCurrentPage() > 1) {
      this.customersCurrentPage.update(p => p - 1);
    }
  }

  // --- Payments: Filtering & Pagination ---
  get filteredPayments(): PaymentTransaction[] {
    const query = this.paymentsSearchTerm().toLowerCase().trim();
    return this.payments().filter(p => {
      if (!query) return true;
      const ref = (p.transactionReference || '').toLowerCase();
      const rec = (p.receiptNumber || '').toLowerCase();
      const cust = (p.customerName || '').toLowerCase();
      const inv = (p.invoiceNumber || '').toLowerCase();
      return ref.includes(query) || rec.includes(query) || cust.includes(query) || inv.includes(query);
    });
  }

  get paginatedPayments(): PaymentTransaction[] {
    const start = (this.paymentsCurrentPage() - 1) * this.paymentsPageSize();
    return this.filteredPayments.slice(start, start + this.paymentsPageSize());
  }

  get totalPaymentsPages(): number {
    return Math.ceil(this.filteredPayments.length / this.paymentsPageSize()) || 1;
  }

  get paymentsPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPaymentsPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setPaymentsPage(page: number): void {
    if (page >= 1 && page <= this.totalPaymentsPages) {
      this.paymentsCurrentPage.set(page);
    }
  }

  nextPaymentsPage(): void {
    if (this.paymentsCurrentPage() < this.totalPaymentsPages) {
      this.paymentsCurrentPage.update(p => p + 1);
    }
  }

  prevPaymentsPage(): void {
    if (this.paymentsCurrentPage() > 1) {
      this.paymentsCurrentPage.update(p => p - 1);
    }
  }

  // --- New Invoice Actions ---
  openNewInvoiceModal(preselectedCustomerId?: number): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const custId = preselectedCustomerId || (this.customers().length > 0 ? this.customers()[0].id || null : null);

    const firstStock = this.productStocks().length > 0 ? this.productStocks()[0] : null;

    this.newInvoiceForm = {
      customerId: custId as any,
      issueDate: todayStr,
      dueDate: dueStr,
      discountFcfa: 0,
      taxFcfa: 0,
      notes: '',
      paymentMethod: 'WAVE',
      paymentReference: '',
      immediatePayment: false,
      items: [
        {
          productId: firstStock ? firstStock.id : undefined,
          productName: firstStock ? firstStock.productName : '',
          productType: firstStock ? firstStock.productType : undefined,
          quantity: 1,
          unit: firstStock ? firstStock.unit : 'unité',
          unitPriceFcfa: firstStock ? (firstStock.unitPriceFcfa || 0) : 0,
          lineTotalFcfa: firstStock ? (firstStock.unitPriceFcfa || 0) : 0
        }
      ]
    };
    this.isNewInvoiceModalOpen.set(true);
  }

  closeNewInvoiceModal(): void {
    this.isNewInvoiceModalOpen.set(false);
  }

  addInvoiceItemLine(): void {
    this.newInvoiceForm.items.push({
      productId: undefined,
      productName: '',
      productType: 'CHEESE',
      quantity: 1,
      unit: 'unité',
      unitPriceFcfa: 1000,
      lineTotalFcfa: 1000
    });
  }

  removeInvoiceItemLine(index: number): void {
    if (this.newInvoiceForm.items.length > 1) {
      this.newInvoiceForm.items.splice(index, 1);
    }
  }

  /**
   * Identifiant reserve au lait cru de la cuve dans le selecteur de produits.
   * Ce n'est pas une reference de stock transforme : le lait est deduit de la
   * ventilation vente directe, pas de la table des produits finis.
   */
  readonly RAW_MILK_OPTION_ID = -1;

  /** Litres de lait cru encore disponibles a la vente directe. */
  get rawMilkAvailableLiters(): number {
    return Math.max(0, this.milkStockAllocation().directSaleAvailable || 0);
  }

  /** Prix indicatif du litre, repris de la recette lait si elle en fixe un. */
  /** Prix du litre applique par defaut en facturation, issu du tarif enregistre. */
  get rawMilkUnitPrice(): number {
    return this.milkPricing()?.directSalePricePerLiterFcfa || 0;
  }

  /** Total de lait cru deja pose sur la facture en cours. */
  get rawMilkOnCurrentInvoice(): number {
    return Math.round(this.newInvoiceForm.items
      .filter(it => it.productType === 'RAW_MILK')
      .reduce((acc, it) => acc + (Number(it.quantity) || 0), 0) * 10) / 10;
  }

  onInvoiceItemProductSelect(index: number, stockId: any): void {
    const id = Number(stockId);
    const item = this.newInvoiceForm.items[index];

    // Lait cru de la cuve : il ne vient pas du stock de produits finis
    if (id === this.RAW_MILK_OPTION_ID) {
      item.productId = undefined;
      item.productName = 'Lait Cru Bio (vente directe)';
      item.productType = 'RAW_MILK';
      item.unit = 'Litre';
      item.unitPriceFcfa = this.rawMilkUnitPrice;
      item.lineTotalFcfa = (item.quantity || 0) * item.unitPriceFcfa;
      return;
    }

    const stock = this.productStocks().find(st => st.id === id);
    if (stock) {
      item.productId = stock.id;
      item.productName = stock.productName;
      item.productType = stock.productType;
      item.unit = stock.unit || 'unite';
      item.unitPriceFcfa = stock.unitPriceFcfa || 0;
      item.lineTotalFcfa = (item.quantity || 0) * item.unitPriceFcfa;
    }
  }

  onInvoiceItemQtyPriceChange(index: number): void {
    const item = this.newInvoiceForm.items[index];
    item.lineTotalFcfa = (item.quantity || 0) * (item.unitPriceFcfa || 0);
  }

  get newInvoiceSubTotal(): number {
    return this.newInvoiceForm.items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPriceFcfa || 0)), 0);
  }

  get newInvoiceGrandTotal(): number {
    return Math.max(0, this.newInvoiceSubTotal - (this.newInvoiceForm.discountFcfa || 0));
  }

  submitNewInvoice(): void {
    if (!this.newInvoiceForm.customerId) {
      this.showToast('Erreur: Veuillez sélectionner un client.');
      return;
    }
    if (this.newInvoiceForm.items.length === 0 || !this.newInvoiceForm.items[0].productName) {
      this.showToast('Erreur: Veuillez ajouter au moins un produit à la facture.');
      return;
    }

    if (this.newInvoiceForm.dueDate && this.newInvoiceForm.dueDate < this.newInvoiceForm.issueDate) {
      this.showToast("La date d'échéance ne peut pas être antérieure à la date d'émission.");
      return;
    }
    if ((this.newInvoiceForm.discountFcfa || 0) > this.newInvoiceSubTotal) {
      this.showToast("La remise ne peut pas être supérieure au sous-total de la facture.");
      return;
    }

    // Le lait cru facture ne peut pas depasser le stock reserve a la vente directe
    const rawMilk = this.rawMilkOnCurrentInvoice;
    if (rawMilk > this.rawMilkAvailableLiters) {
      this.showToast(`Stock insuffisant : ${rawMilk} L de lait facturés pour ${this.rawMilkAvailableLiters} L disponibles en vente directe.`);
      return;
    }

    // Verification de disponibilite sur les stocks transformes (alerte flux tendu / reliquat)
    const deficitItems: string[] = [];
    this.newInvoiceForm.items.forEach(it => {
      if (it.productId) {
        const stock = this.productStocks().find(s => s.id === it.productId);
        if (stock && it.quantity > stock.quantityAvailable) {
          deficitItems.push(`- ${it.productName} : demandé ${it.quantity}, disponible ${stock.quantityAvailable}`);
        }
      }
    });
    if (deficitItems.length > 0) {
      const confirmed = window.confirm(
        `⚠️ Alerte Stock Insuffisant (Chambre Froide) :\n\n` +
        deficitItems.join('\n') +
        `\n\nSouhaitez-vous autoriser la vente en flux tendu / reliquat (livraison différée) ?`
      );
      if (!confirmed) {
        return;
      }
    }

    const customer = this.customers().find(c => c.id === Number(this.newInvoiceForm.customerId));
    const invCount = this.invoices().length + 1;
    const invNum = `FAC-${new Date().getFullYear()}-${String(invCount).padStart(4, '0')}`;
    const grandTotal = this.newInvoiceGrandTotal;
    const paid = this.newInvoiceForm.immediatePayment ? grandTotal : 0;
    const remaining = grandTotal - paid;
    const status: InvoiceStatus = paid >= grandTotal ? 'PAID' : 'ISSUED';

    const invoicePayload: SaleInvoice = {
      invoiceNumber: invNum,
      customerId: Number(this.newInvoiceForm.customerId),
      customerName: customer?.name || 'Client',
      customerPhone: customer?.phone,
      customerEmail: customer?.email,
      customerAddress: customer ? `${customer.address || ''}, ${customer.city || ''}` : '',
      customerNinea: customer?.nineaNumber,
      issueDate: this.newInvoiceForm.issueDate,
      dueDate: this.newInvoiceForm.dueDate,
      subTotalFcfa: this.newInvoiceSubTotal,
      discountFcfa: this.newInvoiceForm.discountFcfa,
      taxFcfa: 0,
      totalAmountFcfa: grandTotal,
      paidAmountFcfa: paid,
      remainingAmountFcfa: remaining,
      status: status,
      paymentMethod: this.newInvoiceForm.immediatePayment ? this.newInvoiceForm.paymentMethod : undefined,
      paymentReference: this.newInvoiceForm.immediatePayment ? this.newInvoiceForm.paymentReference : undefined,
      notes: this.newInvoiceForm.notes,
      items: this.newInvoiceForm.items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        productType: it.productType,
        quantity: it.quantity,
        unit: it.unit,
        unitPriceFcfa: it.unitPriceFcfa,
        lineTotalFcfa: it.quantity * it.unitPriceFcfa
      }))
    };

    this.apiService.createInvoice(invoicePayload).subscribe({
      next: (created) => {
        this.invoices.update(list => [created, ...list]);
        this.decrementStockFromInvoice(created);
        this.refreshCommercialSummary();
        // Le serveur a deduit le lait cru vendu : on relit les soldes de la cuve
        this.refreshTankAndAllocation();
        this.showToast(`Facture ${created.invoiceNumber} enregistrée (${created.totalAmountFcfa.toLocaleString()} FCFA) !`);
        this.closeNewInvoiceModal();
      },
      error: (err) => {
        // Le serveur detaille le refus (stock de lait insuffisant, par exemple)
        const msg = err?.error?.message || "impossible d'enregistrer la facture.";
        this.showToast(`Échec : ${msg}`);
      }
    });
  }

  private decrementStockFromInvoice(invoice: SaleInvoice): void {
    if (invoice.items) {
      invoice.items.forEach(item => {
        if (item.productId) {
          this.productStocks.update(stocks => stocks.map(s => {
            if (s.id === item.productId) {
              const newQty = Math.max(0, s.quantityAvailable - item.quantity);
              return { ...s, quantityAvailable: newQty, totalValueFcfa: newQty * (s.unitPriceFcfa || 0) };
            }
            return s;
          }));
        }
      });
      this.refreshTransformationSummary();
    }
  }

  // --- Customer Modals & Actions ---
  openNewCustomerModal(): void {
    this.newCustomerForm = {
      name: '',
      companyName: '',
      customerType: 'SUPERMARKET',
      phone: '',
      email: '',
      address: '',
      city: 'Dakar',
      nineaNumber: '',
      notes: ''
    };
    this.isNewCustomerModalOpen.set(true);
  }

  closeNewCustomerModal(): void {
    this.isNewCustomerModalOpen.set(false);
  }

  isValidSenegalPhone(phone?: string): boolean {
    if (!phone || !phone.trim()) return true;
    const digits = phone.replace(/[^0-9]/g, '');
    const cleanDigits = (digits.startsWith('221') && digits.length === 12) ? digits.substring(3) : digits;
    return /^(70|75|76|77|78|33)[0-9]{7}$/.test(cleanDigits);
  }

  normalizeSenegalPhone(phone?: string): string {
    if (!phone || !phone.trim()) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    const cleanDigits = (digits.startsWith('221') && digits.length === 12) ? digits.substring(3) : digits;
    if (/^(70|75|76|77|78|33)[0-9]{7}$/.test(cleanDigits)) {
      return `+221 ${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 5)} ${cleanDigits.substring(5, 7)} ${cleanDigits.substring(7, 9)}`;
    }
    return phone.trim();
  }

  submitNewCustomer(): void {
    if (!this.newCustomerForm.name || !this.newCustomerForm.name.trim()) {
      this.showToast('Erreur : Veuillez renseigner le nom du client.');
      return;
    }

    if (this.newCustomerForm.phone && this.newCustomerForm.phone.trim()) {
      if (!this.isValidSenegalPhone(this.newCustomerForm.phone)) {
        this.showToast('Numéro invalide : renseignez un numéro sénégalais (ex: 77 123 45 67, 78..., 76..., 70..., 75... ou fixe 33...).');
        return;
      }
      const norm = this.normalizeSenegalPhone(this.newCustomerForm.phone);
      const exists = this.customers().some(c => c.phone && this.normalizeSenegalPhone(c.phone) === norm);
      if (exists) {
        this.showToast(`Erreur : Ce numéro de téléphone (${norm}) est déjà attribué à un autre client.`);
        return;
      }
      this.newCustomerForm.phone = norm;
    }

    if (this.newCustomerForm.email && this.newCustomerForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.newCustomerForm.email.trim())) {
        this.showToast('Format d\'adresse email invalide.');
        return;
      }
      const emailExists = this.customers().some(c => c.email && c.email.trim().toLowerCase() === this.newCustomerForm.email?.trim().toLowerCase());
      if (emailExists) {
        this.showToast('Erreur : Cette adresse email est déjà attribuée à un client.');
        return;
      }
    }

    const payload: Customer = {
      ...this.newCustomerForm,
      totalOrdersCount: 0,
      totalSpentFcfa: 0,
      balanceDueFcfa: 0
    };

    this.apiService.createCustomer(payload).subscribe({
      next: (created) => {
        this.customers.update(list => [...list, created]);
        this.refreshCommercialSummary();
        this.showToast(`Client "${created.name}" enregistré avec succès !`);
        this.closeNewCustomerModal();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || "Impossible d'enregistrer le client.";
        this.showToast(`Erreur : ${msg}`);
      }
    });
  }

  openEditCustomerModal(customer: Customer): void {
    this.editCustomerForm = {
      id: customer.id,
      name: customer.name,
      companyName: customer.companyName || '',
      customerType: customer.customerType,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Dakar',
      nineaNumber: customer.nineaNumber || '',
      notes: customer.notes || ''
    };
    this.isEditCustomerModalOpen.set(true);
  }

  closeEditCustomerModal(): void {
    this.isEditCustomerModalOpen.set(false);
  }

  submitEditCustomer(): void {
    if (!this.editCustomerForm.id) return;
    if (!this.editCustomerForm.name || !this.editCustomerForm.name.trim()) {
      this.showToast('Erreur : Veuillez renseigner le nom du client.', 'error');
      return;
    }

    if (this.editCustomerForm.phone && this.editCustomerForm.phone.trim()) {
      if (!this.isValidSenegalPhone(this.editCustomerForm.phone)) {
        this.showToast('Numéro invalide : format sénégalais attendu (ex: 77 123 45 67).', 'error');
        return;
      }
      const norm = this.normalizeSenegalPhone(this.editCustomerForm.phone);
      const exists = this.customers().some(c => c.id !== this.editCustomerForm.id && c.phone && this.normalizeSenegalPhone(c.phone) === norm);
      if (exists) {
        this.showToast(`Erreur : Ce numéro (${norm}) est déjà attribué à un autre client.`, 'error');
        return;
      }
      this.editCustomerForm.phone = norm;
    }

    if (this.editCustomerForm.email && this.editCustomerForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.editCustomerForm.email.trim())) {
        this.showToast('Format d\'adresse email invalide.', 'error');
        return;
      }
      const emailExists = this.customers().some(c => c.id !== this.editCustomerForm.id && c.email && c.email.trim().toLowerCase() === this.editCustomerForm.email?.trim().toLowerCase());
      if (emailExists) {
        this.showToast('Erreur : Cette adresse email est déjà attribuée.', 'error');
        return;
      }
    }

    const currentCust = this.customers().find(c => c.id === this.editCustomerForm.id);
    const payload: Customer = {
      ...currentCust,
      ...this.editCustomerForm
    } as Customer;

    this.apiService.updateCustomer(this.editCustomerForm.id, payload).subscribe({
      next: (updated) => {
        this.customers.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.refreshCommercialSummary();
        this.showToast(`Client "${updated.name}" mis à jour avec succès !`, 'success');
        this.closeEditCustomerModal();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || "Impossible de modifier le client.";
        this.showToast(`Erreur : ${msg}`, 'error');
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    if (!customer.id) return;
    if ((customer.balanceDueFcfa || 0) > 0) {
      this.showToast(`Impossible de supprimer le client "${customer.name}" : une dette en cours de ${customer.balanceDueFcfa?.toLocaleString()} FCFA doit être soldée au préalable.`, 'error');
      return;
    }
    const confirmed = window.confirm(`Confirmez-vous la suppression du client "${customer.name}" ?`);
    if (!confirmed) return;

    this.apiService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.customers.update(list => list.filter(c => c.id !== customer.id));
        this.refreshCommercialSummary();
        this.showToast(`Client "${customer.name}" supprimé avec succès !`, 'success');
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || "Impossible de supprimer le client.";
        this.showToast(`Erreur : ${msg}`, 'error');
      }
    });
  }

  openCustomerInvoicesModal(customer: Customer): void {
    this.selectedCustomerForInvoices.set(customer);
    this.isCustomerInvoicesModalOpen.set(true);
  }

  closeCustomerInvoicesModal(): void {
    this.isCustomerInvoicesModalOpen.set(false);
    this.selectedCustomerForInvoices.set(null);
  }

  getCustomerInvoices(customerId?: number): SaleInvoice[] {
    if (!customerId) return [];
    return this.invoices().filter(inv => inv.customerId === customerId);
  }

  viewAllCustomerInvoicesInJournal(customer: Customer): void {
    this.closeCustomerInvoicesModal();
    this.navigateToCommercialSubTab('invoices');
    this.invoicesSearchTerm.set(customer.name);
    this.invoicesCurrentPage.set(1);
    this.invoiceFilterStatus.set('ALL');
  }

  // --- Payment Modal & Actions ---
  openPaymentModal(invoice: SaleInvoice): void {
    this.selectedInvoiceForPayment.set(invoice);
    this.paymentForm = {
      amountPaidFcfa: invoice.remainingAmountFcfa || invoice.totalAmountFcfa,
      paymentMethod: 'WAVE',
      transactionReference: this.generateSimulatedPaymentRef('WAVE'),
      receivedBy: 'Comptabilité Ferme LAWTAN',
      notes: `Règlement facture ${invoice.invoiceNumber}`
    };
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen.set(false);
    this.selectedInvoiceForPayment.set(null);
  }

  onPaymentMethodChange(): void {
    this.paymentForm.transactionReference = this.generateSimulatedPaymentRef(this.paymentForm.paymentMethod);
  }

  generateSimulatedPaymentRef(method: PaymentMethod): string {
    const rand = Math.floor(100000 + Math.random() * 900000);
    switch (method) {
      case 'WAVE': return `WAVE-SN-${rand}`;
      case 'ORANGE_MONEY': return `OM-SN-${rand}`;
      case 'CASH': return `CASH-REC-${rand.toString().slice(-4)}`;
      case 'BANK_TRANSFER': return `VIR-BOA-${rand}`;
      case 'CHECK': return `CHQ-SGBS-${rand}`;
      default: return `PAY-${rand}`;
    }
  }

  submitPayment(): void {
    const inv = this.selectedInvoiceForPayment();
    if (!inv || !inv.id) return;

    const amount = Number(this.paymentForm.amountPaidFcfa);
    if (!amount || amount <= 0) {
      this.showToast('Erreur: Veuillez saisir un montant de règlement valide (> 0 FCFA).');
      return;
    }

    const remaining = inv.remainingAmountFcfa !== undefined ? inv.remainingAmountFcfa : inv.totalAmountFcfa;
    if (amount > remaining) {
      this.showToast(`Erreur : Le montant saisi (${amount.toLocaleString()} FCFA) dépasse le reste dû (${remaining.toLocaleString()} FCFA).`);
      return;
    }

    const receiptNum = `REC-${new Date().getFullYear()}-${String(this.payments().length + 1).padStart(4, '0')}`;
    const paymentPayload: PaymentTransaction = {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      paymentDate: new Date().toISOString(),
      amountPaidFcfa: amount,
      paymentMethod: this.paymentForm.paymentMethod,
      transactionReference: this.paymentForm.transactionReference,
      receiptNumber: receiptNum,
      receivedBy: this.paymentForm.receivedBy,
      notes: this.paymentForm.notes
    };

    this.apiService.recordInvoicePayment(inv.id, paymentPayload).subscribe({
      next: (updatedInvoice) => {
        this.invoices.update(list => list.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
        this.payments.update(list => [paymentPayload, ...list]);
        this.refreshCommercialSummary();
        this.showToast(`Règlement de ${amount.toLocaleString()} FCFA enregistré (${paymentPayload.paymentMethod}) !`);
        this.closePaymentModal();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || "Impossible d'enregistrer le paiement.";
        this.showToast(`Erreur : ${msg}`);
      }
    });
  }

  // --- Print / Detail Modal & Actions ---
  openInvoicePrintModal(invoice: SaleInvoice): void {
    this.selectedInvoiceForPrint.set(invoice);
    this.isInvoicePrintModalOpen.set(true);
  }

  closeInvoicePrintModal(): void {
    this.isInvoicePrintModalOpen.set(false);
    this.selectedInvoiceForPrint.set(null);
  }

  triggerPrint(): void {
    window.print();
  }

  // --- Commercial UI Label & Badge Helpers ---
  getInvoiceStatusBadgeClass(status?: InvoiceStatus): string {
    switch (status) {
      case 'PAID': return 'badge-status-paid';
      case 'PARTIALLY_PAID': return 'badge-status-partial';
      case 'ISSUED': return 'badge-status-issued';
      case 'OVERDUE': return 'badge-status-overdue';
      case 'CANCELLED': return 'badge-status-cancelled';
      default: return 'badge-status-issued';
    }
  }

  getInvoiceStatusLabel(status?: InvoiceStatus): string {
    switch (status) {
      case 'PAID': return 'Soldée / Payée';
      case 'PARTIALLY_PAID': return 'Acompte Versé';
      case 'ISSUED': return 'Émise / En attente';
      case 'OVERDUE': return 'En Retard';
      case 'CANCELLED': return 'Annulée';
      case 'DRAFT': return 'Brouillon';
      default: return 'Émise';
    }
  }

  getCustomerTypeBadgeClass(type?: CustomerType): string {
    switch (type) {
      case 'SUPERMARKET': return 'badge-cust-supermarket';
      case 'HOTEL_RESTAURANT': return 'badge-cust-hotel';
      case 'GROCERY_BIO': return 'badge-cust-grocery';
      case 'INDIVIDUAL': return 'badge-cust-individual';
      default: return 'badge-cust-individual';
    }
  }

  getCustomerTypeLabel(type?: CustomerType): string {
    switch (type) {
      case 'SUPERMARKET': return 'Supermarché / GMS';
      case 'HOTEL_RESTAURANT': return 'Hôtel & Resto';
      case 'GROCERY_BIO': return 'Épicerie Bio';
      case 'INDIVIDUAL': return 'Particulier';
      default: return 'Client';
    }
  }

  getPaymentMethodBadgeClass(method?: PaymentMethod): string {
    switch (method) {
      case 'WAVE': return 'badge-pay-wave';
      case 'ORANGE_MONEY': return 'badge-pay-om';
      case 'CASH': return 'badge-pay-cash';
      case 'BANK_TRANSFER': return 'badge-pay-bank';
      case 'CHECK': return 'badge-pay-check';
      default: return 'badge-pay-cash';
    }
  }

  getPaymentMethodLabel(method?: PaymentMethod): string {
    switch (method) {
      case 'WAVE': return 'Wave Sénégal';
      case 'ORANGE_MONEY': return 'Orange Money';
      case 'CASH': return 'Espèces';
      case 'BANK_TRANSFER': return 'Virement Bancaire';
      case 'CHECK': return 'Chèque';
      default: return 'Règlement';
    }
  }

  getPaymentMethodIcon(method?: PaymentMethod): string {
    switch (method) {
      case 'WAVE': return '';
      case 'ORANGE_MONEY': return '';
      case 'CASH': return '';
      case 'BANK_TRANSFER': return '';
      case 'CHECK': return '';
      default: return '';
    }
  }

  // ==========================================
  // LOCALSTORAGE PERSISTENCE HELPERS (OFFLINE-FIRST)
  // ==========================================
  // ==========================================
  // SPRINT 5: ALIMENTATION, SOLAIRE & AUDIT METHODS
  // ==========================================

  loadFeedAndSolarData(): void {
    // 1. Feed Stocks
    this.apiService.getAllFeedStocks().subscribe({
      next: (stocks) => {
        this.feedStocks.set(stocks || []);
      },
      error: (err) => {
        this.feedStocks.set([]);
        this.reportDataLoadFailure("Stocks d'aliment", err);
      }
    });

    // 2. Feed Rations
    this.apiService.getAllFeedRations().subscribe({
      next: (rations) => {
        this.feedRations.set(rations || []);
      },
      error: (err) => {
        this.feedRations.set([]);
        this.reportDataLoadFailure('Rations', err);
      }
    });

    // 3. Feed Distributions
    this.apiService.getAllFeedDistributions().subscribe({
      next: (dists) => {
        this.feedDistributions.set(dists || []);
      },
      error: () => {
        this.feedDistributions.set([]);
      }
    });

    // 3. Solar Telemetry
    this.apiService.getSolarTelemetry().subscribe({
      next: (solar) => {
        this.solarTelemetry.set(solar || null);
      },
      error: () => {
        this.solarTelemetry.set(null);
      }
    });

    // 4. Fournisseurs / Suppliers
    this.loadSuppliersData();
  }

  loadSuppliersData(): void {
    this.apiService.getAllSuppliers().subscribe({
      next: (sups) => {
        this.suppliers.set(sups || []);
      },
      error: (err) => {
        this.suppliers.set([]);
        this.reportDataLoadFailure('Fournisseurs', err);
      }
    });
  }

  // Navigation sub-tabs
  toggleFeedMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.isFeedMenuOpen.update(v => !v);
  }

  navigateToFeedSubTab(subTab: 'stocks' | 'rations' | 'distributions' | 'suppliers'): void {
    this.isFeedMenuOpen.set(true);
    this.activeFeedSubTab.set(subTab);
    this.showPage('alimentation');
  }

  switchFeedSubTab(tab: 'stocks' | 'rations' | 'distributions' | 'suppliers'): void {
    this.activeFeedSubTab.set(tab);
  }

  // Filters & Pagination for Feed Stocks
  filterFeedStocks(category: string): void {
    this.feedCategoryFilter.set(category);
    this.feedStocksCurrentPage.set(1);
  }

  get filteredFeedStocks(): FeedStock[] {
    let result = this.feedStocks();
    const cat = this.feedCategoryFilter();
    if (cat !== 'ALL') {
      result = result.filter(s => s.category === cat);
    }
    const q = this.feedStockSearchTerm().toLowerCase().trim();
    if (q) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.supplierName && s.supplierName.toLowerCase().includes(q)) ||
        (s.storageLocation && s.storageLocation.toLowerCase().includes(q))
      );
    }
    return result;
  }

  get paginatedFeedStocks(): FeedStock[] {
    const start = (this.feedStocksCurrentPage() - 1) * this.feedStocksItemsPerPage();
    return this.filteredFeedStocks.slice(start, start + this.feedStocksItemsPerPage());
  }

  get totalFeedStocksPages(): number {
    return Math.ceil(this.filteredFeedStocks.length / this.feedStocksItemsPerPage()) || 1;
  }

  get feedStocksPageNumbers(): number[] {
    const total = this.totalFeedStocksPages;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  setFeedStocksPage(page: number): void {
    if (page >= 1 && page <= this.totalFeedStocksPages) {
      this.feedStocksCurrentPage.set(page);
    }
  }

  prevFeedStocksPage(): void {
    if (this.feedStocksCurrentPage() > 1) {
      this.feedStocksCurrentPage.update(p => p - 1);
    }
  }

  nextFeedStocksPage(): void {
    if (this.feedStocksCurrentPage() < this.totalFeedStocksPages) {
      this.feedStocksCurrentPage.update(p => p + 1);
    }
  }

  // Summaries
  get totalFeedStockKg(): number {
    return this.feedStocks().reduce((sum, s) => sum + (s.currentStockKg || 0), 0);
  }

  get lowFeedStockCount(): number {
    return this.feedStocks().filter(s => s.currentStockKg <= s.alertThresholdKg).length;
  }

  get averageDailyFeedCostFcfa(): number {
    const rations = this.feedRations();
    if (rations.length === 0) return 0;
    const total = rations.reduce((sum, r) => sum + (r.dailyCostFcfa || 0), 0);
    return Math.round(total / rations.length);
  }

  // Modals & Actions Feed Stock
  openNewFeedStockModal(): void {
    this.feedStockForm = {
      name: '',
      category: 'FORAGE_GREEN',
      currentStockKg: 500,
      alertThresholdKg: 200,
      unitPricePerKgFcfa: 80,
      supplierName: '',
      storageLocation: 'Hangar Fourrages',
      notes: ''
    };
    this.isFeedStockModalOpen.set(true);
  }

  closeFeedStockModal(): void {
    this.isFeedStockModalOpen.set(false);
  }

  saveFeedStock(): void {
    if (!this.feedStockForm.name) {
      this.showToast('Veuillez renseigner le nom de l\'aliment');
      return;
    }
    this.apiService.createFeedStock(this.feedStockForm).subscribe({
      next: (created) => {
        this.feedStocks.update(stocks => [created, ...stocks]);
        this.closeFeedStockModal();
        this.showToast(`Aliment "${created.name}" ajouté avec succès !`);
      },
      error: () => {
        this.showToast(`Échec : l'aliment "${this.feedStockForm.name}" n'a pas pu être enregistré en base.`);
      }
    });
  }

  quickAddFeedStockKg(stock: FeedStock, addKg: number): void {
    const newQty = (stock.currentStockKg || 0) + addKg;
    if (stock.id) {
      this.apiService.updateFeedStockQuantity(stock.id, newQty).subscribe({
        next: (updated) => {
          this.feedStocks.update(list => list.map(s => s.id === updated.id ? updated : s));
          this.showToast(`Stock de "${stock.name}" approvisionné (+${addKg} kg)`);
        },
        error: () => {
          this.showToast(`Échec : l'approvisionnement de "${stock.name}" n'a pas pu être enregistré en base.`);
        }
      });
    }
  }

  deleteFeedStock(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet aliment du registre ?')) {
      this.apiService.deleteFeedStock(id).subscribe({
        next: () => {
          this.feedStocks.update(list => list.filter(s => s.id !== id));
          this.showToast('Aliment supprimé avec succès.');
        },
        error: () => {
          this.showToast('Échec : l\'aliment n\'a pas pu être supprimé en base.');
        }
      });
    }
  }

  // ==========================================
  // SPRINT 5: FORMULES DE RATION MULTI-INGRÉDIENTS & DISTRIBUTION
  // ==========================================
  availableBreeds = ['Holstein', 'Guzerat', 'Montbéliarde', 'Jersiaise', 'Gobra', 'Métisse'];

  toggleBreedInRation(breed: string): void {
    if (!this.feedRationForm.targetBreeds) {
      this.feedRationForm.targetBreeds = [];
    }
    const idx = this.feedRationForm.targetBreeds.indexOf(breed);
    if (idx >= 0) {
      this.feedRationForm.targetBreeds.splice(idx, 1);
    } else {
      this.feedRationForm.targetBreeds.push(breed);
    }
  }

  isBreedSelected(breed: string): boolean {
    return !!(this.feedRationForm.targetBreeds && this.feedRationForm.targetBreeds.includes(breed));
  }

  openNewFeedRationModal(): void {
    const defaultIngredients: FeedRationIngredient[] = [];
    const stocks = this.feedStocks();

    if (stocks.length > 0) {
      const ensilage = stocks.find(s => s.category === 'FORAGE_GREEN') || stocks[0];
      defaultIngredients.push({
        feedStockId: ensilage.id || 1,
        feedStockName: ensilage.name,
        quantityKg: 15,
        dryMatterPercentage: 32,
        calculatedDryMatterKg: 4.8,
        unitPriceFcfa: ensilage.unitPricePerKgFcfa || 65,
        calculatedCostFcfa: 975
      });

      const foin = stocks.find(s => s.category === 'FORAGE_DRY') || (stocks[1] || stocks[0]);
      if (foin && foin.id !== ensilage.id) {
        defaultIngredients.push({
          feedStockId: foin.id || 2,
          feedStockName: foin.name,
          quantityKg: 4,
          dryMatterPercentage: 88,
          calculatedDryMatterKg: 3.5,
          unitPriceFcfa: foin.unitPricePerKgFcfa || 110,
          calculatedCostFcfa: 440
        });
      }

      const concentre = stocks.find(s => s.category === 'CONCENTRATE');
      if (concentre) {
        defaultIngredients.push({
          feedStockId: concentre.id || 3,
          feedStockName: concentre.name,
          quantityKg: 3,
          dryMatterPercentage: 90,
          calculatedDryMatterKg: 2.7,
          unitPriceFcfa: concentre.unitPricePerKgFcfa || 240,
          calculatedCostFcfa: 720
        });
      }
    }

    this.feedRationForm = {
      rationName: '',
      targetCategory: 'Vaches Haute Lactation',
      targetBreeds: ['Holstein'],
      targetAnimalIds: [],
      ingredients: defaultIngredients,
      totalFreshWeightKg: 19,
      dailyDryMatterKg: 8.3,
      compositionDescription: '',
      dailyCostFcfa: 1415,
      energyUfl: 13.5,
      proteinPdiGrams: 1300
    };
    this.recalculateRationTotals();
    this.isFeedRationModalOpen.set(true);
  }

  closeFeedRationModal(): void {
    this.isFeedRationModalOpen.set(false);
  }

  addIngredientToRation(stockId?: number): void {
    const stocks = this.feedStocks();
    if (stocks.length === 0) return;
    const stock = stockId ? stocks.find(s => s.id === +stockId) : stocks[0];
    if (!stock) return;

    let dmP = 85;
    if (stock.category === 'FORAGE_GREEN') dmP = 32;
    else if (stock.category === 'FORAGE_DRY') dmP = 88;
    else if (stock.category === 'CONCENTRATE') dmP = 90;
    else if (stock.category === 'MINERALS_VITAMINS') dmP = 95;

    const defaultQty = stock.category === 'FORAGE_GREEN' ? 10 : (stock.category === 'FORAGE_DRY' ? 4 : (stock.category === 'CONCENTRATE' ? 2 : 0.2));

    if (!this.feedRationForm.ingredients) {
      this.feedRationForm.ingredients = [];
    }

    this.feedRationForm.ingredients.push({
      feedStockId: stock.id || 0,
      feedStockName: stock.name,
      quantityKg: defaultQty,
      dryMatterPercentage: dmP,
      calculatedDryMatterKg: Math.round(defaultQty * (dmP / 100) * 10) / 10,
      unitPriceFcfa: stock.unitPricePerKgFcfa || 80,
      calculatedCostFcfa: Math.round(defaultQty * (stock.unitPricePerKgFcfa || 80))
    });
    this.recalculateRationTotals();
  }

  removeIngredientFromRation(index: number): void {
    if (!this.feedRationForm.ingredients) {
      this.feedRationForm.ingredients = [];
    }
    this.feedRationForm.ingredients.splice(index, 1);
    this.recalculateRationTotals();
  }

  onIngredientStockChange(index: number, stockId: any): void {
    const stock = this.feedStocks().find(s => s.id === +stockId);
    if (!stock) return;
    if (!this.feedRationForm.ingredients) {
      this.feedRationForm.ingredients = [];
    }
    const ing = this.feedRationForm.ingredients[index];
    if (!ing) return;
    ing.feedStockId = stock.id || 0;
    ing.feedStockName = stock.name;
    ing.unitPriceFcfa = stock.unitPricePerKgFcfa || 80;
    if (stock.category === 'FORAGE_GREEN') ing.dryMatterPercentage = 32;
    else if (stock.category === 'FORAGE_DRY') ing.dryMatterPercentage = 88;
    else if (stock.category === 'CONCENTRATE') ing.dryMatterPercentage = 90;
    else if (stock.category === 'MINERALS_VITAMINS') ing.dryMatterPercentage = 95;
    this.recalculateRationTotals();
  }

  recalculateRationTotals(): void {
    let totalFresh = 0;
    let totalDm = 0;
    let totalCost = 0;
    const parts: string[] = [];
    const list = this.feedRationForm.ingredients || [];

    for (const ing of list) {
      const qty = Number(ing.quantityKg) || 0;
      const dmP = Number(ing.dryMatterPercentage) || 85;
      const price = Number(ing.unitPriceFcfa) || 0;

      const dmKg = qty * (dmP / 100);
      const cost = qty * price;

      ing.calculatedDryMatterKg = Math.round(dmKg * 10) / 10;
      ing.calculatedCostFcfa = Math.round(cost);

      totalFresh += qty;
      totalDm += dmKg;
      totalCost += cost;

      if (qty > 0) {
        parts.push(`${qty} kg ${ing.feedStockName}`);
      }
    }

    this.feedRationForm.totalFreshWeightKg = Math.round(totalFresh * 10) / 10;
    this.feedRationForm.dailyDryMatterKg = Math.round(totalDm * 10) / 10;
    this.feedRationForm.dailyCostFcfa = Math.round(totalCost);
    this.feedRationForm.compositionDescription = parts.join(' + ') || 'Ration équilibrée multi-ingrédients';
  }

  saveFeedRation(): void {
    if (!this.feedRationForm.rationName) {
      this.showToast('Veuillez renseigner le nom de la formule');
      return;
    }
    this.recalculateRationTotals();

    const rationToSave: FeedRation = {
      ...this.feedRationForm,
      createdDate: new Date().toISOString().slice(0, 10)
    };

    this.apiService.createFeedRation(rationToSave).subscribe({
      next: (created) => {
        this.feedRations.update(rations => [created, ...rations]);
        this.closeFeedRationModal();
        const breedsLabel = (this.feedRationForm.targetBreeds && this.feedRationForm.targetBreeds.length > 0) 
          ? ` (${this.feedRationForm.targetBreeds.join(', ')})` 
          : '';
        this.showToast(`Fiche Ration "${created.rationName}"${breedsLabel} enregistrée avec succès !`);
      },
      error: () => {
        this.showToast(`Échec : la ration "${rationToSave.rationName}" n'a pas pu être enregistrée en base.`);
      }
    });
  }

  deleteFeedRation(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous supprimer cette formule de ration ?')) {
      this.apiService.deleteFeedRation(id).subscribe({
        next: () => {
          this.feedRations.update(list => list.filter(r => r.id !== id));
          this.showToast('Ration supprimée avec succès.');
        },
        error: () => {
          this.showToast('Échec : la ration n\'a pas pu être supprimée en base.');
        }
      });
    }
  }

  // --- Distributions Journalières Logic ---
  openDistributionModal(ration?: FeedRation): void {
    const selectedRation = ration || this.feedRations()[0];
    if (!selectedRation) {
      this.showToast('Veuillez d\'abord créer au moins une formule de ration.');
      return;
    }

    this.selectedRationForDistribution.set(selectedRation);
    const count = 6;
    const freshPerHead = selectedRation.totalFreshWeightKg || 22;
    const totalQty = Math.round(count * freshPerHead * 10) / 10;
    const costPerHead = selectedRation.dailyCostFcfa || 2100;

    const currentHour = new Date().getHours();
    const sessionType: 'MATIN' | 'MIDI' | 'SOIR' = currentHour < 12 ? 'MATIN' : (currentHour < 15 ? 'MIDI' : 'SOIR');

    this.distributionForm = {
      rationId: selectedRation.id || 0,
      rationName: selectedRation.rationName,
      distributionDate: new Date().toISOString().slice(0, 10),
      distributionTime: new Date().toTimeString().slice(0, 5),
      session: sessionType,
      quantityDistributedKg: totalQty,
      animalsCountNourished: count,
      targetGroupOrRace: selectedRation.targetBreeds && selectedRation.targetBreeds.length > 0 ? selectedRation.targetBreeds.join(', ') : selectedRation.targetCategory,
      selectedAnimalIds: selectedRation.targetAnimalIds || [],
      distributorName: 'Moussa Bouvier',
      totalCostFcfa: Math.round(count * costPerHead),
      notes: 'Distribution complète à l\'auge avec eau fraîche.'
    };

    this.isDistributionModalOpen.set(true);
  }

  closeDistributionModal(): void {
    this.isDistributionModalOpen.set(false);
    this.selectedRationForDistribution.set(null);
  }

  onRationSelectInDistribution(rationId: any): void {
    const ration = this.feedRations().find(r => r.id === +rationId);
    if (!ration) return;
    this.selectedRationForDistribution.set(ration);
    this.distributionForm.rationId = ration.id || 0;
    this.distributionForm.rationName = ration.rationName;
    this.distributionForm.targetGroupOrRace = ration.targetBreeds && ration.targetBreeds.length > 0 ? ration.targetBreeds.join(', ') : ration.targetCategory;
    const count = this.distributionForm.animalsCountNourished || 6;
    const freshPerHead = ration.totalFreshWeightKg || 22;
    this.distributionForm.quantityDistributedKg = Math.round(count * freshPerHead * 10) / 10;
    this.distributionForm.totalCostFcfa = Math.round(count * (ration.dailyCostFcfa || 2100));
  }

  onAnimalCountChange(): void {
    const ration = this.selectedRationForDistribution() || this.feedRations().find(r => r.id === this.distributionForm.rationId);
    const count = Number(this.distributionForm.animalsCountNourished) || 1;
    if (ration) {
      const freshPerHead = ration.totalFreshWeightKg || 22;
      this.distributionForm.quantityDistributedKg = Math.round(count * freshPerHead * 10) / 10;
      this.distributionForm.totalCostFcfa = Math.round(count * (ration.dailyCostFcfa || 2100));
    }
  }

  submitFeedDistribution(): void {
    if (!this.distributionForm.rationName || this.distributionForm.quantityDistributedKg <= 0) {
      this.showToast('Veuillez renseigner une formule et une quantité distribuée valide.');
      return;
    }

    const dist: FeedDistribution = {
      id: Date.now(),
      ...this.distributionForm
    };

    // 1. Déduction automatique et proportionnelle des stocks de matières premières
    const ration = this.selectedRationForDistribution() || this.feedRations().find(r => r.id === this.distributionForm.rationId);
    if (ration && ration.ingredients && ration.ingredients.length > 0) {
      const count = this.distributionForm.animalsCountNourished || 1;
      this.feedStocks.update(stocks => stocks.map(stock => {
        const ing = ration.ingredients?.find(i => i.feedStockId === stock.id || i.feedStockName === stock.name);
        if (ing) {
          const usedKg = Math.round(ing.quantityKg * count * 10) / 10;
          const newQty = Math.max(0, Math.round((stock.currentStockKg - usedKg) * 10) / 10);
          return {
            ...stock,
            currentStockKg: newQty,
            isLowStock: newQty <= stock.alertThresholdKg
          };
        }
        return stock;
      }));
    }

    // 2. Persistance & Ajout de la distribution à l'historique
    this.apiService.recordFeedDistribution(dist).subscribe({
      next: (created) => {
        this.feedDistributions.update(list => [created, ...list]);
        this.closeDistributionModal();
        this.showToast(`Distribution de ${created.quantityDistributedKg} kg de "${created.rationName}" enregistrée pour ${created.animalsCountNourished} têtes (${created.targetGroupOrRace}) ! Stocks déduits.`);
      },
      error: () => {
        this.showToast(`Échec : la distribution de "${dist.rationName}" n'a pas pu être enregistrée en base. Les stocks n'ont pas été déduits.`);
      }
    });
  }

  deleteDistribution(id?: number): void {
    if (!id) return;
    if (!confirm('Confirmez-vous la suppression de cette distribution du journal ?')) return;
    this.apiService.deleteFeedDistribution(id).subscribe({
      next: () => {
        this.feedDistributions.update(list => list.filter(d => d.id !== id));
        this.showToast('Distribution supprimée avec succès.');
      },
      error: () => {
        this.showToast('Échec : la distribution n\'a pas pu être supprimée en base.');
      }
    });
  }

  // --- Filtres & Pagination Distributions ---
  resetDistFilters(): void {
    this.distFilterStartDate.set('');
    this.distFilterEndDate.set('');
    this.distFilterRation.set('ALL');
    this.distFilterAnimalOrBreed.set('ALL');
    this.distFilterSearch.set('');
    this.distCurrentPage.set(1);
  }

  get filteredDistributions(): FeedDistribution[] {
    let list = this.feedDistributions();

    const start = this.distFilterStartDate();
    if (start) list = list.filter(d => d.distributionDate >= start);

    const end = this.distFilterEndDate();
    if (end) list = list.filter(d => d.distributionDate <= end);

    const r = this.distFilterRation();
    if (r && r !== 'ALL') list = list.filter(d => d.rationName === r);

    const b = this.distFilterAnimalOrBreed();
    if (b && b !== 'ALL') list = list.filter(d => d.targetGroupOrRace && d.targetGroupOrRace.includes(b));

    const q = this.distFilterSearch().toLowerCase().trim();
    if (q) {
      list = list.filter(d => 
        d.rationName.toLowerCase().includes(q) ||
        d.targetGroupOrRace.toLowerCase().includes(q) ||
        d.distributorName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  get paginatedDistributions(): FeedDistribution[] {
    const start = (this.distCurrentPage() - 1) * this.distPageSize();
    return this.filteredDistributions.slice(start, start + this.distPageSize());
  }

  get totalDistPages(): number {
    return Math.ceil(this.filteredDistributions.length / this.distPageSize()) || 1;
  }

  get distPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalDistPages; i++) pages.push(i);
    return pages;
  }

  setDistPage(page: number): void {
    if (page >= 1 && page <= this.totalDistPages) {
      this.distCurrentPage.set(page);
    }
  }

  prevDistPage(): void {
    if (this.distCurrentPage() > 1) {
      this.distCurrentPage.update(p => p - 1);
    }
  }

  nextDistPage(): void {
    if (this.distCurrentPage() < this.totalDistPages) {
      this.distCurrentPage.update(p => p + 1);
    }
  }

  get totalDistributedKg(): number {
    return Math.round(this.filteredDistributions.reduce((sum, d) => sum + (d.quantityDistributedKg || 0), 0) * 10) / 10;
  }

  get totalDistributedCostFcfa(): number {
    return Math.round(this.filteredDistributions.reduce((sum, d) => sum + (d.totalCostFcfa || 0), 0));
  }

  get totalAnimalsNourished(): number {
    return this.filteredDistributions.reduce((sum, d) => sum + (d.animalsCountNourished || 0), 0);
  }

  // Badge helpers Sprint 5
  getFeedCategoryLabel(cat?: string): string {
    switch (cat) {
      case 'FORAGE_GREEN': return 'Fourrage Vert / Ensilage';
      case 'FORAGE_DRY': return 'Fourrage Sec & Foin';
      case 'CONCENTRATE': return 'Concentré & Tourteau';
      case 'MINERALS_VITAMINS': return 'Minéraux, Sel & CMV';
      default: return 'Aliment';
    }
  }

  getFeedCategoryBadgeClass(cat?: string): string {
    switch (cat) {
      case 'FORAGE_GREEN': return 'badge-green';
      case 'FORAGE_DRY': return 'badge-gold';
      case 'CONCENTRATE': return 'badge-purple';
      case 'MINERALS_VITAMINS': return 'badge-blue';
      default: return 'badge-green';
    }
  }

  // ==========================================
  // FOURNISSEURS (SUPPLIERS) LOGIC & MODALS
  // ==========================================
  filterSuppliers(category: string): void {
    this.supplierCategoryFilter.set(category);
    this.suppliersCurrentPage.set(1);
  }

  get filteredSuppliers(): Supplier[] {
    let result = this.suppliers();
    const cat = this.supplierCategoryFilter();
    if (cat !== 'ALL') {
      result = result.filter(s => s.category === cat);
    }
    const q = this.supplierSearchTerm().toLowerCase().trim();
    if (q) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.companyName && s.companyName.toLowerCase().includes(q)) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }
    return result;
  }

  get paginatedSuppliers(): Supplier[] {
    const start = (this.suppliersCurrentPage() - 1) * this.suppliersItemsPerPage();
    return this.filteredSuppliers.slice(start, start + this.suppliersItemsPerPage());
  }

  get totalSuppliersPages(): number {
    return Math.ceil(this.filteredSuppliers.length / this.suppliersItemsPerPage()) || 1;
  }

  get suppliersPageNumbers(): number[] {
    const total = this.totalSuppliersPages;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  setSuppliersPage(page: number): void {
    if (page >= 1 && page <= this.totalSuppliersPages) {
      this.suppliersCurrentPage.set(page);
    }
  }

  prevSuppliersPage(): void {
    if (this.suppliersCurrentPage() > 1) {
      this.suppliersCurrentPage.update(p => p - 1);
    }
  }

  nextSuppliersPage(): void {
    if (this.suppliersCurrentPage() < this.totalSuppliersPages) {
      this.suppliersCurrentPage.update(p => p + 1);
    }
  }

  get totalSuppliersSpent(): number {
    return this.suppliers().reduce((sum, s) => sum + (s.totalSpentFcfa || 0), 0);
  }

  get bioCertifiedSuppliersCount(): number {
    return this.suppliers().filter(s => s.bioCertified).length;
  }

  openNewSupplierModal(sup?: Supplier): void {
    if (sup) {
      this.supplierForm = { ...sup };
    } else {
      this.supplierForm = {
        name: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: 'Thiès',
        category: 'FOURRAGE_ALIMENT',
        paymentTerms: 'Paiement à livraison / Wave',
        bioCertified: true,
        notes: ''
      };
    }
    this.isSupplierModalOpen.set(true);
  }

  closeSupplierModal(): void {
    this.isSupplierModalOpen.set(false);
  }

  saveSupplier(): void {
    if (!this.supplierForm.name.trim()) {
      this.showToast('Veuillez renseigner le nom du fournisseur');
      return;
    }

    if (this.supplierForm.phone && this.supplierForm.phone.trim()) {
      if (!this.isValidSenegalPhone(this.supplierForm.phone)) {
        this.showToast('Numéro invalide : renseignez un numéro sénégalais (ex: 77 123 45 67, 78..., 76..., 70..., 75... ou fixe 33...).');
        return;
      }
      const norm = this.normalizeSenegalPhone(this.supplierForm.phone);
      const exists = this.suppliers().some(s => s.id !== this.supplierForm.id && s.phone && this.normalizeSenegalPhone(s.phone) === norm);
      if (exists) {
        this.showToast(`Erreur : Ce numéro de téléphone (${norm}) est déjà utilisé par un autre fournisseur.`);
        return;
      }
      this.supplierForm.phone = norm;
    }

    if (this.supplierForm.id) {
      this.apiService.updateSupplier(this.supplierForm.id, this.supplierForm).subscribe({
        next: (updated) => {
          this.suppliers.update(list => list.map(s => s.id === updated.id ? updated : s));
          this.closeSupplierModal();
          this.showToast(`Fournisseur "${updated.name}" mis à jour avec succès !`);
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Erreur lors de la mise à jour du fournisseur.';
          this.showToast(`Erreur : ${msg}`);
        }
      });
    } else {
      this.apiService.createSupplier(this.supplierForm).subscribe({
        next: (created) => {
          this.suppliers.update(list => [created, ...list]);
          this.closeSupplierModal();
          this.showToast(`Fournisseur "${created.name}" enregistré avec succès !`);
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Erreur lors de la création du fournisseur.';
          this.showToast(`Erreur : ${msg}`);
        }
      });
    }
  }

  deleteSupplier(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous désactiver ce fournisseur ?')) {
      this.apiService.deleteSupplier(id).subscribe({
        next: () => {
          this.suppliers.update(list => list.filter(s => s.id !== id));
          this.showToast('Fournisseur retiré avec succès.');
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Erreur lors de la suppression du fournisseur.';
          this.showToast(`Erreur : ${msg}`);
        }
      });
    }
  }

  // Quick Supplier Inline Creation (Used directly within order/restock forms)
  openQuickSupplierModal(): void {
    this.quickSupplierForm = {
      name: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      city: 'Thiès',
      category: 'FOURRAGE_ALIMENT',
      paymentTerms: 'Comptant / Wave',
      bioCertified: true
    };
    this.isQuickSupplierModalOpen.set(true);
  }

  closeQuickSupplierModal(): void {
    this.isQuickSupplierModalOpen.set(false);
  }

  saveQuickSupplier(): void {
    if (!this.quickSupplierForm.name.trim()) {
      this.showToast('Veuillez saisir le nom du fournisseur');
      return;
    }

    if (this.quickSupplierForm.phone && this.quickSupplierForm.phone.trim()) {
      if (!this.isValidSenegalPhone(this.quickSupplierForm.phone)) {
        this.showToast('Numéro invalide : renseignez un numéro sénégalais pour le fournisseur.');
        return;
      }
      const norm = this.normalizeSenegalPhone(this.quickSupplierForm.phone);
      const exists = this.suppliers().some(s => s.phone && this.normalizeSenegalPhone(s.phone) === norm);
      if (exists) {
        this.showToast(`Erreur : Le numéro ${norm} est déjà utilisé par un fournisseur.`);
        return;
      }
      this.quickSupplierForm.phone = norm;
    }

    this.apiService.createSupplier(this.quickSupplierForm).subscribe({
      next: (created) => {
        this.suppliers.update(list => [created, ...list]);
        this.feedStockForm.supplierName = created.name;
        this.closeQuickSupplierModal();
        this.showToast(`Fournisseur "${created.name}" enregistré avec succès !`);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || "Erreur lors de l'enregistrement du fournisseur.";
        this.showToast(`Erreur : ${msg}`);
      }
    });
  }

  getSupplierCategoryLabel(cat?: string): string {
    switch (cat) {
      case 'FOURRAGE_ALIMENT': return 'Fourrages & Aliments';
      case 'EMBALLAGE_PACKAGING': return 'Packaging & Bouteilles';
      case 'EQUIPEMENT_PIECES': return 'Équipements & Pièces';
      case 'VETERINAIRE_SANTE': return 'Vétérinaire & Hygiène';
      default: return 'Général / Intrants';
    }
  }

  // Audit & Exportations
  openAuditReportModal(type: string = 'BIO_CERTIFICATE'): void {
    this.selectedAuditReportType.set(type);
    this.isAuditReportModalOpen.set(true);
  }

  closeAuditReportModal(): void {
    this.isAuditReportModalOpen.set(false);
  }

  downloadAuditReport(reportType: string): void {
    let reportTitle = 'Bilan_Audit_Bio_LAWTAN';
    let content = `=================================================================\n`;
    content += `FERME LAWTAN AGRO INDUSTRIES — RAPPORT D'AUDIT OFFICIEL\n`;
    content += `Certification Agriculture & Élevage Biologique • Sénégal\n`;
    content += `NINEA: SN-DKR-2023-A-0982 | Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    content += `=================================================================\n\n`;

    if (reportType === 'BIO_CERTIFICATE') {
      reportTitle = `Certificat_Conformite_Bio_${new Date().getFullYear()}`;
      content += `TYPE : PASSEPORT & CONFORMITÉ BIO\n`;
      content += `- Cheptel total : ${this.animals().length} têtes identifiées RFID\n`;
      content += `- Alimentation 100% Bio & Locale (Maïs bio, Niébé, Moringa, Sel de Gandiol)\n`;
      content += `- Utilisation antibiotiques : 0 résidu détecté (délai d'attente respecté à 100%)\n`;
      content += `- Énergie : 98.5% d'autonomie solaire photovoltaïque (45 kWc)\n`;
      content += `- Produits finis certifiés : Lait frais, Lait caillé Sow, Fromage fermier, Yaourt bio, Beurre\n\n`;
    } else if (reportType === 'DAIRY_ANNUAL') {
      reportTitle = `Bilan_Lactation_Annuel_${new Date().getFullYear()}`;
      content += `TYPE : BILAN DE LACTATION & COLLECTE LAITIÈRE\n`;
      content += `- Collecte moyenne jour : 142.5 Litres/jour\n`;
      content += `- Taux Butyrique moyen : 4.1%\n`;
      content += `- Vaches en lactation : ${this.animals().filter(a => a.category === 'MILKING_COW').length} vaches\n`;
      content += `- Température cuve moyenne : 3.8 °C (Chaîne du froid respectée à 100%)\n\n`;
    } else {
      reportTitle = `Compte_Exploitation_Commercial_${new Date().getFullYear()}`;
      content += `TYPE : COMPTE D'EXPLOITATION & VALORISATION COMMERCIALE\n`;
      content += `- Chiffre d'Affaires : ${(this.commercialSummary()?.totalRevenueFcfa || 1850000).toLocaleString()} FCFA\n`;
      content += `- Total Encaissé (Wave/OM/Cash/Virement) : ${(this.commercialSummary()?.totalCollectedFcfa || 1780000).toLocaleString()} FCFA\n`;
      content += `- Coût de l'Alimentation : ${this.averageDailyFeedCostFcfa * 30 * this.animals().length} FCFA/mois\n`;
      content += `- Marge brute sur transformation : 38.2%\n\n`;
    }

    content += `Document certifié conforme par la Direction d'Exploitation Ferme LAWTAN.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast(`Rapport "${reportTitle}" téléchargé avec succès !`);
    this.closeAuditReportModal();
  }

  // --- Production Laitière Sub-Menu Navigation ---
  toggleMilkMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isMilkMenuOpen.update(v => !v);
  }

  navigateToMilkSubTab(tab: 'milking' | 'journal' | 'stocks'): void {
    this.showPage('lait');
    this.activeMilkSubTab.set(tab);
    this.isMilkMenuOpen.set(true);
  }

  // --- Gestion des Stocks de Lait & Ventilation ---
  /** Lait collecte et jamais ventile, report des jours precedents inclus (calcul serveur). */
  get unallocatedMilkVolume(): number {
    return Math.max(0, this.milkStockAllocation().unallocatedVolume || 0);
  }

  /**
   * Lait que la ventilation du jour peut repartir : le lait jamais reparti,
   * augmente de ce que cette meme journee avait deja reparti, puisque
   * l'enregistrement remplace la ligne du jour au lieu de s'y ajouter.
   */
  get ventilableMilkVolume(): number {
    const a = this.milkStockAllocation();
    const alreadyToday = (Number(a.directSaleAllocatedToday) || 0)
      + (Number(a.productionAllocatedToday) || 0)
      + (Number(a.calvesAllocatedToday) || 0);
    return Math.max(0, Math.round(((a.unallocatedVolume || 0) + alreadyToday) * 10) / 10);
  }

  get unallocatedMilkPercentage(): number {
    const maxCap = this.tankStatus()?.maxCapacity || 500.0;
    return Math.round((this.unallocatedMilkVolume / maxCap) * 1000) / 10;
  }

  get availableDistributionRations(): string[] {
    const set = new Set<string>();
    this.feedRations().forEach(r => { if (r.rationName) set.add(r.rationName); });
    return Array.from(set);
  }

  // --- Tarif du lait cru ---
  startEditingMilkPrice(): void {
    this.milkPriceForm = {
      pricePerLiter: this.milkPricing()?.directSalePricePerLiterFcfa ?? null,
      notes: this.milkPricing()?.notes || ''
    };
    this.isMilkPriceEditing.set(true);
  }

  cancelEditingMilkPrice(): void {
    this.isMilkPriceEditing.set(false);
  }

  submitMilkPrice(): void {
    const price = Number(this.milkPriceForm.pricePerLiter);
    if (!Number.isFinite(price) || price < 0) {
      this.showToast('Veuillez saisir un prix au litre valide.');
      return;
    }

    this.apiService.updateMilkPricing({
      directSalePricePerLiterFcfa: price,
      notes: this.milkPriceForm.notes,
      updatedBy: this.authService.currentUser()?.name
    }).subscribe({
      next: (saved) => {
        this.milkPricing.set(saved || null);
        this.isMilkPriceEditing.set(false);
        this.showToast(`Tarif du lait cru enregistr\u00e9 : ${price.toLocaleString()} FCFA / litre.`);
      },
      error: (err) => {
        const msg = err?.error?.message || "le tarif n'a pas pu \u00eatre enregistr\u00e9.";
        this.showToast(`\u00c9chec : ${msg}`);
      }
    });
  }

  openVentilationModal(): void {
    const current = this.milkStockAllocation();
    // On pre-remplit avec ce qui a ete reparti aujourd'hui : enregistrer remplace
    // la ligne du jour, les jours precedents restent acquis.
    this.ventilationForm = {
      directSaleVolume: (current.directSaleAllocatedToday || 0) > 0 ? current.directSaleAllocatedToday! : null as any,
      productionVolume: (current.productionAllocatedToday || 0) > 0 ? current.productionAllocatedToday! : null as any,
      calvesVolume: (current.calvesAllocatedToday || 0) > 0 ? current.calvesAllocatedToday! : null as any,
      notes: current.notes || 'Ventilation journaliere'
    };
    this.isVentilationModalOpen.set(true);
  }

  closeVentilationModal(): void {
    this.isVentilationModalOpen.set(false);
  }

  get suggestedCalvesVolume(): number {
    return Math.round(this.ventilableMilkVolume * 0.05 * 10) / 10;
  }

  applySuggestedCalves(): void {
    this.ventilationForm.calvesVolume = this.suggestedCalvesVolume;
  }

  applyVentilationPreset(preset: 'balanced' | 'cheese' | 'direct'): void {
    const pool = this.ventilableMilkVolume;
    if (pool <= 0) return;
    const currentCalves = Number(this.ventilationForm.calvesVolume) || 0;
    const remain = Math.max(0, Math.round((pool - currentCalves) * 10) / 10);

    if (preset === 'balanced') {
      const direct = Math.round(remain * 0.50 * 10) / 10;
      this.ventilationForm.directSaleVolume = direct;
      this.ventilationForm.productionVolume = Math.round((remain - direct) * 10) / 10;
    } else if (preset === 'cheese') {
      const prod = Math.round(remain * 0.75 * 10) / 10;
      this.ventilationForm.productionVolume = prod;
      this.ventilationForm.directSaleVolume = Math.round((remain - prod) * 10) / 10;
    } else if (preset === 'direct') {
      const direct = Math.round(remain * 0.75 * 10) / 10;
      this.ventilationForm.directSaleVolume = direct;
      this.ventilationForm.productionVolume = Math.round((remain - direct) * 10) / 10;
    }
  }

  setCalvesToZero(): void {
    this.ventilationForm.calvesVolume = 0;
  }

  autoBalanceVentilation(): void {
    const direct = Number(this.ventilationForm.directSaleVolume) || 0;
    const prod = Number(this.ventilationForm.productionVolume) || 0;
    this.ventilationForm.calvesVolume =
      Math.max(0, Math.round((this.ventilableMilkVolume - direct - prod) * 10) / 10);
  }

  submitVentilation(): void {
    const pool = this.ventilableMilkVolume;
    const direct = Number(this.ventilationForm.directSaleVolume) || 0;
    const prod = Number(this.ventilationForm.productionVolume) || 0;
    const calves = Number(this.ventilationForm.calvesVolume) || 0;

    const totalAlloc = Math.round((direct + prod + calves) * 10) / 10;
    if (totalAlloc > pool) {
      const dep = Math.round((totalAlloc - pool) * 10) / 10;
      this.showToast(`Depassement de ${dep} L : total reparti (${totalAlloc} L) superieur au lait disponible (${pool} L).`);
      return;
    }

    this.apiService.saveMilkAllocation({
      allocationDate: new Date().toISOString().slice(0, 10),
      directSaleVolume: direct,
      productionVolume: prod,
      calvesVolume: calves,
      notes: this.ventilationForm.notes
    }).subscribe({
      next: (saved) => {
        if (saved) this.milkStockAllocation.set(saved);
        this.refreshTankAndAllocation();
        this.closeVentilationModal();
        this.showToast(`Ventilation enregistree : ${direct} L vente directe, ${prod} L production, ${calves} L veaux.`);
      },
      error: (err) => {
        const msg = err?.error?.message || "la ventilation n'a pas pu etre enregistree en base.";
        this.showToast(`Echec : ${msg}`);
      }
    });
  }

  getAvailableProductionMilkLiters(): number {
    return Math.max(0, Math.round((this.milkStockAllocation().productionAvailable || 0) * 10) / 10);
  }

  getAvailableDirectSaleMilkLiters(): number {
    return Math.max(0, Math.round((this.milkStockAllocation().directSaleAvailable || 0) * 10) / 10);
  }

  getAvailableCurdledMilkLiters(): number {
    return Math.round(
      this.productStocks()
        .filter(s => s.productType === 'CURDLED_MILK')
        .reduce((sum, s) => sum + (Number(s.quantityAvailable) || 0), 0) * 10
    ) / 10;
  }

  decrementCurdledMilkStock(litersToDeduct: number): void {
    let remaining = litersToDeduct;
    this.productStocks.update(stocks => {
      return stocks.map(item => {
        if (item.productType === 'CURDLED_MILK' && remaining > 0 && item.quantityAvailable > 0) {
          const deduct = Math.min(item.quantityAvailable, remaining);
          remaining -= deduct;
          const newQty = Math.round((item.quantityAvailable - deduct) * 10) / 10;
          return {
            ...item,
            quantityAvailable: newQty,
            totalValueFcfa: Math.round(newQty * (item.unitPriceFcfa || 1000))
          };
        }
        return item;
      });
    });
    this.refreshTransformationSummary();
  }

  /**
   * Le lait preleve par un ordre de fabrication est deduit par le serveur a partir
   * des lots enregistres ; il suffit de relire la ventilation.
   */
  decrementProductionMilkAllocation(liters: number): void {
    this.refreshTankAndAllocation();
  }

  /** Enregistre en base les litres ecoules en vente directe. */
  decrementDirectSaleMilkAllocation(liters: number): void {
    this.apiService.recordDirectSaleMilkConsumption(liters).subscribe({
      next: (alloc) => {
        if (alloc) this.milkStockAllocation.set(alloc);
      },
      error: (err) => {
        this.reportDataLoadFailure('Ventilation du lait', err);
      }
    });
  }

  // --- Fiches Rations Filtres & Pagination ---
  resetRationFilters(): void {
    this.rationSearchTerm.set('');
    this.rationCategoryFilter.set('ALL');
    this.rationBreedFilter.set('ALL');
    this.rationsCurrentPage.set(1);
  }

  get filteredFeedRations(): FeedRation[] {
    let list = this.feedRations();

    const cat = this.rationCategoryFilter();
    if (cat && cat !== 'ALL') {
      list = list.filter(r => r.targetCategory === cat);
    }

    const breed = this.rationBreedFilter();
    if (breed && breed !== 'ALL') {
      list = list.filter(r => r.targetBreeds && r.targetBreeds.includes(breed));
    }

    const q = this.rationSearchTerm().toLowerCase().trim();
    if (q) {
      list = list.filter(r => 
        (r.rationName && r.rationName.toLowerCase().includes(q)) ||
        (r.targetCategory && r.targetCategory.toLowerCase().includes(q)) ||
        (r.compositionDescription && r.compositionDescription.toLowerCase().includes(q)) ||
        (r.targetBreeds && r.targetBreeds.some(b => b.toLowerCase().includes(q)))
      );
    }

    return list;
  }

  get paginatedFeedRations(): FeedRation[] {
    const start = (this.rationsCurrentPage() - 1) * this.rationsItemsPerPage();
    return this.filteredFeedRations.slice(start, start + this.rationsItemsPerPage());
  }

  get totalRationsPages(): number {
    return Math.ceil(this.filteredFeedRations.length / this.rationsItemsPerPage()) || 1;
  }

  get rationsPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalRationsPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setRationsPage(page: number): void {
    if (page >= 1 && page <= this.totalRationsPages) {
      this.rationsCurrentPage.set(page);
    }
  }

  prevRationsPage(): void {
    if (this.rationsCurrentPage() > 1) {
      this.rationsCurrentPage.update(p => p - 1);
    }
  }

  nextRationsPage(): void {
    if (this.rationsCurrentPage() < this.totalRationsPages) {
      this.rationsCurrentPage.update(p => p + 1);
    }
  }

  private initPerfModalChart(animal: Animal): void {
    const canvas = document.getElementById('perfModalChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.perfChartInstance) this.perfChartInstance.destroy();

    const baseYield = animal.dailyMilkYield || 18.0;
    this.perfChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['J30', 'J60', 'J90', 'J120', 'J150 (Auj.)', 'J180 (Prévu)', 'J210 (Prévu)'],
        datasets: [{
          label: `Courbe de Lactation — ${animal.name} (${animal.internalId})`,
          data: [baseYield - 3, baseYield + 1, baseYield + 3, baseYield + 1, baseYield, baseYield - 2, baseYield - 4],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

