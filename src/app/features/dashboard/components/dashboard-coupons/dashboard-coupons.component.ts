import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CouponService } from '@core/services/coupon.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { Coupon } from '@core/models/coupon.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { CouponFormDialogComponent, CouponFormData } from '../coupon-form-dialog/coupon-form-dialog.component';

@Component({
  selector: 'app-dashboard-coupons',
  standalone: true,
  imports: [TranslateModule, DatePipe, EmptyStateComponent, CouponFormDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.couponsManagement' | translate }}</h1>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="showDialog.set(true)"
        >
          {{ 'dashboard.addCoupon' | translate }}
        </button>
      </div>

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

        @if (totalPages() > 1) {
          <div class="flex justify-center items-center gap-2">
            <button
              class="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-40"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              {{ 'products.prev' | translate }}
            </button>
            <span class="text-sm text-[var(--color-text-secondary)]">{{ currentPage() }} / {{ totalPages() }}</span>
            <button
              class="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-40"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              {{ 'products.next' | translate }}
            </button>
          </div>
        }
      } @else {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <app-empty-state
            [title]="'dashboard.noCoupons' | translate"
            [message]="'dashboard.noCouponsMessage' | translate"
          />
        </div>
      }

      <app-coupon-form-dialog
        [visible]="showDialog()"
        (saved)="onCouponSaved($event)"
        (closed)="showDialog.set(false)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCouponsComponent implements OnInit {
  private readonly couponService = inject(CouponService);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly coupons = signal<Coupon[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly showDialog = signal(false);

  ngOnInit(): void {
    this.loadCoupons();
  }

  onCouponSaved(data: CouponFormData): void {
    this.couponService
      .createCoupon({
        code: data.code,
        percentage: data.percentage,
        expiryDate: data.expiryDate,
        maxUses: data.maxUses,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('snackbar.couponCreated'));
          this.showDialog.set(false);
          this.loadCoupons();
        },
      });
  }

  async deleteCoupon(id: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.translate.instant('dialog.confirmDelete')
    );
    if (!confirmed) return;

    this.couponService
      .deleteCoupon(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('snackbar.couponDeleted'));
          this.loadCoupons();
        },
      });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCoupons();
  }

  private loadCoupons(): void {
    this.couponService
      .getCoupons({ pageNumber: this.currentPage(), pageSize: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.coupons.set(res.content);
          this.totalPages.set(res.countPages);
        },
      });
  }
}
