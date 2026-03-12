import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import {
  SigninRequest,
  SignupRequest,
  AuthResponse,
} from '../models/auth.model';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly tokenSignal = signal<string | null>(this.getStoredToken());

  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly token = computed(() => this.tokenSignal());

  signin(credentials: SigninRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/account/signin', credentials).pipe(
      tap((response) => this.setToken(response.token))
    );
  }

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/account/signup', data).pipe(
      tap((response) => this.setToken(response.token))
    );
  }

  logout(): void {
    this.clearToken();
    this.router.navigate(['/auth/login']);
  }

  getTokenValue(): string | null {
    return this.tokenSignal();
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this.tokenSignal.set(token);
  }

  private clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.tokenSignal.set(null);
  }

  private getStoredToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }
}
