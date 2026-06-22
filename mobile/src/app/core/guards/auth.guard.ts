import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StorageService } from '../services/storage.service';
import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = async () => {

  const storage = inject(StorageService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const token = await storage.getToken();
  const user = await storage.getUser();

  if (!token || !user) {

    authState.clear();

    return router.createUrlTree(['/login']);

  }

  authState.setUser(user);

  return true;

};