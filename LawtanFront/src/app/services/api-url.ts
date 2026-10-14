/**
 * Adresse unique du backend.
 *
 * Elle etait dupliquee dans ApiService et AuthService : lors d'un changement
 * d'URL de deploiement, une seule des deux avait ete mise a jour et la
 * connexion echouait en silence. Une seule source, desormais.
 */

/** Backend de production, deploye sur Render. */
export const PRODUCTION_API_URL = 'https://lawtan-bio-back-6h72.onrender.com/api';

/** Backend utilise pendant le developpement local. */
export const LOCAL_API_URL = 'http://localhost:8080/api';

/** Cle de surcharge manuelle, utile pour pointer un autre backend depuis le navigateur. */
export const API_URL_OVERRIDE_KEY = 'lawtan_api_url';

/**
 * Determine l'adresse du backend : surcharge manuelle si presente, backend
 * local quand on developpe sur la machine, production sinon.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') return LOCAL_API_URL;

  try {
    const override = localStorage.getItem(API_URL_OVERRIDE_KEY);
    if (override) return override;
  } catch {
    // Stockage indisponible (navigation privee) : on retombe sur les valeurs par defaut.
  }

  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  return isLocal ? LOCAL_API_URL : PRODUCTION_API_URL;
}
