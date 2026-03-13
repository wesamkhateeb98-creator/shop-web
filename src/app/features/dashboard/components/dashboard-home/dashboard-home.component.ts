import { Component, ChangeDetectionStrategy, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '@core/services/order.service';
import { ProductService } from '@core/services/product.service';
import { OrderSummary, OrderStatus, OrderStatusLabels } from '@core/models/order.model';
import { StatusBadgePipe } from '../../pipes/status-badge.pipe';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe, DatePipe, StatusBadgePipe],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">{{ 'dashboard.title' | translate }}</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <span class="text-sm text-[var(--color-text-secondary)]">{{ 'dashboard.totalOrders' | translate }}</span>
          <p class="text-2xl font-bold mt-2">{{ totalOrders() }}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <span class="text-sm text-[var(--color-text-secondary)]">{{ 'dashboard.pendingOrders' | translate }}</span>
          <p class="text-2xl font-bold mt-2">{{ pendingOrders() }}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <span class="text-sm text-[var(--color-text-secondary)]">{{ 'dashboard.totalProducts' | translate }}</span>
          <p class="text-2xl font-bold mt-2">{{ totalProducts() }}</p>
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <span class="text-sm text-[var(--color-text-secondary)]">{{ 'dashboard.confirmedOrders' | translate }}</span>
          <p class="text-2xl font-bold mt-2">{{ confirmedOrders() }}</p>
        </div>
      </div>

      <!-- Recent Orders Table -->
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden">
        <div class="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 class="text-lg font-semibold">{{ 'dashboard.recentOrders' | translate }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[var(--color-bg-secondary)]">
              <tr>
                <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">#</th>
                <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.amount' | translate }}</th>
                <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.items' | translate }}</th>
                <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.status' | translate }}</th>
                <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.date' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (order of recentOrders(); track order.id) {
                <tr class="hover:bg-[var(--color-bg-secondary)] transition-colors">
                  <td class="px-5 py-3 font-medium">{{ order.id }}</td>
                  <td class="px-5 py-3">{{ order.totalPrice | currency:'USD' }}</td>
                  <td class="px-5 py-3">{{ order.itemCount }}</td>
                  <td class="px-5 py-3">
                    <span
                      class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                      [class]="order.status | statusBadge"
                    >
                      {{ statusLabels[order.status] }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-[var(--color-text-secondary)]">{{ order.createdAt | date:'short' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-5 py-8 text-center text-[var(--color-text-secondary)]">
                    {{ 'dashboard.noOrders' | translate }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHomeComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusLabels = OrderStatusLabels;
  readonly recentOrders = signal<OrderSummary[]>([]);
  readonly totalOrders = signal(0);
  readonly pendingOrders = signal(0);
  readonly confirmedOrders = signal(0);
  readonly totalProducts = signal(0);

  ngOnInit(): void {
    this.loadOrders();
    this.loadProductCount();
  }

  private loadOrders(): void {
    this.orderService
      .getOrders({ pageNumber: 1, pageSize: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.recentOrders.set(res.content);
          this.totalOrders.set(res.countPages * res.pageSize);
          this.pendingOrders.set(
            res.content.filter((o) => o.status === OrderStatus.Pending).length
          );
          this.confirmedOrders.set(
            res.content.filter((o) => o.status === OrderStatus.Confirmed).length
          );
        },
      });
  }

  private loadProductCount(): void {
    this.productService
      .getProducts({ pageNumber: 1, pageSize: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.totalProducts.set(res.countPages * res.pageSize),
      });
  }
}
