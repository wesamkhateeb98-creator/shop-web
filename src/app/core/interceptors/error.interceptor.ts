import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { ApiError, extractValidationErrors } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';
import { SnackbarService } from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.includes('/api/');
  if (!isApiRequest) return next(req);

  const router = inject(Router);
  const authService = inject(AuthService);
  const snackbar = inject(SnackbarService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = error.error as ApiError | null;

      switch (error.status) {
        case 400: {
          const validationErrors = apiError
            ? extractValidationErrors(apiError)
            : null;
          if (validationErrors) {
            const messages = Object.values(validationErrors).flat();
            snackbar.error(messages[0] || translate.instant('snackbar.validationError'));
          } else {
            snackbar.error(
              apiError?.detail ?? apiError?.title ?? translate.instant('snackbar.badRequest')
            );
          }
          break;
        }

        case 401:
          snackbar.error(apiError?.title ?? translate.instant('snackbar.sessionExpired'));
          authService.logout();
          break;

        case 403:
          snackbar.error(apiError?.title ?? translate.instant('snackbar.accessDenied'));
          router.navigate(['/']);
          break;

        case 404:
          snackbar.error(apiError?.title ?? translate.instant('snackbar.notFound'));
          break;

        case 412:
          snackbar.error(apiError?.title ?? translate.instant('snackbar.preconditionFailed'));
          break;

        case 0:
          snackbar.error(translate.instant('snackbar.connectionError'));
          break;

        case 500:
        default:
          snackbar.error(
            apiError?.detail ?? translate.instant('snackbar.serverError')
          );
          break;
      }

      return throwError(() => error);
    })
  );
};
