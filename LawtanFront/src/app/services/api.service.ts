import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { Animal } from '../models/animal.model';
import { HealthRecord, VaccineSchedule } from '../models/health.model';
import { MilkProduction, DashboardStats, TankStatus, MilkHistory, MilkStockAllocation, MilkPricing } from '../models/milk.model';
import { ReproductionEvent, ReproductionAlert } from '../models/reproduction.model';
import { Recipe, TransformationBatch, ProductStock, TransformationSummary } from '../models/transformation.model';
import { Customer, SaleInvoice, PaymentTransaction, CommercialSummary, CustomerType, InvoiceStatus } from '../models/commercial.model';
import { FeedStock, FeedRation, FeedDistribution, SolarTelemetry } from '../models/feed-solar.model';
import { Supplier } from '../models/supplier.model';
import { FinanceSummary } from '../models/finance.model';
import { TraceabilityLot } from '../models/traceability.model';
import { resolveApiBaseUrl } from './api-url';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // État de connexion au backend en temps réel
  isBackendConnected = signal<boolean>(true);
  connectionStatus = signal<'connected' | 'offline' | 'checking'>('checking');
  lastPingTime = signal<string>('');

  // Détection dynamique : localhost en dev, Render en production sur Vercel
  get baseUrl(): string {
    return resolveApiBaseUrl();
  }

  private trackSuccess<T>() {
    return tap<T>({
      next: () => {
        this.isBackendConnected.set(true);
        this.connectionStatus.set('connected');
        this.lastPingTime.set(new Date().toLocaleTimeString('fr-FR'));
      }
    });
  }

  private trackError<T>() {
    return catchError<T, Observable<T>>((err) => {
      this.isBackendConnected.set(false);
      this.connectionStatus.set('offline');
      console.warn('[ApiService] Erreur réseau / backend indisponible :', err.message || err);
      return throwError(() => err);
    });
  }

  // --- Health Check / Ping ---
  checkBackendHealth(): Observable<boolean> {
    this.connectionStatus.set('checking');
    return this.http.get(`${this.baseUrl}/animals`).pipe(
      map(() => {
        this.isBackendConnected.set(true);
        this.connectionStatus.set('connected');
        this.lastPingTime.set(new Date().toLocaleTimeString('fr-FR'));
        return true;
      }),
      catchError(() => {
        this.isBackendConnected.set(false);
        this.connectionStatus.set('offline');
        return of(false);
      })
    );
  }

  // --- Dashboard ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Animals ---
  getAllAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.baseUrl}/animals`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getAnimalById(internalId: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.baseUrl}/animals/${internalId}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(`${this.baseUrl}/animals`, animal).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateAnimal(internalId: string, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.baseUrl}/animals/${internalId}`, animal).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteAnimal(internalId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/animals/${internalId}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Health ---
  getAllHealthRecords(): Observable<HealthRecord[]> {
    return this.http.get<HealthRecord[]>(`${this.baseUrl}/health/records`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createHealthRecord(record: HealthRecord): Observable<HealthRecord> {
    return this.http.post<HealthRecord>(`${this.baseUrl}/health/records`, record).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateHealthRecord(id: number, record: HealthRecord): Observable<HealthRecord> {
    return this.http.put<HealthRecord>(`${this.baseUrl}/health/records/${id}`, record).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteHealthRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/health/records/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getAllVaccines(): Observable<VaccineSchedule[]> {
    return this.http.get<VaccineSchedule[]>(`${this.baseUrl}/health/vaccines`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createVaccine(schedule: VaccineSchedule): Observable<VaccineSchedule> {
    return this.http.post<VaccineSchedule>(`${this.baseUrl}/health/vaccines`, schedule).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Reproduction ---
  getAllReproEvents(): Observable<ReproductionEvent[]> {
    return this.http.get<ReproductionEvent[]>(`${this.baseUrl}/reproduction`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getReproByAnimal(animalId: number): Observable<ReproductionEvent[]> {
    return this.http.get<ReproductionEvent[]>(`${this.baseUrl}/reproduction/by-animal/${animalId}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  recordReproEvent(event: ReproductionEvent): Observable<ReproductionEvent> {
    return this.http.post<ReproductionEvent>(`${this.baseUrl}/reproduction/record`, event).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateReproEvent(id: number, event: ReproductionEvent): Observable<ReproductionEvent> {
    return this.http.put<ReproductionEvent>(`${this.baseUrl}/reproduction/${id}`, event).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteReproEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reproduction/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getReproAlerts(): Observable<ReproductionAlert[]> {
    return this.http.get<ReproductionAlert[]>(`${this.baseUrl}/reproduction/alerts`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  recalculateReproMetrics(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reproduction/recalculate`, {}).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Milk Production & Tank ---
  getProductionsByDate(date?: string): Observable<MilkProduction[]> {
    const url = date ? `${this.baseUrl}/milk/by-date?date=${date}` : `${this.baseUrl}/milk/by-date`;
    return this.http.get<MilkProduction[]>(url).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  recordMilk(production: MilkProduction): Observable<MilkProduction> {
    return this.http.post<MilkProduction>(`${this.baseUrl}/milk/record`, production).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getTankStatus(): Observable<TankStatus> {
    return this.http.get<TankStatus>(`${this.baseUrl}/milk/tank-status`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getAllMilkProductions(): Observable<MilkProduction[]> {
    return this.http.get<MilkProduction[]>(`${this.baseUrl}/milk`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getMilkHistory(days: number = 7): Observable<MilkHistory[]> {
    return this.http.get<MilkHistory[]>(`${this.baseUrl}/milk/history?days=${days}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // ==========================================
  // SPRINT 3: TRANSFORMATION, RECIPES & STOCKS
  // ==========================================

  // --- Recipes ---
  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/recipes`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.baseUrl}/recipes`, recipe).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateRecipe(id: number, recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.baseUrl}/recipes/${id}`, recipe).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Transformation Batches ---
  getAllBatches(): Observable<TransformationBatch[]> {
    return this.http.get<TransformationBatch[]>(`${this.baseUrl}/transformations/batches`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  launchBatch(batch: TransformationBatch): Observable<TransformationBatch> {
    return this.http.post<TransformationBatch>(`${this.baseUrl}/transformations/batches`, batch).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  completeBatch(id: number, data: { actualQuantityProduced: number; wasteLossQuantity?: number; qualityNotes?: string; phLevel?: number }): Observable<TransformationBatch> {
    return this.http.post<TransformationBatch>(`${this.baseUrl}/transformations/batches/${id}/complete`, data).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateBatch(id: number, batch: TransformationBatch): Observable<TransformationBatch> {
    return this.http.put<TransformationBatch>(`${this.baseUrl}/transformations/batches/${id}`, batch).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transformations/batches/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getTransformationSummary(): Observable<TransformationSummary> {
    return this.http.get<TransformationSummary>(`${this.baseUrl}/transformations/summary`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Stocks ---
  getAllStocks(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(`${this.baseUrl}/stocks`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createOrUpdateStock(stock: ProductStock): Observable<ProductStock> {
    return this.http.post<ProductStock>(`${this.baseUrl}/stocks`, stock).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stocks/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // ==========================================
  // SPRINT 4: COMMERCIAL, INVOICES & PAYMENTS
  // ==========================================

  // --- Customers ---
  getAllCustomers(type?: CustomerType): Observable<Customer[]> {
    const url = type ? `${this.baseUrl}/customers?type=${type}` : `${this.baseUrl}/customers`;
    return this.http.get<Customer[]>(url).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/customers/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, customer).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, customer).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Invoices ---
  getAllInvoices(status?: InvoiceStatus, customerId?: number): Observable<SaleInvoice[]> {
    let url = `${this.baseUrl}/invoices`;
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (customerId) params.push(`customerId=${customerId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<SaleInvoice[]>(url).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getInvoiceById(id: number): Observable<SaleInvoice> {
    return this.http.get<SaleInvoice>(`${this.baseUrl}/invoices/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createInvoice(invoice: SaleInvoice): Observable<SaleInvoice> {
    return this.http.post<SaleInvoice>(`${this.baseUrl}/invoices`, invoice).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  recordInvoicePayment(invoiceId: number, payment: PaymentTransaction): Observable<SaleInvoice> {
    return this.http.post<SaleInvoice>(`${this.baseUrl}/invoices/${invoiceId}/pay`, payment).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateInvoiceStatus(id: number, status: InvoiceStatus): Observable<SaleInvoice> {
    return this.http.patch<SaleInvoice>(`${this.baseUrl}/invoices/${id}/status?status=${status}`, {}).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Payments ---
  getAllPayments(invoiceId?: number, customerId?: number): Observable<PaymentTransaction[]> {
    let url = `${this.baseUrl}/payments`;
    const params: string[] = [];
    if (invoiceId) params.push(`invoiceId=${invoiceId}`);
    if (customerId) params.push(`customerId=${customerId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<PaymentTransaction[]>(url).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Commercial Summary ---
  getCommercialSummary(): Observable<CommercialSummary> {
    return this.http.get<CommercialSummary>(`${this.baseUrl}/commercial/summary`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // ==========================================
  // SPRINT 5: FEED, RATIONS & SOLAR TELEMETRY
  // ==========================================

  // --- Feed Stocks ---
  getAllFeedStocks(): Observable<FeedStock[]> {
    return this.http.get<FeedStock[]>(`${this.baseUrl}/feed/stocks`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateFeedStockQuantity(id: number, currentStockKg: number): Observable<FeedStock> {
    return this.http.patch<FeedStock>(`${this.baseUrl}/feed/stocks/${id}/quantity`, { currentStockKg }).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createFeedStock(feed: FeedStock): Observable<FeedStock> {
    return this.http.post<FeedStock>(`${this.baseUrl}/feed/stocks`, feed).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteFeedStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feed/stocks/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Feed Rations ---
  getAllFeedRations(): Observable<FeedRation[]> {
    return this.http.get<FeedRation[]>(`${this.baseUrl}/feed/rations`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createFeedRation(ration: FeedRation): Observable<FeedRation> {
    return this.http.post<FeedRation>(`${this.baseUrl}/feed/rations`, ration).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateFeedRation(id: number, ration: FeedRation): Observable<FeedRation> {
    return this.http.put<FeedRation>(`${this.baseUrl}/feed/rations/${id}`, ration).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteFeedRation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feed/rations/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Feed Distributions ---
  getAllFeedDistributions(): Observable<FeedDistribution[]> {
    return this.http.get<FeedDistribution[]>(`${this.baseUrl}/feed/distributions`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  recordFeedDistribution(distribution: FeedDistribution): Observable<FeedDistribution> {
    return this.http.post<FeedDistribution>(`${this.baseUrl}/feed/distributions`, distribution).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteFeedDistribution(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feed/distributions/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  clearAllFeedDistributions(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feed/distributions`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Solar Telemetry ---
  getSolarTelemetry(): Observable<SolarTelemetry> {
    return this.http.get<SolarTelemetry>(`${this.baseUrl}/solar/telemetry`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // ==========================================
  // FOURNISSEURS & APPROVISIONNEMENTS
  // ==========================================
  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/suppliers/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers/search?query=${encodeURIComponent(query)}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/suppliers`, supplier).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/suppliers/${id}`, supplier).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/suppliers/${id}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Finance (calculs réels : factures, soins, alimentation) ---
  getFinanceSummary(from?: string, to?: string): Observable<FinanceSummary> {
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<FinanceSummary>(`${this.baseUrl}/finance/summary${query}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Traçabilité des lots (dérivée des ordres de fabrication) ---
  getTraceabilityLots(): Observable<TraceabilityLot[]> {
    return this.http.get<TraceabilityLot[]>(`${this.baseUrl}/traceability/lots`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  getTraceabilityLot(lotNumber: string): Observable<TraceabilityLot> {
    return this.http.get<TraceabilityLot>(`${this.baseUrl}/traceability/lots/${encodeURIComponent(lotNumber)}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Ventilation journaliere du lait (persistee en base) ---
  getMilkAllocation(date?: string): Observable<MilkStockAllocation> {
    const query = date ? `?date=${date}` : '';
    return this.http.get<MilkStockAllocation>(`${this.baseUrl}/milk/allocation${query}`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  saveMilkAllocation(allocation: Partial<MilkStockAllocation>): Observable<MilkStockAllocation> {
    return this.http.put<MilkStockAllocation>(`${this.baseUrl}/milk/allocation`, allocation).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  recordDirectSaleMilkConsumption(liters: number): Observable<MilkStockAllocation> {
    return this.http.post<MilkStockAllocation>(
      `${this.baseUrl}/milk/allocation/direct-sale-consumption`, { liters }
    ).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  // --- Tarif de vente du lait cru au litre ---
  getMilkPricing(): Observable<MilkPricing> {
    return this.http.get<MilkPricing>(`${this.baseUrl}/milk/price`).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }

  updateMilkPricing(pricing: MilkPricing): Observable<MilkPricing> {
    return this.http.put<MilkPricing>(`${this.baseUrl}/milk/price`, pricing).pipe(
      this.trackSuccess(),
      this.trackError()
    );
  }
}
