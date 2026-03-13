import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SnackbarService } from '@core/services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  template: `
    <div class="fixed bottom-4 end-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      @for (msg of snackbarService.messages(); track msg.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in"
          [class]="typeClasses(msg.type)"
        >
          <!-- Icon -->
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @switch (msg.type) {
              @case ('success') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              }
              @case ('error') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              }
              @case ('warning') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              }
              @case ('info') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            }
          </svg>

          <span class="flex-1">{{ msg.text }}</span>

          <!-- Dismiss -->
          <button
            class="shrink-0 p-0.5 rounded hover:opacity-80 transition-opacity"
            (click)="snackbarService.dismiss(msg.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(1rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-slide-in {
      animation: slide-in 0.25s ease-out;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
  protected readonly snackbarService = inject(SnackbarService);

  typeClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  }
}
