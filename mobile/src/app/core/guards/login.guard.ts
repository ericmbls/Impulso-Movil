import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StorageService } from '../services/storage.service';

export const loginGuard: CanActivateFn = async () => {

  const storage = inject(StorageService);
  const router = inject(Router);

  const token = await storage.getToken();

  if (token) {

    return router.createUrlTree(['/app/dashboard']);

  }

  return true;

};