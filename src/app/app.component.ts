import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { SnackbarComponent } from './shared/components/snackbar/snackbar.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, SnackbarComponent, ConfirmDialogComponent],
  template: `
    <app-loading />
    <app-snackbar />
    <app-confirm-dialog />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  ngOnInit(): void {
    this.themeService.init();
    this.languageService.init();
  }
}
