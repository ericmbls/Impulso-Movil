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
    path: 'app',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/home/home.component')
            .then(m => m.HomeComponent),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];