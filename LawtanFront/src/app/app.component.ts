import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { CowCursorComponent } from './shared/components/cow-cursor/cow-cursor.component';
import { ScrollProgressComponent } from './shared/components/scroll-progress/scroll-progress.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CowCursorComponent, ScrollProgressComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LawtanFront';
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      // Si la navigation ne cible pas une ancre (#apropos, #pourquoi, etc.), remettre le scroll en haut de page
      if (typeof window !== 'undefined' && !url.includes('#') && !window.location.hash) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    });
  }
}
