import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },

  {
    path: 'welcome',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/welcome/welcome.component')
        .then(m => m.WelcomeComponent),
  },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent),
  },

  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/tabs-layout/tabs-layout.component')
        .then(m => m.TabsLayoutComponent),

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

      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/schedule/pages/schedule/schedule.component')
            .then(m => m.ScheduleComponent),
      },

      {
        path: 'qr-check',
        loadComponent: () =>
          import('./features/qr-check/pages/qr-check/qr-check.component')
            .then(m => m.QrCheckComponent),
      },

      {
        path: 'grades',
        loadComponent: () =>
          import('./features/grades/pages/grades/grades.component')
            .then(m => m.GradesComponent),
      },

      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/pages/attendance/attendance.component')
            .then(m => m.AttendanceComponent),
      },

      {
        path: 'credential',
        loadComponent: () =>
          import('./features/credential/pages/credential/credential.component')
            .then(m => m.CredentialComponent),
      },

      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/pages/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.component')
            .then(m => m.ProfileComponent),
      }

    ]

  },

  {
    path: '**',
    redirectTo: 'welcome',
  }

];