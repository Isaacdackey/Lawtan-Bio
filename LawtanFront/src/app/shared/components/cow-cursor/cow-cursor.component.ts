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
  selector: 'app-cow-cursor',
  standalone: true,
  template: `
    <div
      #cursorContainer
      class="cow-cursor-container"
      [attr.data-state]="cursorState"
      [class.is-visible]="isVisible"
      [class.is-walking]="isWalking"
      aria-hidden="true"
    >
      <!-- Halo d'action au survol de liens et boutons -->
      <div class="cow-halo"></div>


      <!-- Silhouette SVG Vache Pastorale Noble de profil -->
      <svg
        class="cow-svg"
        viewBox="0 0 48 34"
        width="44"
        height="31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Queue avec touffe pastorale -->
        <g class="cow-tail-group">
          <path
            d="M8 17 C6 21, 5 25, 4 27"
            stroke="#15442A"
            stroke-width="1.6"
            stroke-linecap="round"
          />
          <path
            d="M4 27 C3.5 28.5, 4 29.5, 5 29 C5.5 28.2, 5 27.5, 4 27"
            fill="#D9A441"
          />
        </g>

        <!-- Patte arri\u00e8re droite (plan arri\u00e8re) -->
        <g class="leg-group leg-back-right">
          <path d="M12 21 L12 30 L10 30" stroke="#0F3820" stroke-width="2" stroke-linecap="round"/>
          <rect x="9.5" y="29.5" width="3" height="2" rx="0.5" fill="#1e293b"/>
        </g>

        <!-- Patte avant droite (plan arri\u00e8re) -->
        <g class="leg-group leg-front-right">
          <path d="M28 21 L29 30 L27 30" stroke="#0F3820" stroke-width="2" stroke-linecap="round"/>
          <rect x="26.5" y="29.5" width="3" height="2" rx="0.5" fill="#1e293b"/>
        </g>

        <!-- Corps / Flanc noble de la vache (Montb\u00e9liarde x Guzer\u00e1) -->
        <path
          class="cow-body"
          d="M8 15 C8 12, 13 11, 22 11 C28 11, 33 12, 35 15 C36 17, 34 22, 31 22 C25 23, 14 23, 9 21 C8 19, 8 16, 8 15 Z"
          fill="#1E5E3A"
        />

        <!-- Tache laiti\u00e8re cr\u00e8me naturelle sur le flanc -->
        <path
          d="M14 13 C17 12, 19 14, 18 17 C17 19, 13 18, 12 16 C12 14, 13 13, 14 13 Z"
          fill="#FAF8F5"
        />
        <path
          d="M24 12 C26 13, 27 15, 25 17 C23 17, 22 15, 23 13 Z"
          fill="#FAF8F5"
        />

        <!-- Patte arri\u00e8re gauche (plan avant) -->
        <g class="leg-group leg-back-left">
          <path d="M15 21 L15 31 L13 31" stroke="#1E5E3A" stroke-width="2.2" stroke-linecap="round"/>
          <rect x="12.5" y="30.5" width="3" height="2" rx="0.5" fill="#0F172A"/>
        </g>

        <!-- Patte avant gauche (plan avant) -->
        <g class="leg-group leg-front-left">
          <path d="M31 21 L31 31 L29 31" stroke="#1E5E3A" stroke-width="2.2" stroke-linecap="round"/>
          <rect x="28.5" y="30.5" width="3" height="2" rx="0.5" fill="#0F172A"/>
        </g>

        <!-- Cou & T\u00eate -->
        <path
          d="M33 14 C35 12, 38 10, 42 10 C45 10, 47 12, 46 15 C45 17, 41 18, 38 18 C35 18, 33 16, 33 14 Z"
          fill="#1E5E3A"
        />

        <!-- Museau doux -->
        <path
          d="M44 12 C46 12.5, 47 13.5, 46 15 C45 16, 43 16, 42 15 Z"
          fill="#FDE68A"
        />
        <circle cx="44.2" cy="13.8" r="0.6" fill="#15442A"/>

        <!-- \u0152il vif et bienveillant -->
        <circle cx="40" cy="12.5" r="1.1" fill="#FFFFFF"/>
        <circle cx="40.3" cy="12.5" r="0.65" fill="#0F172A"/>

        <!-- Corne arqu\u00e9e d'\u00e9lite Guzer\u00e1 dor\u00e9e -->
        <path
          class="cow-horn"
          d="M37 11 C38 7, 40 5, 41 4 C40 6, 39 8, 38 11 Z"
          fill="#D9A441"
        />

        <!-- Oreille mobile -->
        <g class="cow-ear">
          <path
            d="M36 12 C34 11, 33 13, 34 14 C35 14.5, 36 13.5, 36 12 Z"
            fill="#FAF8F5"
          />
        </g>

        <!-- Collier de terroir & cloche dor\u00e9e -->
        <path d="M36 14 L35 18" stroke="#D9A441" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M34 18 L36 18 L35.5 20 L34.5 20 Z" fill="#D9A441"/>
      </svg>
    </div>
  `,
  styleUrls: ['./cow-cursor.component.css']
})
export class CowCursorComponent implements OnInit, OnDestroy {
  @ViewChild('cursorContainer', { static: true }) cursorContainer!: ElementRef<HTMLElement>;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  cursorState: 'default' | 'action' | 'text' | 'field' | 'press' | 'disabled' = 'default';
  isVisible = false;
  isWalking = false;

  private isBrowser = isPlatformBrowser(this.platformId);
  private rafId?: number;
  private pointerDownListener?: (e: PointerEvent) => void;
  private meehVariations = ['Meeh !', 'Meeh !', 'Mêêê !', 'Meeh !', 'Meeeh !'];
  private meehCount = 0;

  // Coordonn\u00e9es et interpolation (lerp)
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private facingDirection = 1; // +1 droite, -1 gauche
  private currentTilt = 0;
  private isFinePointer = false;

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Déclenchement de la bulle 'Meeh !' absolument PARTOUT au clic / tap
    this.pointerDownListener = (e: PointerEvent) => {
      if (e.clientX !== undefined && e.clientY !== undefined) {
        this.spawnMeehParticle(e.clientX, e.clientY);
      }
    };
    window.addEventListener('pointerdown', this.pointerDownListener, { capture: true, passive: true });

    // V\u00e9rification stricte : pointeur fin uniquement (pas de mobile/tactile) et respect de l'accessibilit\u00e9
    const matchMediaFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const matchReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!matchMediaFine.matches || matchReducedMotion.matches) {
      return;
    }

    this.isFinePointer = true;
    document.documentElement.classList.add('cow-cursor-active');

    // Ex\u00e9cution compl\u00e8tement hors de la zone Angular pour garantir 60 FPS purs
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
    if (this.isBrowser) {
      if (this.pointerDownListener) {
        window.removeEventListener('pointerdown', this.pointerDownListener, { capture: true } as any);
      }
      document.documentElement.classList.remove('cow-cursor-active');
    }
  }
}
