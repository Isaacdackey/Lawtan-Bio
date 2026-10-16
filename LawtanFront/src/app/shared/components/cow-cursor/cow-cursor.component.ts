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
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cow-cursor',
  standalone: true,
  template: `
    <div
      #cursorContainer
      class="cow-cursor-container"
      [class.is-disabled]="isInFerme"
      [attr.data-state]="cursorState"
      [class.is-visible]="isVisible && !isInFerme"
      [class.is-walking]="isWalking"
      aria-hidden="true"
    >
      <!-- Halo d'action au survol de liens et boutons -->
      <div class="cow-halo"></div>


      <!-- Silhouette Zébu Bleu Laitier 36px -->
      <img
        src="/zebu-curseur-bleu-48.png"
        alt=""
        class="cow-zebu-img"
        width="36"
        height="36"
      />
    </div>
  `,
  styleUrls: ['./cow-cursor.component.css']
})
export class CowCursorComponent implements OnInit, OnDestroy {
  @ViewChild('cursorContainer', { static: true }) cursorContainer!: ElementRef<HTMLElement>;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private router = inject(Router, { optional: true });

  cursorState: 'default' | 'action' | 'text' | 'field' | 'press' | 'disabled' = 'default';
  isVisible = false;
  isWalking = false;
  isInFerme = false;

  private isBrowser = isPlatformBrowser(this.platformId);
  private rafId?: number;
  private routeSub?: Subscription;
  private pointerDownListener?: (e: PointerEvent) => void;
  private meehVariations = ['Meeh !', 'Meeh !', 'Mêêê !', 'Meeh !', 'Meeeh !'];
  private meehCount = 0;

  // Coordonnées et interpolation (lerp)
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private facingDirection = 1; // +1 droite, -1 gauche
  private currentTilt = 0;
  private isFinePointer = false;

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const checkRoute = (url: string) => {
      this.isInFerme = url.includes('/ferme');
      if (this.isInFerme) {
        document.documentElement.classList.remove('cow-cursor-active');
        this.isVisible = false;
      } else if (this.isFinePointer) {
        document.documentElement.classList.add('cow-cursor-active');
      }
    };

    if (this.router) {
      checkRoute(this.router.url);
      this.routeSub = this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          checkRoute(event.urlAfterRedirects || event.url);
        });
    } else if (typeof window !== 'undefined') {
      checkRoute(window.location.pathname);
    }

    // Déclenchement de la bulle 'Meeh !' uniquement sur le site public
    this.pointerDownListener = (e: PointerEvent) => {
      if (this.isInFerme) return;
      if (e.clientX !== undefined && e.clientY !== undefined) {
        this.spawnMeehParticle(e.clientX, e.clientY);
      }
    };
    window.addEventListener('pointerdown', this.pointerDownListener, { capture: true, passive: true });

    // Vérification stricte : pointeur fin uniquement (pas de mobile/tactile) et respect de l'accessibilité
    const matchMediaFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const matchReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!matchMediaFine.matches || matchReducedMotion.matches) {
      return;
    }

    this.isFinePointer = true;
    if (!this.isInFerme) {
      document.documentElement.classList.add('cow-cursor-active');
    }

    // Exécution complètement hors de la zone Angular pour garantir 60 FPS purs
    this.ngZone.runOutsideAngular(() => {
      this.bindMouseEvents();
      this.startAnimationLoop();
    });
  }

  private bindMouseEvents(): void {
    const updateTargetState = (target: HTMLElement | null) => {
      if (!target) return;

      // Détection des champs formulaires (curseur natif restauré)
      if (
        target.matches('input, textarea, select, [contenteditable="true"]') ||
        target.closest('input, textarea, select')
      ) {
        this.cursorState = 'field';
        return;
      }

      // Détection des actions (boutons, liens, onglets)
      if (
        target.matches('a, button, [role="button"], input[type="submit"], .atab-btn, .mfilter-btn, .nature-card, .faq-header') ||
        target.closest('a, button, [role="button"], .atab-btn, .mfilter-btn, .nature-card, .faq-header')
      ) {
        this.cursorState = 'action';
        return;
      }

      // Détection du texte de lecture dense
      if (target.matches('p, h1, h2, h3, h4, span, li, blockquote') && !target.closest('a, button')) {
        this.cursorState = 'text';
        return;
      }

      this.cursorState = 'default';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (this.isInFerme) {
        if (this.isVisible) this.isVisible = false;
        return;
      }
      if (!this.isVisible) {
        this.isVisible = true;
        this.currentX = e.clientX;
        this.currentY = e.clientY;
      }
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      updateTargetState(e.target as HTMLElement | null);
    };

    const onMouseLeave = () => {
      this.isVisible = false;
    };

    const onMouseOver = (e: MouseEvent) => {
      updateTargetState(e.target as HTMLElement | null);
    };

    const onMouseDown = () => {
      if (this.cursorState !== 'field') {
        const el = this.cursorContainer.nativeElement;
        el.classList.add('is-pressed');
      }
    };

    const onMouseUp = () => {
      const el = this.cursorContainer.nativeElement;
      el.classList.remove('is-pressed');
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
  }

  private spawnMeehParticle(x: number, y: number): void {
    if (!this.isBrowser || (x === 0 && y === 0)) return;

    const text = this.meehVariations[this.meehCount % this.meehVariations.length];
    this.meehCount++;

    const particle = document.createElement('div');
    particle.className = 'click-meeh-particle';
    particle.textContent = text;

    // Décalage naturel subtil (-6px à +6px, rotation -4deg à +4deg)
    const randomOffset = Math.random() * 12 - 6;
    const randomRot = (Math.random() * 8 - 4).toFixed(1);

    particle.style.left = `${x + randomOffset}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--meeh-rot', `${randomRot}deg`);

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 750);
  }

  private startAnimationLoop(): void {
    const el = this.cursorContainer.nativeElement;
    const lerp = 0.18;

    const tick = () => {
      // Calcul du d\u00e9placement interpol\u00e9
      const dx = this.targetX - this.currentX;
      const dy = this.targetY - this.currentY;
      const dist = Math.hypot(dx, dy);

      this.currentX += dx * lerp;
      this.currentY += dy * lerp;

      // Hyst\u00e9r\u00e9sis d'orientation horizontale : orienter la vache selon le sens de marche
      if (dx > 1.2) {
        this.facingDirection = 1; // Droite (sens de lecture de r\u00e9f\u00e9rence)
      } else if (dx < -1.2) {
        this.facingDirection = -1; // Gauche
      }

      // Inclinaison fluide clamp\u00e9e \u00e0 \u00b110\u00b0 selon la v\u00e9locit\u00e9
      const targetTilt = Math.max(Math.min((dx * 0.4), 10), -10);
      this.currentTilt += (targetTilt - this.currentTilt) * 0.15;

      // \u00c9tat de marche : si la vitesse d\u00e9passe 1.4px
      const isCurrentlyMoving = dist > 1.4;
      if (this.isWalking !== isCurrentlyMoving) {
        this.isWalking = isCurrentlyMoving;
      }

      // Positionnement via transform3d EXCLUSIVEMENT (aucun reflow/repaint)
      el.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) scaleX(${this.facingDirection}) rotate(${this.currentTilt * this.facingDirection}deg)`;

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.isBrowser) {
      if (this.pointerDownListener) {
        window.removeEventListener('pointerdown', this.pointerDownListener, { capture: true } as any);
      }
      document.documentElement.classList.remove('cow-cursor-active');
    }
  }
}
