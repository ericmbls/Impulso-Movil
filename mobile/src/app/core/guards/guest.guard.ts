import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StorageService } from '../services/storage.service';

export const guestGuard: CanActivateFn = async () => {

  const storage = inject(StorageService);
  const router = inject(Router);

  const logged = await storage.isLoggedIn();

  if (logged) {
    return router.createUrlTree(['/app/dashboard']);
  }

  return true;

};