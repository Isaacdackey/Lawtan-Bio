import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
      // Si la navigation ne cible pas une ancre (#produits, #engagements), remettre le scroll en haut de page
      if (typeof window !== 'undefined' && !event.urlAfterRedirects.includes('#')) {
        window.scrollTo(0, 0);
      }
    });
  }
}
