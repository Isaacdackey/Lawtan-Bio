import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface FarmNavModule {
  id: string;
  titre: string;
  route: string;
  permissionKey: string;
}

@Component({
  selector: 'app-ferme-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './ferme-layout.component.html',
  styleUrl: './ferme-layout.component.css'
})
export class FermeLayoutComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  logoError = signal<boolean>(false);
  menuUtilisateurOuvert = signal<boolean>(false);
  menuMobileModuleOuvert = signal<boolean>(false);

  currentUrl = signal<string>(this.router.url);

  readonly modulesFerme: FarmNavModule[] = [
    { id: 'dashboard', titre: 'Tableau de bord', route: '/ferme/dashboard', permissionKey: 'dashboard' },
    { id: 'troupeau', titre: 'Troupeau & Cheptel', route: '/ferme/troupeau', permissionKey: 'troupeau' },
    { id: 'production', titre: 'Production & Traite', route: '/ferme/production', permissionKey: 'production' },
    { id: 'sante', titre: 'Santé Vétérinaire', route: '/ferme/sante', permissionKey: 'sante' },
    { id: 'alimentation', titre: 'Alimentation & Fourrage', route: '/ferme/alimentation', permissionKey: 'alimentation' },
    { id: 'commercial', titre: 'Commercialisation & Ventes', route: '/ferme/commercial', permissionKey: 'commercial' },
    { id: 'reproduction', titre: 'Reproduction & Vêlage', route: '/ferme/reproduction', permissionKey: 'reproduction' }
  ];

  modulesAutorises = computed(() => {
    const perm = this.fermeService.currentPermission().ongletsAutorises;
    return this.modulesFerme.filter(m => {
      if (m.id === 'troupeau') return perm.includes('troupeau') || perm.includes('cheptel');
      if (m.id === 'production') return perm.includes('production') || perm.includes('traite');
      if (m.id === 'commercial') return perm.includes('commercial') || perm.includes('ventes');
      return perm.includes(m.permissionKey);
    });
  });

  moduleActif = computed(() => {
    const url = this.currentUrl();
    const found = this.modulesFerme.find(m => url.includes(m.id));
    return found || this.modulesFerme[0];
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
      this.menuMobileModuleOuvert.set(false);
    });
  }

  toggleMenuUtilisateur(): void {
    this.menuUtilisateurOuvert.update(v => !v);
  }

  toggleMenuMobileModule(): void {
    this.menuMobileModuleOuvert.update(v => !v);
  }

  fermerMenuMobile(): void {
    this.menuMobileModuleOuvert.set(false);
  }

  selectionnerRole(profilId: string): void {
    this.fermeService.changerProfil(profilId);
    this.menuUtilisateurOuvert.set(false);
    this.notificationService.afficherToast(`Vue changée en : ${this.fermeService.profilActif().roleTitre}`);
  }

  onLogoError(): void {
    this.logoError.set(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) {
      this.menuUtilisateurOuvert.set(false);
    }
    if (!target.closest('.mobile-module-selector')) {
      this.menuMobileModuleOuvert.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuUtilisateurOuvert.set(false);
    this.menuMobileModuleOuvert.set(false);
  }
}
