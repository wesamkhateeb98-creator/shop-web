import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

type Theme = 'light' | 'dark';

const THEME_KEY = 'shop_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly themeSignal = signal<Theme>('light');

  readonly theme = computed(() => this.themeSignal());
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      const preferred =
        stored ??
        (window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light');
      this.applyTheme(preferred);
    }
  }

  toggle(): void {
    const next = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    this.themeSignal.set(theme);

    if (isPlatformBrowser(this.platformId)) {
      const html = this.document.documentElement;
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
      localStorage.setItem(THEME_KEY, theme);
    }
  }
}
