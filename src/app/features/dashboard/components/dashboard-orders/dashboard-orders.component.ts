import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '@core/services/order.service';
import { OrderSummary, OrderStatus } from '@core/models/order.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { StatusBadgePipe } from '../../pipes/status-badge.pipe';

@Component({
  selector: 'app-dashboard-orders',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe, DatePipe, FormsModule, EmptyStateComponent, StatusBadgePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.ordersManagement' | translate }}</h1>
      </div>

      <!-- Status filter -->
      <div class="flex gap-2 flex-wrap">
        <button
          class="px-3 py-1.5 text-sm rounded-lg border transition-colors"
          [class]="!statusFilter() ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'"
          (click)="filterByStatus(null)"
        >
          {{ 'dashboard.all' | translate }}
        </button>
        @for (status of statuses; track status) {
          <button
            class="px-3 py-1.5 text-sm rounded-lg border transition-colors"
            [class]="statusFilter() === status ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'"
            (click)="filterByStatus(status)"
          >
            {{ status }}
          </button>
        }
      </div>

      @if (orders().length > 0) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">#</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.amount' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.items' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.couponDiscount' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.status' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.date' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-border)]">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td class="px-5 py-3 font-medium">{{ order.id }}</td>
                    <td class="px-5 py-3">{{ order.totalPrice | currency:'USD' }}</td>
                    <td class="px-5 py-3">{{ order.itemCount }}</td>
                    <td class="px-5 py-3">{{ order.couponDiscount | currency:'USD' }}</td>
                    <td class="px-5 py-3">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" [class]="order.status | statusBadge">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[var(--color-text-secondary)]">{{ order.createdAt | date:'short' }}</td>
                    <td class="px-5 py-3">
                      <select
                        class="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
                        [ngModel]="order.status"
                        (ngModelChange)="updateStatus(order.id, $event)"
                      >
                        @for (s of statuses; track s) {
                          <option [ngValue]="s">{{ s }}</option>
                        }
                      </select>
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
            [title]="'dashboard.noOrders' | translate"
            [message]="'dashboard.noOrdersMessage' | translate"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<OrderSummary[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly statusFilter = signal<OrderStatus | null>(null);

  readonly statuses = Object.values(OrderStatus);

  ngOnInit(): void {
    this.loadOrders();
  }

  filterByStatus(status: OrderStatus | null): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadOrders();
  }

  updateStatus(orderId: number, status: OrderStatus): void {
    this.orderService
      .updateOrderStatus(orderId, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadOrders() });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  private loadOrders(): void {
    this.orderService
      .getOrders({
        status: this.statusFilter() ?? undefined,
        pageNumber: this.currentPage(),
        pageSize: 10,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders.set(res.content);
          this.totalPages.set(res.countPages);
        },
      });
  }
}
