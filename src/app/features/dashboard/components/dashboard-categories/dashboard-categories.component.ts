import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '@core/services/category.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { Category } from '@core/models/category.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { CategoryFormDialogComponent, CategoryFormData } from '../category-form-dialog/category-form-dialog.component';

@Component({
  selector: 'app-dashboard-categories',
  standalone: true,
  imports: [TranslateModule, EmptyStateComponent, CategoryFormDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'dashboard.categoriesManagement' | translate }}</h1>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          (click)="openAddDialog()"
        >
          {{ 'dashboard.addCategory' | translate }}
        </button>
      </div>

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
                        <button class="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-primary)]" (click)="openEditDialog(cat)">
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

      <app-category-form-dialog
        [visible]="showDialog()"
        [category]="editingCategory()"
        (saved)="onCategorySaved($event)"
        (closed)="showDialog.set(false); editingCategory.set(null)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<Category[]>([]);
  readonly showDialog = signal(false);
  readonly editingCategory = signal<Category | null>(null);

  ngOnInit(): void {
    this.loadCategories();
  }

  openAddDialog(): void {
    this.editingCategory.set(null);
    this.showDialog.set(true);
  }

  openEditDialog(cat: Category): void {
    this.editingCategory.set(cat);
    this.showDialog.set(true);
  }

  onCategorySaved(data: CategoryFormData): void {
    const editingId = this.editingCategory()?.id;

    const request$ = editingId
      ? this.categoryService.updateCategory(editingId, data)
      : this.categoryService.createCategory(data);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackbar.success(
          this.translate.instant(editingId ? 'snackbar.categoryUpdated' : 'snackbar.categoryCreated')
        );
        this.showDialog.set(false);
        this.editingCategory.set(null);
        this.loadCategories();
      },
    });
  }

  async deleteCategory(id: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.translate.instant('dialog.confirmDelete')
    );
    if (!confirmed) return;

    this.categoryService
      .deleteCategory(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('snackbar.categoryDeleted'));
          this.loadCategories();
        },
      });
  }

  private loadCategories(): void {
    this.categoryService
      .getCategories({ pageSize: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.categories.set(res.content) });
  }
}
