import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.css'
})
export class PublicFooterComponent {
  currentYear = new Date().getFullYear();
  private router = inject(Router);

  onHomeClick(event?: Event): void {
    const isHome = this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url.startsWith('/?') || this.router.url === '';
    if (isHome) {
      if (event) {
        event.preventDefault();
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } else {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('no-view-transition');
        setTimeout(() => {
          document.documentElement.classList.remove('no-view-transition');
        }, 800);
      }
    }
  }
}
