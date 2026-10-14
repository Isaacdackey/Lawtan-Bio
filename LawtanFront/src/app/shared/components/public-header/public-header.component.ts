import { Component, Input, HostListener, HostBinding, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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

  isScrolled = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  @HostBinding('class.menu-open')
  get isMenuOpenClass(): boolean {
    return this.isMobileMenuOpen();
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeMobileMenu();

    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?');
    if (isHome) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      });
    }
  }

  scrollToSection(id: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeMobileMenu();

    const executeScroll = (): boolean => {
      const el = document.getElementById(id);
      if (el) {
        const header = document.querySelector('.public-navbar');
        const headerHeight = (header?.clientHeight || 64) + 8;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const targetPos = Math.max(0, el.getBoundingClientRect().top + scrollTop - headerHeight);
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
        return true;
      }
      return false;
    };

    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?');

    if (isHome) {
      // Décalage pour laisser le menu mobile se fermer et déverrouiller le défilement tactile
      setTimeout(() => {
        if (!executeScroll()) {
          setTimeout(executeScroll, 100);
        }
      }, 70);
    } else {
      this.router.navigate(['/'], { fragment: id }).then(() => {
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if (executeScroll() || attempts > 25) {
            clearInterval(checkInterval);
          }
        }, 50);
      });
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

