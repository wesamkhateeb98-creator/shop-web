import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4">
      <div class="w-full max-w-md">
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-[var(--color-primary)]">ShopWeb</h1>
            <p class="text-sm text-[var(--color-text-secondary)] mt-2">
              {{ 'auth.signupSubtitle' | translate }}
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <!-- Username -->
            <div class="mb-4">
              <label for="username" class="block text-sm font-medium mb-1.5">
                {{ 'auth.username' | translate }}
              </label>
              <input
                id="username"
                type="text"
                formControlName="username"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                [placeholder]="'auth.usernamePlaceholder' | translate"
              />
            </div>

            <!-- Phone Number -->
            <div class="mb-4">
              <label for="phoneNumber" class="block text-sm font-medium mb-1.5">
                {{ 'auth.phoneNumber' | translate }}
              </label>
              <input
                id="phoneNumber"
                type="tel"
                formControlName="phoneNumber"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                [placeholder]="'auth.phoneNumberPlaceholder' | translate"
              />
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label for="password" class="block text-sm font-medium mb-1.5">
                {{ 'auth.password' | translate }}
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                [placeholder]="'auth.passwordPlaceholder' | translate"
              />
            </div>

            <!-- Error message -->
            @if (errorMessage()) {
              <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-[var(--color-danger)]">
                {{ errorMessage() }}
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              class="w-full py-2.5 px-4 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75" />
                  </svg>
                  {{ 'auth.creatingAccount' | translate }}
                </span>
              } @else {
                {{ 'auth.signUp' | translate }}
              }
            </button>
          </form>

          <!-- Login link -->
          <p class="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            {{ 'auth.haveAccount' | translate }}
            <a routerLink="/auth/login" class="text-[var(--color-primary)] font-medium hover:underline">
              {{ 'auth.signIn' | translate }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly signupForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { username, phoneNumber, password } = this.signupForm.getRawValue();

    this.authService
      .signup({ username, phoneNumber, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const route = response.role === 1 ? '/dashboard' : '/';
          this.router.navigate([route]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Registration failed. Please try again.');
        },
      });
  }
}
