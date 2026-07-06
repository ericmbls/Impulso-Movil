import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },

  {
    path: 'welcome',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/welcome/welcome.component')
        .then(c => c.WelcomeComponent)
  },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(c => c.LoginComponent)
  },

  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/tabs-layout/tabs-layout.component')
        .then(c => c.TabsLayoutComponent),

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/home/home.component')
            .then(c => c.HomeComponent)
      },

      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/schedule/pages/schedule/schedule.component')
            .then(c => c.ScheduleComponent)
      },

      {
        path: 'qr-check',
        loadComponent: () =>
          import('./features/qr-check/pages/qr-check/qr-check.component')
            .then(c => c.QrCheckComponent)
      },

      {
        path: 'teacher-scanner',
        loadComponent: () =>
          import('./features/teacher-scanner/pages/scanner/scanner.component')
            .then(c => c.ScannerComponent)
      },

      {
        path: 'grades',
        loadComponent: () =>
          import('./features/grades/pages/grades/grades.component')
            .then(c => c.GradesComponent)
      },

      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/pages/attendance/attendance.component')
            .then(c => c.AttendanceComponent)
      },

      {
        path: 'credential',
        loadComponent: () =>
          import('./features/credential/pages/credential/credential.component')
            .then(c => c.CredentialComponent)
      },

      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/pages/notifications/notifications.component')
            .then(c => c.NotificationsComponent)
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.component')
            .then(c => c.ProfileComponent)
      }

    ]

  },

  {
    path: '**',
    redirectTo: 'welcome'
  }

];