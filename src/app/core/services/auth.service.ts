import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import {
  SigninRequest,
  SignupRequest,
  AuthResponse,
  Role,
} from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly roleSignal = signal<Role>(this.getStoredRole());

  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly role = computed(() => this.roleSignal());
  readonly isAdmin = computed(() => this.roleSignal() === Role.Admin);

  signin(credentials: SigninRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/account/signin', credentials).pipe(
      tap((response) => this.setSession(response))
    );
  }

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/account/signup', data).pipe(
      tap((response) => this.setSession(response))
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getTokenValue(): string | null {
    return this.tokenSignal();
  }

  private setSession(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(ROLE_KEY, String(response.role));
    }
    this.tokenSignal.set(response.token);
    this.roleSignal.set(response.role);
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    }
    this.tokenSignal.set(null);
    this.roleSignal.set(Role.Customer);
  }

  private getStoredToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private getStoredRole(): Role {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(ROLE_KEY);
      return stored ? Number(stored) as Role : Role.Customer;
    }
    return Role.Customer;
  }
}
