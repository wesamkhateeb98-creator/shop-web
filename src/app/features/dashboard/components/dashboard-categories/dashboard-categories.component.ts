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
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '@core/services/category.service';
import { Category } from '@core/models/category.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard-categories',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.categoriesManagement' | translate }}</h1>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="showForm.set(!showForm())"
        >
          {{ showForm() ? ('dashboard.cancel' | translate) : ('dashboard.addCategory' | translate) }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      @if (showForm()) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              formControlName="name"
              class="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              [placeholder]="'dashboard.categoryName' | translate"
            />
            <input
              type="text"
              formControlName="description"
              class="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              [placeholder]="'dashboard.categoryDescription' | translate"
            />
            <button
              type="submit"
              class="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              [disabled]="categoryForm.invalid"
            >
              {{ editingId() ? ('dashboard.update' | translate) : ('dashboard.add' | translate) }}
            </button>
          </form>
        </div>
      }

      @if (categories().length > 0) {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">#</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.name' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.description' | translate }}</th>
                  <th class="px-5 py-3 text-start font-medium text-[var(--color-text-secondary)]">{{ 'dashboard.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-border)]">
                @for (cat of categories(); track cat.id) {
                  <tr class="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td class="px-5 py-3 font-medium">{{ cat.id }}</td>
                    <td class="px-5 py-3">{{ cat.name }}</td>
                    <td class="px-5 py-3 text-[var(--color-text-secondary)]">{{ cat.description ?? '-' }}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2">
                        <button class="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-primary)]" (click)="editCategory(cat)">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-danger)]" (click)="deleteCategory(cat.id)">
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
      } @else {
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <app-empty-state
            [title]="'dashboard.noCategories' | translate"
            [message]="'dashboard.noCategoriesMessage' | translate"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<Category[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const { name, description } = this.categoryForm.getRawValue();
    const data = { name, description: description || null };

    const request$ = this.editingId()
      ? this.categoryService.updateCategory(this.editingId()!, data)
      : this.categoryService.createCategory(data);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.categoryForm.reset();
        this.editingId.set(null);
        this.showForm.set(false);
        this.loadCategories();
      },
    });
  }

  editCategory(cat: Category): void {
    this.editingId.set(cat.id);
    this.categoryForm.patchValue({ name: cat.name, description: cat.description ?? '' });
    this.showForm.set(true);
  }

  deleteCategory(id: number): void {
    this.categoryService
      .deleteCategory(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadCategories() });
  }

  private loadCategories(): void {
    this.categoryService
      .getCategories({ pageSize: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.categories.set(res.content) });
  }
}
