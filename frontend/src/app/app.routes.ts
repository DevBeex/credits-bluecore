import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./features/credit-requests/pages/credit-requests.page').then(
            (m) => m.CreditRequestsPage,
          ),
      },
      { path: '', redirectTo: 'solicitudes', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];