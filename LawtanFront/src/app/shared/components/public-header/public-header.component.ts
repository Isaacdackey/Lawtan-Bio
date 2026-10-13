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
  }

  onHomeClick(event?: Event): void {
    this.closeMobileMenu();
    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?');
    if (isHome) {
      if (event) {
        event.preventDefault();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50);
      });
    }
  }

  scrollToSection(id: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.closeMobileMenu();

    const executeScroll = (): boolean => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const header = document.querySelector('.public-navbar');
        const headerHeight = (header?.clientHeight || 68) + 12;
        const targetPos = el.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: Math.max(0, targetPos),
          behavior: 'smooth'
        });
        return true;
      }
      return false;
    };

    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?');

    if (isHome) {
      if (!executeScroll()) {
        setTimeout(executeScroll, 60);
      }
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

