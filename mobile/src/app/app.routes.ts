import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';
import { guestGuard } from '@core/auth/guards/guest.guard';

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
      import(
        '@features/auth/pages/welcome/welcome.component'
      ).then(
        module =>
          module.WelcomeComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import(
        '@features/auth/pages/login/login.component'
      ).then(
        module =>
          module.LoginComponent,
      ),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import(
        '@layouts/tabs-layout/tabs-layout.component'
      ).then(
        module =>
          module.TabsLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            '@features/dashboard/pages/home/home.component'
          ).then(
            module =>
              module.HomeComponent,
          ),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import(
            '@features/schedule/pages/schedule/schedule.component'
          ).then(
            module =>
              module.ScheduleComponent,
          ),
      },
      {
        path: 'qr-check',
        loadComponent: () =>
          import(
            '@features/qr-check/pages/qr-check/qr-check.component'
          ).then(
            module =>
              module.QrCheckComponent,
          ),
      },
      {
        path: 'grades',
        loadComponent: () =>
          import(
            '@features/grades/pages/grades/grades.component'
          ).then(
            module =>
              module.GradesComponent,
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import(
            '@features/attendance/pages/attendance/attendance.component'
          ).then(
            module =>
              module.AttendanceComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import(
            '@features/notifications/pages/notifications/notifications.component'
          ).then(
            module =>
              module.NotificationsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            '@features/profile/pages/profile/profile.component'
          ).then(
            module =>
              module.ProfileComponent,
          ),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'welcome',
  },
];