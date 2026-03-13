import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  effect,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/models/product.model';
import { Category } from '@core/models/category.model';

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description: string;
  categoryId: number;
  file: File | null;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4"
        (click)="close()"
      >
        <div
          class="w-full max-w-lg rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-xl"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 class="text-lg font-semibold">
              {{ product() ? ('dashboard.editProduct' | translate) : ('dashboard.addProduct' | translate) }}
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.productName' | translate }}</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  [placeholder]="'dashboard.productName' | translate"
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
                  [placeholder]="'dashboard.price' | translate"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.stock' | translate }}</label>
                <input
                  type="number"
                  formControlName="stock"
                  min="0"
                  class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  [placeholder]="'dashboard.stock' | translate"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.description' | translate }}</label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                [placeholder]="'dashboard.description' | translate"
              ></textarea>
            </div>

            @if (!product()) {
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
                {{ product() ? ('dashboard.update' | translate) : ('dashboard.add' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input(false);
  readonly product = input<Product | null>(null);
  readonly categories = input<Category[]>([]);

  readonly saved = output<ProductFormData>();
  readonly closed = output<void>();

  private selectedFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.form.patchValue({
          name: p.name,
          price: p.price,
          stock: p.stock,
          description: p.description,
          categoryId: p.categoryId,
        });
      } else if (this.visible()) {
        this.form.reset({ name: '', price: 0, stock: 0, description: '', categoryId: 0 });
        this.selectedFile = null;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, price, stock, description, categoryId } = this.form.getRawValue();
    this.saved.emit({ name, price, stock, description, categoryId, file: this.selectedFile });
  }

  close(): void {
    this.form.reset();
    this.selectedFile = null;
    this.closed.emit();
  }
}
