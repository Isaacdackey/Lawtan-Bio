import { Routes } from '@angular/router';

export const routes: Routes = [
  // Portail Vitrine Client
  {
    path: '',
    loadComponent: () =>
      import('./features/client/accueil/accueil.component').then((m) => m.AccueilComponent),
    pathMatch: 'full'
  },
  {
    path: 'accueil',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/client/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contactez-nous — Lawtan Bio'
  },
  {
    path: 'devis',
    loadComponent: () =>
      import('./features/client/devis/devis.component').then((m) => m.DevisComponent),
    title: 'Demande de Devis — Lawtan Bio'
  },

  // Espace Authentification
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Connexion — Lawtan Bio'
  },

  {
    path: '**',
    redirectTo: ''
  }
];
