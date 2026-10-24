import { Injectable, signal, computed, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'lawtan-theme';
  private hasExplicitUserChoice = false;

  // Signal principal du thème
  readonly theme = signal<AppTheme>(this.getInitialTheme());

  // Signal calculé booléen
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Appliquer les effets DOM (classe body, colorScheme, meta theme-color)
    effect(() => {
      this.applyThemeToDom(this.theme() === 'dark');
    });

    // Suivre prefers-color-scheme tant que l'utilisateur n'a pas fait de choix explicite
    this.listenToSystemPreference();
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(newTheme: AppTheme): void {
    this.hasExplicitUserChoice = true;
    this.theme.set(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.storageKey, newTheme);
      } catch {
        // Ignorer les erreurs d'accès au stockage local (navigation privée)
      }
    }
  }

  private getInitialTheme(): AppTheme {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved === 'light' || saved === 'dark') {
          this.hasExplicitUserChoice = true;
          return saved;
        }
      } catch {
        // Fallback
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  }

  private listenToSystemPreference(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!this.hasExplicitUserChoice) {
        this.theme.set(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handler);
    }
  }

  private applyThemeToDom(isDarkMode: boolean): void {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('dark-theme', isDarkMode);
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';

    // Couleurs de marque Lawtan : bleu nuit en sombre, bleu primaire en clair
    const themeColor = isDarkMode ? '#0B1724' : '#12304A';
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    if (metaTags.length > 0) {
      metaTags.forEach(meta => meta.setAttribute('content', themeColor));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColor;
      document.head.appendChild(meta);
    }
  }
}
