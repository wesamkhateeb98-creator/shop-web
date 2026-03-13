import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface CouponFormData {
  code: string;
  percentage: number;
  expiryDate: string;
  maxUses: number;
}

@Component({
  selector: 'app-coupon-form-dialog',
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
            <h2 class="text-lg font-semibold">{{ 'dashboard.createCoupon' | translate }}</h2>
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
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.code' | translate }}</label>
              <input
                type="text"
                formControlName="code"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                [placeholder]="'dashboard.couponCode' | translate"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.percentage' | translate }}</label>
                <input
                  type="number"
                  formControlName="percentage"
                  min="1"
                  max="100"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  [placeholder]="'dashboard.percentage' | translate"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.maxUses' | translate }}</label>
                <input
                  type="number"
                  formControlName="maxUses"
                  min="1"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  [placeholder]="'dashboard.maxUses' | translate"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.expiry' | translate }}</label>
              <input
                type="datetime-local"
                formControlName="expiryDate"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
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
export class CouponFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input(false);

  readonly saved = output<CouponFormData>();
  readonly closed = output<void>();

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    percentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
    expiryDate: ['', Validators.required],
    maxUses: [1, [Validators.required, Validators.min(1)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { code, percentage, expiryDate, maxUses } = this.form.getRawValue();
    this.saved.emit({ code, percentage, expiryDate: new Date(expiryDate).toISOString(), maxUses });
  }

  close(): void {
    this.form.reset();
    this.closed.emit();
  }
}
