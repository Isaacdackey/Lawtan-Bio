import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  inject,
  PLATFORM_ID,
  NgZone,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  template: `
    <div class="scroll-progress-wrapper" aria-hidden="true">
      <!-- Ligne de progression dor\u00e9e & verte qui se d\u00e9ploie de gauche \u00e0 droite -->
      <div #progressBar class="progress-bar-fill"></div>

      <!-- Mini vache qui traverse l'\u00e9cran en marchant \u00e0 la t\u00eate de la ligne -->
      <div #miniCow class="mini-cow-runner" [class.is-trotting]="isScrolling">
        <svg
          viewBox="0 0 32 22"
          width="24"
          height="16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Pattes -->
          <g class="mc-leg mc-leg-back"><path d="M8 14 L8 20" stroke="#1E5E3A" stroke-width="1.6" stroke-linecap="round"/></g>
          <g class="mc-leg mc-leg-front"><path d="M22 14 L22 20" stroke="#1E5E3A" stroke-width="1.6" stroke-linecap="round"/></g>
          
          <!-- Corps -->
          <path d="M5 10 C5 8, 9 7, 16 7 C21 7, 24 8, 25 10 C26 12, 24 15, 22 15 C17 15.5, 9 15.5, 6 14 Z" fill="#1E5E3A"/>
          <path d="M10 9 C12 8, 14 10, 13 12 C11 12, 9 11, 10 9 Z" fill="#FAF8F5"/>
          
          <!-- T\u00eate & Corne -->
          <path d="M23 9 C24 8, 26 7, 29 7 C31 7, 32 8.5, 31 10 C30 11.5, 28 12, 26 12 Z" fill="#1E5E3A"/>
          <path d="M26 7 C27 4.5, 28 3.5, 29 3" stroke="#D9A441" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="28.5" cy="8.8" r="0.6" fill="#FFFFFF"/>
          
          <!-- Queue -->
          <path d="M5 11 C4 14, 3 16, 2.5 17.5" stroke="#15442A" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .scroll-progress-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(226, 232, 240, 0.4);
      z-index: 99990;
      pointer-events: none;
    }

    .progress-bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #1E5E3A 0%, #2A7F48 60%, #D9A441 100%);
      transform-origin: left center;
      transform: scaleX(0);
      will-change: transform;
    }

    .mini-cow-runner {
      position: absolute;
      top: -14px;
      left: 0;
      width: 24px;
      height: 16px;
      transform: translate3d(0, 0, 0);
      will-change: transform;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
      transition: opacity 0.3s ease;
    }

    .mini-cow-runner.is-trotting .mc-leg-back {
      animation: mcTrotA 0.3s ease-in-out infinite alternate;
      transform-origin: 8px 14px;
    }

    .mini-cow-runner.is-trotting .mc-leg-front {
      animation: mcTrotB 0.3s ease-in-out infinite alternate;
      transform-origin: 22px 14px;
    }

    @keyframes mcTrotA {
      from { transform: rotate(-18deg); }
      to { transform: rotate(18deg); }
    }

    @keyframes mcTrotB {
      from { transform: rotate(18deg); }
      to { transform: rotate(-18deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .scroll-progress-wrapper {
        display: none !important;
      }
    }
  `]
})
export class ScrollProgressComponent implements OnInit, OnDestroy {
  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef<HTMLElement>;
  @ViewChild('miniCow', { static: true }) miniCow!: ElementRef<HTMLElement>;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private isBrowser = isPlatformBrowser(this.platformId);

  isScrolling = false;
  private scrollTimeout?: any;
  private rafId?: number;

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      const barEl = this.progressBar.nativeElement;
      const cowEl = this.miniCow.nativeElement;

      const updateProgress = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;

        barEl.style.transform = `scaleX(${progress})`;
        const screenWidth = window.innerWidth;
        const cowX = Math.max(0, Math.min(progress * (screenWidth - 28), screenWidth - 28));
        cowEl.style.transform = `translate3d(${cowX}px, 0, 0)`;
      };

      const onScroll = () => {
        if (!this.isScrolling) {
          this.isScrolling = true;
        }

        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.isScrolling = false;
        }, 150);

        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(updateProgress);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      updateProgress();
    });
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
