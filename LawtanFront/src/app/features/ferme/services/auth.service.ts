import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserRole, CreateUserRequest, UpdateUserRequest, UpdateProfileRequest, ChangePasswordRequest } from '../models/user.model';
import { resolveApiBaseUrl } from './api-url';

const STORAGE_KEY_USER = 'lawtan_auth_user';
const STORAGE_KEY_TOKEN = 'lawtan_auth_token';

interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  authError = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    this.restoreSession();
  }

  get baseUrl(): string {
    return resolveApiBaseUrl();
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedUserJson = localStorage.getItem(STORAGE_KEY_USER);
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (savedUserJson && savedToken) {
        const parsedUser: User = JSON.parse(savedUserJson);
        this.currentUser.set(parsedUser);
        this.isAuthenticated.set(true);
      } else {
        this.clearSession();
      }
    } catch (e) {
      this.clearSession();
    }
  }

  login(identifier: string, password: string, remember: boolean = true): Observable<User> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      username: identifier.trim(),
      password: password.trim()
    }).pipe(
      map(res => {
        this.setSession(res.user, res.token, remember);
        return res.user;
      }),
      catchError(err => {
        // Un echec de connexion n'est pas forcement un mauvais mot de passe :
        // annoncer "identifiants incorrects" sur une panne serveur envoie
        // l'utilisateur chercher au mauvais endroit.
        const msg = this.describeLoginFailure(err);
        this.authError.set(msg);
        this.isLoading.set(false);
        return throwError(() => new Error(msg));
      }),
      tap({ next: () => this.isLoading.set(false) })
    );
  }

  /** Traduit un echec de connexion en message fidele a sa cause reelle. */
  private describeLoginFailure(err: any): string {
    const serverMessage = err?.error?.message;
    if (serverMessage) return serverMessage;

    switch (err?.status) {
      case 0:
        return `Serveur injoignable à l'adresse ${this.baseUrl}. Vérifiez votre connexion ou que le backend est démarré.`;
      case 401:
      case 403:
        return 'Identifiant ou mot de passe incorrect.';
      case 404:
        return `Service d'authentification introuvable sur ${this.baseUrl}. Le backend déployé est probablement obsolète.`;
      case 502:
      case 503:
      case 504:
        return 'Le serveur démarre ou est indisponible. Réessayez dans une minute.';
      default:
        return err?.status >= 500
          ? `Erreur serveur (${err.status}) pendant la connexion.`
          : 'Identifiant ou mot de passe incorrect.';
    }
  }

  logout(): void {
    this.clearSession();
  }

  private setSession(user: User, token: string, remember: boolean): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.authError.set(null);
    if (typeof window !== 'undefined' && remember) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.authError.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }

  // --- Contrôle d'accès basé sur les rôles (RBAC) ---
  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'manager') return true;
    return allowedRoles.includes(user.role);
  }

  canAccessTab(tabId: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'manager') return true;

    switch (tabId) {
      case 'dashboard':
        return true;
      case 'troupeau':
      case 'animaux':
        return user.role === 'veto' || user.role === 'bouvier';
      case 'reproduction':
      case 'sante':
        return user.role === 'veto';
      case 'lait':
      case 'transformation':
        return user.role === 'tech';
      case 'tracabilite':
        return user.role === 'tech' || user.role === 'compta';
      case 'commercial':
      case 'ventes':
      case 'finance':
        return user.role === 'compta';
      case 'alimentation':
      case 'solaire':
      case 'settings':
        return user.role === 'bouvier';
      case 'administration':
        return false;
      default:
        return false;
    }
  }

  getDefaultTabForRole(role: UserRole): string {
    switch (role) {
      case 'veto': return 'sante';
      case 'tech': return 'lait';
      case 'compta': return 'commercial';
      case 'bouvier': return 'alimentation';
      default: return 'dashboard';
    }
  }

  // --- Profil & Sécurité Personnel ---
  updateMyProfile(payload: UpdateProfileRequest): Observable<User> {
    const email = this.currentUser()?.email || '';
    return this.http.put<User>(`${this.baseUrl}/users/me/profile?email=${encodeURIComponent(email)}`, payload).pipe(
      tap(updatedUser => {
        const current = this.currentUser();
        if (current) {
          const merged = { ...current, ...updatedUser };
          this.currentUser.set(merged);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
          }
        }
      })
    );
  }

  changeMyPassword(payload: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/me/password`, payload);
  }

  // --- Gestion des Utilisateurs (Administrateur / Manager) ---
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, payload);
  }

  updateUser(id: number | string, payload: UpdateUserRequest): Observable<User> {
    const numId = typeof id === 'string' && id.startsWith('usr_') ? id.replace('usr_', '') : id;
    return this.http.put<User>(`${this.baseUrl}/users/${numId}`, payload);
  }

  toggleUserStatus(id: number | string): Observable<User> {
    const numId = typeof id === 'string' && id.startsWith('usr_') ? id.replace('usr_', '') : id;
    return this.http.put<User>(`${this.baseUrl}/users/${numId}/toggle-active`, {});
  }
}
