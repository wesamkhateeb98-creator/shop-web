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
import { Category } from '@core/models/category.model';

export interface CategoryFormData {
  name: string;
  description: string | null;
}

@Component({
  selector: 'app-category-form-dialog',
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
              {{ category() ? ('dialog.editCategory' | translate) : ('dashboard.addCategory' | translate) }}
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
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.name' | translate }}</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                [placeholder]="'dashboard.categoryName' | translate"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">{{ 'dashboard.description' | translate }}</label>
              <input
                type="text"
                formControlName="description"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                [placeholder]="'dashboard.categoryDescription' | translate"
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
                {{ category() ? ('dashboard.update' | translate) : ('dashboard.add' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input(false);
  readonly category = input<Category | null>(null);

  readonly saved = output<CategoryFormData>();
  readonly closed = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const c = this.category();
      if (c) {
        this.form.patchValue({ name: c.name, description: c.description ?? '' });
      } else if (this.visible()) {
        this.form.reset({ name: '', description: '' });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.saved.emit({ name, description: description || null });
  }

  close(): void {
    this.form.reset();
    this.closed.emit();
  }
}
