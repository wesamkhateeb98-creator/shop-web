import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (dialogService.visible()) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        (click)="dialogService.cancel()"
      >
        <div
          class="w-full max-w-sm rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-xl p-6"
          (click)="$event.stopPropagation()"
        >
          <!-- Warning icon -->
          <div class="flex justify-center mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg class="w-6 h-6 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          <!-- Message -->
          <p class="text-center text-sm font-medium mb-6">
            {{ dialogService.message() }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              (click)="dialogService.cancel()"
            >
              {{ 'dialog.cancel' | translate }}
            </button>
            <button
              class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-[var(--color-danger)] text-white hover:opacity-90 transition-opacity"
              (click)="dialogService.accept()"
            >
              {{ 'dialog.confirm' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly dialogService = inject(ConfirmDialogService);
}
