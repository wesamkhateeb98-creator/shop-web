import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <header
      class="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <!-- Menu toggle -->
      <button
        class="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)]"
        (click)="toggleSidebar.emit()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="flex-1"></div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Visit Store -->
        <a
          routerLink="/"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {{ 'nav.visitStore' | translate }}
          </span>
        </a>

        <!-- Language toggle -->
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

        <!-- Logout -->
        <button
          class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-danger)] transition-colors"
          (click)="authService.logout()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  readonly toggleSidebar = output();

  protected readonly themeService = inject(ThemeService);
  protected readonly languageService = inject(LanguageService);
  protected readonly authService = inject(AuthService);

  toggleLanguage(): void {
    const next = this.languageService.currentLang() === 'en' ? 'ar' : 'en';
    this.languageService.setLanguage(next);
  }
}
