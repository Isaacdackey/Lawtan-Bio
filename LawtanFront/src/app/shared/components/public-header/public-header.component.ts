import { Component, Input, HostListener, HostBinding, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.css'
})
export class PublicHeaderComponent {
  @Input() activePage: string = 'accueil';

  private router = inject(Router);
  cartService = inject(CartService);
  themeService = inject(ThemeService);

  isScrolled = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  @HostBinding('class.menu-open')
  get isMenuOpenClass(): boolean {
    return this.isMobileMenuOpen();
  }

  openCart(): void {
    this.closeMobileMenu();
    if (!this.router.url.includes('/boutique')) {
      this.router.navigate(['/boutique']).then(() => {
        this.cartService.openCartDrawer();
      });
    } else {
      this.cartService.toggleCartDrawer();
    }
  }

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.isMobileMenuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 25);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    }
  }

  onHomeClick(event?: Event): void {
    this.closeMobileMenu();

    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?') || this.router.url === '';
    if (isHome) {
      if (event) {
        event.preventDefault();
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }

  scrollToSection(id: string, event?: Event): void {
    this.closeMobileMenu();

    const executeScroll = (): boolean => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?') || this.router.url === '';

    if (isHome) {
      if (event) {
        event.preventDefault();
      }
      setTimeout(() => {
        if (!executeScroll()) {
          setTimeout(executeScroll, 100);
        }
      }, 70);
    } else {
      // Sur une autre page, laisser Angular Router naviguer vers /#id grâce à routerLink, avec vérification de secours
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (executeScroll() || attempts > 25) {
          clearInterval(interval);
        }
      }, 80);
    }
  }

  navTo(fragmentOrPath: string): void {
    if (fragmentOrPath.startsWith('/')) {
      this.closeMobileMenu();
      this.router.navigate([fragmentOrPath]);
    } else if (fragmentOrPath === 'accueil' || fragmentOrPath === 'top') {
      this.onHomeClick();
    } else {
      this.scrollToSection(fragmentOrPath);
    }
  }
}

