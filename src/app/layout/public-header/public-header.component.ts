import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
      <div class="container mx-auto flex items-center justify-between h-16 px-4">
        <!-- Logo -->
        <a routerLink="/" class="text-xl font-bold text-[var(--color-primary)]">
          ShopWeb
        </a>

        <div class="flex-1"></div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Language -->
          <button
            class="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            (click)="toggleLanguage()"
          >
            {{ languageService.currentLang() === 'en' ? 'عربي' : 'EN' }}
          </button>

          <!-- Theme toggle -->
          <button
            class="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            (click)="themeService.toggle()"
          >
            @if (themeService.isDark()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

          @if (authService.isLoggedIn()) {
            <!-- Dashboard -->
            <a
              routerLink="/dashboard"
              class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {{ 'nav.dashboard' | translate }}
            </a>
            <!-- Logout -->
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
              (click)="logout()"
            >
              {{ 'nav.logout' | translate }}
            </button>
          } @else {
            <!-- Login -->
            <a
              routerLink="/auth/login"
              class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {{ 'nav.login' | translate }}
            </a>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly languageService = inject(LanguageService);
  protected readonly authService = inject(AuthService);

  toggleLanguage(): void {
    const next = this.languageService.currentLang() === 'en' ? 'ar' : 'en';
    this.languageService.setLanguage(next);
  }

  logout(): void {
    this.authService.logout();
  }
}
