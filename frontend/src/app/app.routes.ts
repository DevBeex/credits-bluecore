import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
];