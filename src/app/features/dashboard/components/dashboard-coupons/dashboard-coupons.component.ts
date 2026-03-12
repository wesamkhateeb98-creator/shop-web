import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CouponService } from '@core/services/coupon.service';
import { Coupon } from '@core/models/coupon.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard-coupons',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, DatePipe, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.couponsManagement' | translate }}</h1>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="showForm.set(!showForm())"
        >
          {{ showForm() ? ('dashboard.cancel' | translate) : ('dashboard.addCoupon' | translate) }}
        </button>
      </div>

      <!-- Add Form -->
      @if (showForm()) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <form [formGroup]="couponForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              formControlName="code"
              class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              [placeholder]="'dashboard.couponCode' | translate"
            />
            <input
              type="number"
              formControlName="percentage"
              class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              [placeholder]="'dashboard.percentage' | translate"
              min="1"
              max="100"
            />
            <input
              type="datetime-local"
              formControlName="expiryDate"
              class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <input
              type="number"
              formControlName="maxUses"
              class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              [placeholder]="'dashboard.maxUses' | translate"
              min="1"
            />
            <button
              type="submit"
              class="sm:col-span-2 lg:col-span-4 px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              [disabled]="couponForm.invalid"
            >
              {{ 'dashboard.createCoupon' | translate }}
            </button>
          </form>
        </div>
      }

      @if (coupons().length > 0) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.code' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.percentage' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.expiry' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.usage' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.active' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-border)]">
                @for (coupon of coupons(); track coupon.id) {
                  <tr class="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td class="px-5 py-3 font-mono font-medium">{{ coupon.code }}</td>
                    <td class="px-5 py-3">{{ coupon.percentage }}%</td>
                    <td class="px-5 py-3">{{ coupon.expiryDate | date:'short' }}</td>
                    <td class="px-5 py-3">{{ coupon.usedCount }} / {{ coupon.maxUses }}</td>
                    <td class="px-5 py-3">
                      @if (coupon.isActive) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {{ 'dashboard.yes' | translate }}
                        </span>
                      } @else {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          {{ 'dashboard.no' | translate }}
                        </span>
                      }
                    </td>
                    <td class="px-5 py-3">
                      <button
                        class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-danger)]"
                        (click)="deleteCoupon(coupon.id)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <app-empty-state
            [title]="'dashboard.noCoupons' | translate"
            [message]="'dashboard.noCouponsMessage' | translate"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCouponsComponent implements OnInit {
  private readonly couponService = inject(CouponService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly coupons = signal<Coupon[]>([]);
  readonly showForm = signal(false);

  readonly couponForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    percentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
    expiryDate: ['', Validators.required],
    maxUses: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadCoupons();
  }

  onSubmit(): void {
    if (this.couponForm.invalid) return;

    const { code, percentage, expiryDate, maxUses } = this.couponForm.getRawValue();

    this.couponService
      .createCoupon({
        code,
        percentage,
        expiryDate: new Date(expiryDate).toISOString(),
        maxUses,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.couponForm.reset();
          this.showForm.set(false);
          this.loadCoupons();
        },
      });
  }

  deleteCoupon(id: number): void {
    this.couponService
      .deleteCoupon(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadCoupons() });
  }

  private loadCoupons(): void {
    this.couponService
      .getCoupons({ pageSize: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.coupons.set(res.content) });
  }
}
