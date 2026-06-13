import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent),
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/home/home.component')
        .then(m => m.HomeComponent),
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];