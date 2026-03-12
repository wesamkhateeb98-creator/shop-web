import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Brand -->
          <div>
            <h3 class="text-lg font-bold text-[var(--color-primary)] mb-2">ShopWeb</h3>
            <p class="text-sm text-[var(--color-text-secondary)]">
              {{ 'footer.description' | translate }}
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-sm font-semibold mb-3">{{ 'footer.quickLinks' | translate }}</h4>
            <ul class="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><a href="/" class="hover:text-[var(--color-primary)]">{{ 'nav.home' | translate }}</a></li>
              <li><a href="/products" class="hover:text-[var(--color-primary)]">{{ 'nav.products' | translate }}</a></li>
              <li><a href="/about" class="hover:text-[var(--color-primary)]">{{ 'nav.about' | translate }}</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-sm font-semibold mb-3">{{ 'footer.contact' | translate }}</h4>
            <p class="text-sm text-[var(--color-text-secondary)]">
              {{ 'footer.contactEmail' | translate }}
            </p>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
          {{ 'footer.copyright' | translate }}
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicFooterComponent {}
