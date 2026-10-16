import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/** Ajoute le JWT aux appels API privés sans imposer de session aux routes publiques. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof window === 'undefined') return next(request);

  const router = inject(Router, { optional: true });

  let token: string | null = null;
  try {
    token = localStorage.getItem('lawtan_auth_token');
  } catch {
    token = null;
  }

  const modifiedReq = (!token || request.headers.has('Authorization'))
    ? request
    : request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si le backend renvoie 401 Unauthorized sur une requête privée, on purge le token expiré
      if (error.status === 401 && !request.url.includes('/auth/login')) {
        try {
          localStorage.removeItem('lawtan_auth_token');
          localStorage.removeItem('lawtan_auth_user');
        } catch {}
      }
      return throwError(() => error);
    })
  );
};

