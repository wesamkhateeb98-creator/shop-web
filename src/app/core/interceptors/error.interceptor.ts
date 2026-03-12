import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError, extractValidationErrors } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = error.error as ApiError | null;

      switch (error.status) {
        case 400: {
          const validationErrors = apiError
            ? extractValidationErrors(apiError)
            : null;
          if (validationErrors) {
            console.error('[Validation Errors]', validationErrors);
          } else {
            console.error(
              '[Bad Request]',
              apiError?.detail ?? apiError?.title ?? 'Bad request'
            );
          }
          break;
        }

        case 401:
          console.error('[Unauthorized]', apiError?.detail ?? 'Unauthorized');
          authService.logout();
          break;

        case 403:
          console.error(
            '[Forbidden]',
            apiError?.detail ?? 'Access denied'
          );
          router.navigate(['/']);
          break;

        case 404:
          console.error(
            '[Not Found]',
            apiError?.detail ?? 'Resource not found'
          );
          break;

        case 500:
        default:
          console.error(
            '[Server Error]',
            apiError?.detail ?? 'An unexpected server error occurred'
          );
          break;
      }

      return throwError(() => error);
    })
  );
};
