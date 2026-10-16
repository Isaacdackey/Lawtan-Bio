import { HttpInterceptorFn } from '@angular/common/http';

/** Ajoute le JWT aux appels API privés sans imposer de session aux routes publiques. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof window === 'undefined') return next(request);

  let token: string | null = null;
  try {
    token = localStorage.getItem('lawtan_auth_token');
  } catch {
    token = null;
  }

  if (!token || request.headers.has('Authorization')) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
