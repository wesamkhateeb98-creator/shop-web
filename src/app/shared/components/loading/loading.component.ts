import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (loadingService.isLoading()) {
      <div class="spinner-overlay">
        <div class="spinner"></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  protected readonly loadingService = inject(LoadingService);
}
