import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/models/product.model';

export interface DiscountFormData {
  productId: number;
  percentage: number;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-discount-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4"
        (click)="close()"
      >
        <div
          class="w-full max-w-md rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-xl"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 class="text-lg font-semibold">
              {{ 'dashboard.addDiscount' | translate }}
              @if (product()) {
                <span class="text-sm font-normal text-[var(--color-text-secondary)]"> - {{ product()!.name }}</span>
              }
            </h2>
            <button
              class="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
              (click)="close()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.discountPercentage' | translate }}</label>
              <input
                type="number"
                formControlName="percentage"
                min="1"
                max="100"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                [placeholder]="'dashboard.discountPercentage' | translate"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.startDate' | translate }}</label>
                <input
                  type="datetime-local"
                  formControlName="startDate"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.endDate' | translate }}</label>
                <input
                  type="datetime-local"
                  formControlName="endDate"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                (click)="close()"
              >
                {{ 'dashboard.cancel' | translate }}
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                [disabled]="form.invalid"
              >
                {{ 'dashboard.add' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input(false);
  readonly product = input<Product | null>(null);

  readonly saved = output<DiscountFormData>();
  readonly closed = output<void>();

  readonly form = this.fb.nonNullable.group({
    percentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const p = this.product();
    if (!p) return;

    const { percentage, startDate, endDate } = this.form.getRawValue();
    this.saved.emit({
      productId: p.id,
      percentage,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
  }

  close(): void {
    this.form.reset();
    this.closed.emit();
  }
}
