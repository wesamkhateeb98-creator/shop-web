import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '@core/services/product.service';
import { CategoryService } from '@core/services/category.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { Product, UpdateProductRequest } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ProductFormDialogComponent, ProductFormData } from '../product-form-dialog/product-form-dialog.component';
import { DiscountFormDialogComponent, DiscountFormData } from '../discount-form-dialog/discount-form-dialog.component';
import { environment } from '@env';

@Component({
  selector: 'app-dashboard-products',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe, EmptyStateComponent, ProductFormDialogComponent, DiscountFormDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.productsManagement' | translate }}</h1>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="openAddDialog()"
        >
          {{ 'dashboard.addProduct' | translate }}
        </button>
      </div>

      @if (products().length > 0) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.image' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.productName' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.price' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.stock' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.discount' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-border)]">
                @for (product of products(); track product.id) {
                  <tr class="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td class="px-5 py-3">
                      <div
                        class="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] overflow-hidden border border-[var(--color-border)] flex items-center justify-center cursor-pointer"
                        (click)="product.image ? previewImage.set(getImageUrl(product.image)) : null"
                      >
                        @if (product.image) {
                          <img [src]="getImageUrl(product.image)" [alt]="product.name" class="w-full h-full object-cover" loading="lazy" />
                        } @else {
                          <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        }
                      </div>
                    </td>
                    <td class="px-5 py-3 font-medium">{{ product.name }}</td>
                    <td class="px-5 py-3">{{ product.price | currency:'USD' }}</td>
                    <td class="px-5 py-3">
                      <span [class.text-[var(--color-danger)]]="product.stock === 0">
                        {{ product.stock }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      @if (product.discountPercentage) {
                        <div class="flex items-center gap-2">
                          <span class="text-[var(--color-success)] font-medium">{{ product.discountPercentage }}%</span>
                          <button
                            class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-danger)]"
                            [title]="'dashboard.removeDiscount' | translate"
                            (click)="removeDiscount(product)"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      } @else {
                        <button
                          class="px-2 py-1 text-xs font-medium rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                          (click)="openDiscountDialog(product)"
                        >
                          + {{ 'dashboard.addDiscount' | translate }}
                        </button>
                      }
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2">
                        <button
                          class="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-primary)]"
                          (click)="openEditDialog(product)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-danger)]"
                          (click)="deleteProduct(product.id)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
            [title]="'dashboard.noProducts' | translate"
            [message]="'dashboard.noProductsMessage' | translate"
          />
        </div>
      }

      <!-- Image Preview Lightbox -->
      @if (previewImage()) {
        <div class="fixed inset-0 z-[9998] bg-black/70 flex items-center justify-center p-4" (click)="previewImage.set(null)">
          <div class="relative max-w-2xl max-h-[80vh]" (click)="$event.stopPropagation()">
            <button class="absolute -top-3 -end-3 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10" (click)="previewImage.set(null)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img [src]="previewImage()" alt="Product preview" class="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" />
          </div>
        </div>
      }

      <!-- Dialogs -->
      <app-product-form-dialog
        [visible]="showProductDialog()"
        [product]="editingProduct()"
        [categories]="categories()"
        (saved)="onProductSaved($event)"
        (closed)="showProductDialog.set(false); editingProduct.set(null)"
      />
      <app-discount-form-dialog
        [visible]="showDiscountDialog()"
        [product]="discountingProduct()"
        (saved)="onDiscountSaved($event)"
        (closed)="showDiscountDialog.set(false); discountingProduct.set(null)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly previewImage = signal<string | null>(null);

  readonly showProductDialog = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly showDiscountDialog = signal(false);
  readonly discountingProduct = signal<Product | null>(null);

  private readonly baseUrl = environment.apiUrl.replace('/api/v1.0', '');

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  getImageUrl(image: string): string {
    if (image.startsWith('http')) return image;
    return this.baseUrl + (image.startsWith('/') ? '' : '/') + image;
  }

  openAddDialog(): void {
    this.editingProduct.set(null);
    this.showProductDialog.set(true);
  }

  openEditDialog(product: Product): void {
    this.editingProduct.set(product);
    this.showProductDialog.set(true);
  }

  onProductSaved(data: ProductFormData): void {
    const editing = this.editingProduct();

    if (editing) {
      const updateData: UpdateProductRequest = {
        name: data.name,
        price: data.price,
        stock: data.stock,
        description: data.description,
        categoryId: data.categoryId,
      };
      this.productService
        .updateProduct(editing.id, updateData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackbar.success(this.translate.instant('snackbar.productUpdated'));
            this.showProductDialog.set(false);
            this.editingProduct.set(null);
            this.loadProducts();
          },
        });
    } else {
      const formData = new FormData();
      formData.append('key', crypto.randomUUID());
      formData.append('name', data.name);
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('description', data.description);
      formData.append('categoryId', data.categoryId.toString());
      if (data.file) {
        formData.append('image', data.file);
      }

      this.productService
        .createProduct(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackbar.success(this.translate.instant('snackbar.productCreated'));
            this.showProductDialog.set(false);
            this.loadProducts();
          },
        });
    }
  }

  async deleteProduct(id: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.translate.instant('dialog.confirmDelete')
    );
    if (!confirmed) return;

    this.productService
      .deleteProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('snackbar.productDeleted'));
          this.loadProducts();
        },
      });
  }

  openDiscountDialog(product: Product): void {
    this.discountingProduct.set(product);
    this.showDiscountDialog.set(true);
  }

  async onDiscountSaved(data: DiscountFormData): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.translate.instant('dialog.confirmProcess')
    );
    if (!confirmed) return;

    this.productService
      .addDiscount(data.productId, {
        percentage: data.percentage,
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('snackbar.discountAdded'));
          this.showDiscountDialog.set(false);
          this.discountingProduct.set(null);
          this.loadProducts();
        },
      });
  }

  async removeDiscount(product: Product): Promise<void> {
    if (!product.discountId) return;

    const confirmed = await this.confirmDialog.confirm(
      this.translate.instant('dialog.confirmDelete')
    );
    if (!confirmed) return;

    this.productService
      .removeDiscount(product.id, product.discountId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('snackbar.discountRemoved'));
          this.loadProducts();
        },
      });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService
      .getProducts({ pageNumber: this.currentPage(), pageSize: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.content);
          this.totalPages.set(res.countPages);
        },
      });
  }

  private loadCategories(): void {
    this.categoryService
      .getCategories({ pageSize: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.categories.set(res.content) });
  }
}
