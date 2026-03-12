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
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '@core/services/product.service';
import { CategoryService } from '@core/services/category.service';
import { Product, UpdateProductRequest } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard-products',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.productsManagement' | translate }}</h1>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="toggleForm()"
        >
          {{ showForm() ? ('dashboard.cancel' | translate) : ('dashboard.addProduct' | translate) }}
        </button>
      </div>

      <!-- Add/Edit Product Form -->
      @if (showForm()) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <h2 class="text-lg font-semibold mb-4">
            {{ editingProduct() ? ('dashboard.editProduct' | translate) : ('dashboard.addProduct' | translate) }}
          </h2>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.productName' | translate }}</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.category' | translate }}</label>
                <select
                  formControlName="categoryId"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option [ngValue]="0" disabled>{{ 'dashboard.selectCategory' | translate }}</option>
                  @for (cat of categories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.price' | translate }}</label>
                <input
                  type="number"
                  formControlName="price"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.stock' | translate }}</label>
                <input
                  type="number"
                  formControlName="stock"
                  min="0"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.description' | translate }}</label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              ></textarea>
            </div>

            <!-- Image upload (only for new products) -->
            @if (!editingProduct()) {
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.image' | translate }}</label>
                <input
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-hover)] file:cursor-pointer"
                />
              </div>
            }

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                (click)="toggleForm()"
              >
                {{ 'dashboard.cancel' | translate }}
              </button>
              <button
                type="submit"
                class="px-6 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                [disabled]="productForm.invalid || isSubmitting()"
              >
                {{ editingProduct() ? ('dashboard.update' | translate) : ('dashboard.add' | translate) }}
              </button>
            </div>
          </form>
        </div>
      }

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
                      <div class="w-10 h-10 rounded bg-[var(--color-bg-secondary)] overflow-hidden">
                        @if (product.image) {
                          <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover" loading="lazy" />
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
                        <span class="text-[var(--color-success)]">{{ product.discountPercentage }}%</span>
                      } @else {
                        <span class="text-[var(--color-text-secondary)]">-</span>
                      }
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2">
                        <button
                          class="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-primary)]"
                          title="Edit"
                          (click)="editProduct(product)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-danger)]"
                          title="Delete"
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

        <!-- Pagination -->
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
      } @else if (!showForm()) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <app-empty-state
            [title]="'dashboard.noProducts' | translate"
            [message]="'dashboard.noProductsMessage' | translate"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly showForm = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly isSubmitting = signal(false);

  private selectedFile: File | null = null;

  readonly productForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting.set(true);
    const { name, price, stock, description, categoryId } = this.productForm.getRawValue();

    if (this.editingProduct()) {
      // Update existing product
      const updateData: UpdateProductRequest = { name, price, stock, description, categoryId };
      this.productService
        .updateProduct(this.editingProduct()!.id, updateData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toggleForm();
            this.loadProducts();
          },
          error: () => this.isSubmitting.set(false),
        });
    } else {
      // Create new product with FormData (multipart)
      const formData = new FormData();
      formData.append('key', crypto.randomUUID());
      formData.append('name', name);
      formData.append('price', price.toString());
      formData.append('stock', stock.toString());
      formData.append('description', description);
      formData.append('categoryId', categoryId.toString());
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.productService
        .createProduct(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toggleForm();
            this.loadProducts();
          },
          error: () => this.isSubmitting.set(false),
        });
    }
  }

  editProduct(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.categoryId,
    });
    this.showForm.set(true);
  }

  deleteProduct(id: number): void {
    this.productService
      .deleteProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadProducts() });
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

  private resetForm(): void {
    this.productForm.reset({ name: '', price: 0, stock: 0, description: '', categoryId: 0 });
    this.editingProduct.set(null);
    this.selectedFile = null;
  }
}
