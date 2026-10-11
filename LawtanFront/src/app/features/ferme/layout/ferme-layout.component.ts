import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';

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

  logoError = signal<boolean>(false);
  menuUtilisateurOuvert = signal<boolean>(false);

  toggleMenuUtilisateur(): void {
    this.menuUtilisateurOuvert.update(v => !v);
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
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuUtilisateurOuvert.set(false);
  }
}
