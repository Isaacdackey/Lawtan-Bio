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

  // Espace Ferme / Back-Office modulé selon les domaines Backend
  {
    path: 'ferme',
    loadComponent: () =>
      import('./features/ferme/layout/ferme-layout.component').then((m) => m.FermeLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/ferme/dashboard/ferme-dashboard.component').then((m) => m.FermeDashboardComponent),
        title: 'Tableau de bord — Lawtan Bio'
      },
      {
        path: 'troupeau',
        loadComponent: () =>
          import('./features/ferme/troupeau/ferme-troupeau.component').then((m) => m.FermeTroupeauComponent),
        title: 'Gestion du Troupeau & Cheptel — Lawtan Bio'
      },
      {
        path: 'cheptel',
        redirectTo: 'troupeau',
        pathMatch: 'full'
      },
      {
        path: 'production',
        loadComponent: () =>
          import('./features/ferme/production/ferme-production.component').then((m) => m.FermeProductionComponent),
        title: 'Production Laitière & Traite — Lawtan Bio'
      },
      {
        path: 'traite',
        redirectTo: 'production',
        pathMatch: 'full'
      },
      {
        path: 'sante',
        loadComponent: () =>
          import('./features/ferme/sante/ferme-sante.component').then((m) => m.FermeSanteComponent),
        title: 'Santé Vétérinaire & Biosécurité — Lawtan Bio'
      },
      {
        path: 'alimentation',
        loadComponent: () =>
          import('./features/ferme/alimentation/ferme-alimentation.component').then((m) => m.FermeAlimentationComponent),
        title: 'Alimentation & Fourrage Bio — Lawtan Bio'
      },
      {
        path: 'commercial',
        loadComponent: () =>
          import('./features/ferme/commercial/ferme-commercial.component').then((m) => m.FermeCommercialComponent),
        title: 'Commercialisation & Commandes — Lawtan Bio'
      },
      {
        path: 'ventes',
        redirectTo: 'commercial',
        pathMatch: 'full'
      },
      {
        path: 'reproduction',
        loadComponent: () =>
          import('./features/ferme/reproduction/ferme-reproduction.component').then((m) => m.FermeReproductionComponent),
        title: 'Reproduction & Vêlage — Lawtan Bio'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
