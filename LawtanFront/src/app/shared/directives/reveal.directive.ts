import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RevealService, RevealVariant } from '../services/reveal.service';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input('appReveal') variant: RevealVariant = 'slide-right';
  @Input() stagger: number = 0;
  @Input() staggerIndex?: number;
  @Input() delay: number = 0;
  @Input() revealDelay?: number;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private revealService = inject(RevealService);
  private platformId = inject(PLATFORM_ID);

  private cleanupTimer?: any;

  ngOnInit(): void {
    const nativeEl: HTMLElement = this.el.nativeElement;

    // Variante par d\u00e9faut
    const activeVariant: RevealVariant = this.variant || 'slide-right';
    this.renderer.setAttribute(nativeEl, 'data-reveal', activeVariant);

    const stag = this.staggerIndex !== undefined ? this.staggerIndex : (this.stagger || 0);
    const clampedStagger = Math.min(Math.max(stag, 0), 6);
    this.renderer.setStyle(nativeEl, '--i', clampedStagger.toString());

    const activeDelay = this.revealDelay !== undefined ? this.revealDelay : (this.delay || 0);
    if (activeDelay > 0) {
      this.renderer.setStyle(nativeEl, 'transition-delay', `${activeDelay}ms`);
    }

    // Gestion du d\u00e9coupage mot par mot pour l'accessibilit\u00e9 et l'effet Awwwards
    if (activeVariant === 'words' && isPlatformBrowser(this.platformId)) {
      this.prepareWordsReveal(nativeEl);
    }

    // Enregistrement aupr\u00e8s du RevealService partag\u00e9
    this.revealService.observe(nativeEl, () => {
      this.renderer.addClass(nativeEl, 'is-revealed');

      // Nettoyage de will-change apr\u00e8s la dur\u00e9e d'animation pour \u00e9viter toute charge GPU superflue
      this.cleanupTimer = setTimeout(() => {
        this.renderer.removeStyle(nativeEl, 'will-change');
      }, 950);
    });
  }

  private prepareWordsReveal(element: HTMLElement): void {
    const rawText = element.textContent?.trim() || '';
    if (!rawText) return;

    // Pr\u00e9server l'accessibilit\u00e9 compl\u00e8te pour les lecteurs d'\u00e9cran
    this.renderer.setAttribute(element, 'aria-label', rawText);

    const words = rawText.split(/\s+/);
    element.innerHTML = '';

    words.forEach((word, index) => {
      const wordWrapper = this.renderer.createElement('span');
      this.renderer.addClass(wordWrapper, 'reveal-word');
      this.renderer.setAttribute(wordWrapper, 'aria-hidden', 'true');

      const wordInner = this.renderer.createElement('span');
      this.renderer.addClass(wordInner, 'reveal-word-inner');
      this.renderer.setStyle(wordInner, '--w-i', index.toString());
      this.renderer.setProperty(wordInner, 'textContent', word);

      this.renderer.appendChild(wordWrapper, wordInner);
      this.renderer.appendChild(element, wordWrapper);

      // Espace ins\u00e9cable / classique entre les mots
      if (index < words.length - 1) {
        this.renderer.appendChild(element, document.createTextNode(' '));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }
    this.revealService.unobserve(this.el.nativeElement);
  }
}
