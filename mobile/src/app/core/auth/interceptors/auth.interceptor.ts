import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  return from(storage.getToken()).pipe(
    switchMap(token => {
      const request = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

      return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            void storage.clear()
              .then(() => {
                authState.clear();
                return router.navigateByUrl('/login', { replaceUrl: true });
              })
              .catch(clearError => {
                console.warn('[AUTH] No fue posible limpiar la sesión después de un 401:', clearError);
                authState.clear();
                void router.navigateByUrl('/login', { replaceUrl: true });
              });
          }
          return throwError(() => error);
        })
      );
    })
  );
};