import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FermeMockService, RoleUtilisateur, UtilisateurProfil } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../services/auth.service';

export interface FarmNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-ferme-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './ferme-layout.component.html',
  styleUrl: './ferme-layout.component.css'
})
export class FermeLayoutComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private router = inject(Router);
  private realAuthService = inject(AuthService);

  // Responsive sidebar drawer
  isSidebarOpen = signal<boolean>(false);

  // Topbar dropdowns
  isNotifOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);
  isOffline = signal<boolean>(false);

  // Accordions menus navigation latérale
  isMilkMenuOpen = signal<boolean>(false);
  isTransformationMenuOpen = signal<boolean>(false);
  isFeedMenuOpen = signal<boolean>(false);
  isCommercialMenuOpen = signal<boolean>(false);

  // Sub-tabs actifs
  activeMilkSubTab = signal<'milking' | 'journal' | 'stocks'>('milking');
  activeTransformationSubTab = signal<'batches' | 'recipes' | 'stocks'>('batches');
  activeFeedSubTab = signal<'stocks' | 'rations' | 'distributions' | 'suppliers'>('stocks');
  activeCommercialSubTab = signal<'invoices' | 'customers' | 'payments'>('invoices');

  // Signaux d'état d'erreurs éventuels
  dataLoadErrors = signal<string[]>([]);

  // Suivi de l'URL courante
  currentUrl = signal<string>(this.router.url);

  // Page active déclarée en type string pour supporter tous les cas du template
  activePage = computed<string>(() => {
    const url = this.currentUrl();
    if (url.includes('/dashboard')) return 'dashboard';
    if (url.includes('/troupeau') || url.includes('/cheptel')) return 'animaux';
    if (url.includes('/sante')) return 'sante';
    if (url.includes('/reproduction')) return 'reproduction';
    if (url.includes('/production') || url.includes('/traite')) return 'lait';
    if (url.includes('/alimentation')) return 'alimentation';
    if (url.includes('/commercial')) return 'commercial';
    if (url.includes('/ventes')) return 'ventes';
    if (url.includes('/transformation')) return 'transformation';
    if (url.includes('/tracabilite')) return 'tracabilite';
    if (url.includes('/finance')) return 'finance';
    if (url.includes('/settings')) return 'settings';
    if (url.includes('/administration')) return 'administration';
    return 'dashboard';
  });

  // Proxy authService connecté au service d'authentification réel
  authService = {
    isAuthenticated: () => this.realAuthService.isAuthenticated(),
    currentUser: () => {
      const real = this.realAuthService.currentUser();
      if (real) {
        return {
          name: real.name,
          email: real.email,
          initials: real.initials || 'AS',
          roleLabel: real.roleLabel || real.role,
          roleBadgeColor: real.roleBadgeColor || '#15803d',
          title: real.title || real.roleLabel || 'Exploitant',
          department: real.department || 'Ferme LAWTAN',
          phone: real.phone || '+221 77 123 45 67',
          role: real.role as any
        };
      }
      const p = this.fermeService.profilActif();
      return {
        name: p.nom,
        email: `${p.nom.toLowerCase().replace(/[^a-z0-9]/g, '.')}@lawtan.sn`,
        initials: p.avatar,
        roleLabel: p.roleTitre,
        roleBadgeColor: this.getRoleColor(p.role),
        title: p.roleTitre,
        department: this.getDepartment(p.role),
        phone: '+221 77 845 20 19',
        role: p.role
      };
    },
    hasRole: (roles: string[]) => {
      const real = this.realAuthService.currentUser();
      const current = real ? real.role : this.fermeService.profilActif().role;
      if (current === 'manager') return true;
      return roles.includes(current as any);
    },
    canAccessTab: (tabId: string) => {
      const real = this.realAuthService.currentUser();
      const current = real ? real.role : this.fermeService.profilActif().role;
      if (current === 'manager') return true;
      const perm = this.fermeService.currentPermission().ongletsAutorises;
      if (tabId === 'animaux') return perm.includes('troupeau') || perm.includes('cheptel');
      if (tabId === 'lait' || tabId === 'transformation') return perm.includes('production') || perm.includes('traite');
      if (tabId === 'commercial' || tabId === 'ventes' || tabId === 'finance') return perm.includes('commercial') || perm.includes('ventes');
      return perm.includes(tabId);
    }
  };

  // Compteurs d'entités pour les badges de la sidebar
  animals = computed(() => this.fermeService.animaux());
  dashboardStats = computed(() => ({ healthAlertsCount: this.fermeService.kpiVachesSousAlerte() }));
  milkProductions = computed(() => this.fermeService.traiteAujourdhui().traites);
  transformationBatches = signal<any[]>([1, 2, 3, 4]);
  recipes = signal<any[]>([1, 2, 3]);
  productStocks = signal<any[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  feedStocks = signal<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  feedRations = signal<any[]>([1, 2, 3, 4, 5, 6]);
  feedDistributions = computed(() => this.fermeService.rationsAlimentaires());
  suppliers = signal<any[]>([1, 2, 3, 4, 5]);
  invoices = computed(() => this.fermeService.commandesLait());
  customers = signal<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  payments = signal<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  usersList = computed(() => this.fermeService.profilsDisponibles);

  // Notifications de la ferme
  farmNotifications = signal<FarmNotificationItem[]>([
    {
      id: 'n1',
      title: 'Alerte Sanitaire',
      message: 'Vache F-003 en observation : température 39.4°C.',
      time: 'Il y a 25 min',
      color: '#dc2626'
    },
    {
      id: 'n2',
      title: 'Contrôle Gestation',
      message: 'Échographie J+45 programmée pour 2 femelles.',
      time: 'Aujourd\'hui 09h00',
      color: '#0284c7'
    },
    {
      id: 'n3',
      title: 'Collecte Matinale',
      message: 'Traite du matin validée et transférée vers cuve Bio.',
      time: '06h30',
      color: '#16a34a'
    }
  ]);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
      this.isSidebarOpen.set(false);
      this.isUserMenuOpen.set(false);
      this.isNotifOpen.set(false);
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  toggleNotif(): void {
    this.isNotifOpen.update(v => !v);
  }

  toggleOffline(): void {
    this.isOffline.update(v => !v);
    const msg = this.isOffline() ? 'Mode hors-ligne activé (cache local)' : 'Connexion 4G rétablie';
    this.notificationService.afficherToast(msg);
  }

  toggleMilkMenu(event?: Event): void {
    event?.stopPropagation();
    this.isMilkMenuOpen.update(v => !v);
  }

  toggleTransformationMenu(event?: Event): void {
    event?.stopPropagation();
    this.isTransformationMenuOpen.update(v => !v);
  }

  toggleFeedMenu(event?: Event): void {
    event?.stopPropagation();
    this.isFeedMenuOpen.update(v => !v);
  }

  toggleCommercialMenu(event?: Event): void {
    event?.stopPropagation();
    this.isCommercialMenuOpen.update(v => !v);
  }

  showPage(pageId: string): void {
    this.isSidebarOpen.set(false);
    const routeMap: Record<string, string> = {
      dashboard: '/ferme/dashboard',
      animaux: '/ferme/troupeau',
      troupeau: '/ferme/troupeau',
      sante: '/ferme/sante',
      reproduction: '/ferme/reproduction',
      lait: '/ferme/production',
      production: '/ferme/production',
      transformation: '/ferme/production',
      alimentation: '/ferme/alimentation',
      tracabilite: '/ferme/production',
      ventes: '/ferme/commercial',
      commercial: '/ferme/commercial',
      finance: '/ferme/commercial',
      settings: '/ferme/dashboard',
      administration: '/ferme/dashboard'
    };
    const target = routeMap[pageId] || '/ferme/dashboard';
    this.router.navigate([target]);
  }

  navigateToMilkSubTab(subTab: 'milking' | 'journal' | 'stocks'): void {
    this.activeMilkSubTab.set(subTab);
    this.isMilkMenuOpen.set(true);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/ferme/production'], { queryParams: { tab: subTab } });
  }

  navigateToTransformationSubTab(subTab: 'batches' | 'recipes' | 'stocks'): void {
    this.activeTransformationSubTab.set(subTab);
    this.isTransformationMenuOpen.set(true);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/ferme/production'], { queryParams: { tab: subTab } });
  }

  navigateToFeedSubTab(subTab: 'stocks' | 'rations' | 'distributions' | 'suppliers'): void {
    this.activeFeedSubTab.set(subTab);
    this.isFeedMenuOpen.set(true);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/ferme/alimentation'], { queryParams: { tab: subTab } });
  }

  navigateToCommercialSubTab(subTab: 'invoices' | 'customers' | 'payments'): void {
    this.activeCommercialSubTab.set(subTab);
    this.isCommercialMenuOpen.set(true);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/ferme/commercial'], { queryParams: { tab: subTab } });
  }

  openProfileModal(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  selectionnerRole(profilId: string): void {
    this.fermeService.changerProfil(profilId);
    this.isUserMenuOpen.set(false);
    this.notificationService.afficherToast(`Session active : ${this.fermeService.profilActif().roleTitre}`);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.realAuthService.logout();
    this.router.navigate(['/login']);
  }

  refreshAndSyncAllData(): void {
    this.dataLoadErrors.set([]);
    this.notificationService.afficherToast('Données synchronisées avec succès.');
  }

  private getRoleColor(role: RoleUtilisateur): string {
    switch (role) {
      case 'manager': return '#15803d';
      case 'veterinaire': return '#dc2626';
      case 'bouvier': return '#b45309';
      case 'commercial': return '#0284c7';
      case 'comptable': return '#7c3aed';
      default: return '#16a34a';
    }
  }

  private getDepartment(role: RoleUtilisateur): string {
    switch (role) {
      case 'manager': return 'Direction d\'Exploitation';
      case 'veterinaire': return 'Santé & Reproduction';
      case 'bouvier': return 'Élevage & Conduite Troupeau';
      case 'commercial': return 'Ventes & Distribution';
      case 'comptable': return 'Gestion & Finances';
      default: return 'Ferme LAWTAN';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-menu-container')) {
      this.isUserMenuOpen.set(false);
    }
    if (!target.closest('.icon-action-btn') && !target.closest('.notif-dropdown-box')) {
      this.isNotifOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isSidebarOpen.set(false);
    this.isUserMenuOpen.set(false);
    this.isNotifOpen.set(false);
  }
}
