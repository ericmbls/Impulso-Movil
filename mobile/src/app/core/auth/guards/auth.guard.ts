// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { User } from '@core/auth/models/user';

export const authGuard: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const token = await storage.getToken();
  const user = await storage.getUser<User>();

  if (!token || !user) {
    await storage.clear();
    authState.clear();
    return router.createUrlTree(['/login']);
  }

  authState.setUser(user);
  return true;
};