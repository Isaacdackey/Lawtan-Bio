import { Injectable, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type RevealVariant = 'slide-right' | 'wipe-right' | 'fade' | 'words';

@Injectable({
  providedIn: 'root'
})
export class RevealService {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  private observer?: IntersectionObserver;
  private callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>();
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser && typeof IntersectionObserver !== 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const cb = this.callbacks.get(entry.target);
                if (cb) {
                  this.ngZone.run(() => cb(entry));
                  this.unobserve(entry.target);
                }
              }
            });
          },
          {
            root: null,
            rootMargin: '0px 0px 80px 0px',
            threshold: 0
          }
        );
      });
    }
  }

  observe(element: Element, callback: (entry: IntersectionObserverEntry) => void): void {
    if (!this.isBrowser || !this.observer) {
      // Fallback imm\u00e9diat sans observer / en environnement SSR
      callback({
        isIntersecting: true,
        target: element
      } as unknown as IntersectionObserverEntry);
      return;
    }

    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.callbacks.delete(element);
  }
}
