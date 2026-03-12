import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Language = 'en' | 'ar';

interface LanguageConfig {
  code: Language;
  name: string;
  dir: 'ltr' | 'rtl';
}

const LANG_KEY = 'shop_lang';

const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly currentLangSignal = signal<Language>('en');

  readonly currentLang = computed(() => this.currentLangSignal());
  readonly isRtl = computed(() => this.getDir(this.currentLangSignal()) === 'rtl');
  readonly languages = LANGUAGES;

  init(): void {
    this.translate.addLangs(LANGUAGES.map((l) => l.code));
    this.translate.setDefaultLang('en');

    let lang: Language = 'en';

    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(LANG_KEY) as Language | null;
      if (stored && LANGUAGES.some((l) => l.code === stored)) {
        lang = stored;
      }
    }

    this.applyLanguage(lang);
  }

  setLanguage(lang: Language): void {
    this.applyLanguage(lang);
  }

  private applyLanguage(lang: Language): void {
    this.currentLangSignal.set(lang);
    this.translate.use(lang);

    const dir = this.getDir(lang);
    const html = this.document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dir);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANG_KEY, lang);
    }
  }

  private getDir(lang: Language): 'ltr' | 'rtl' {
    return LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr';
  }
}
