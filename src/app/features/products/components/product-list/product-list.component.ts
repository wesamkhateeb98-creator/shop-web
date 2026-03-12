import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '@core/services/product.service';
import { CategoryService } from '@core/services/category.service';
import { Product } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, TranslateModule, EmptyStateComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ 'products.title' | translate }}</h1>
        <p class="text-[var(--color-text-secondary)]">{{ 'products.subtitle' | translate }}</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          class="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          [placeholder]="'products.search' | translate"
          [ngModel]="searchName()"
          (ngModelChange)="searchName.set($event)"
          (keyup.enter)="loadProducts()"
        />
        <select
          class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          [ngModel]="selectedCategory()"
          (ngModelChange)="onCategoryChange($event)"
        >
          <option [ngValue]="null">{{ 'products.allCategories' | translate }}</option>
          @for (cat of categories(); track cat.id) {
            <option [ngValue]="cat.id">{{ cat.name }}</option>
          }
        </select>
        <button
          class="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="loadProducts()"
        >
          {{ 'products.filter' | translate }}
        </button>
      </div>

      <!-- Product Grid -->
      @if (products().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (product of products(); track product.id) {
            <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden hover:shadow-lg transition-shadow">
              <!-- Image -->
              <div class="aspect-square bg-[var(--color-bg-secondary)] relative overflow-hidden">
                @if (product.image) {
                  <img
                    [src]="product.image"
                    [alt]="product.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-16 h-16 text-[var(--color-border)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                }

                <!-- Discount badge -->
                @if (product.discountPercentage) {
                  <span class="absolute top-2 start-2 px-2 py-1 bg-[var(--color-danger)] text-white text-xs font-bold rounded">
                    -{{ product.discountPercentage }}%
                  </span>
                }
              </div>

              <!-- Info -->
              <div class="p-4">
                <h3 class="font-medium text-sm mb-2 line-clamp-2">{{ product.name }}</h3>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-[var(--color-primary)]">
                    {{ product.finalPrice | currency:'USD' }}
                  </span>
                  @if (product.discountPercentage) {
                    <span class="text-sm text-[var(--color-text-secondary)] line-through">
                      {{ product.price | currency:'USD' }}
                    </span>
                  }
                </div>
                @if (product.stock === 0) {
                  <p class="text-xs text-[var(--color-danger)] mt-1 font-medium">
                    {{ 'products.outOfStock' | translate }}
                  </p>
                }
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center items-center gap-2 mt-10">
            <button
              class="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-40"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              {{ 'products.prev' | translate }}
            </button>
            <span class="text-sm text-[var(--color-text-secondary)]">
              {{ currentPage() }} / {{ totalPages() }}
            </span>
            <button
              class="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-40"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              {{ 'products.next' | translate }}
            </button>
          </div>
        }
      } @else if (!isLoading()) {
        <app-empty-state
          [title]="'products.noProducts' | translate"
          [message]="'products.noProductsMessage' | translate"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(false);
  readonly searchName = signal('');
  readonly selectedCategory = signal<number | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService
      .getProducts({
        name: this.searchName() || undefined,
        categoryId: this.selectedCategory() ?? undefined,
        pageNumber: this.currentPage(),
        pageSize: 12,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.content);
          this.totalPages.set(res.countPages);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoryService
      .getCategories({ pageSize: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.categories.set(res.content),
      });
  }
}
