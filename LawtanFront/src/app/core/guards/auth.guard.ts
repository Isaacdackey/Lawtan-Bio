import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Garde d'authentification pour protéger l'accès à l'espace Ferme / Back-Office.
 * Redirige les utilisateurs non connectés vers la page de connexion (/login).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirection vers /login avec mémorisation de l'URL cible
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
